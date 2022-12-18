const mongoCollections = require('../config/mongoCollections');
const properties = mongoCollections.properties;
const owners = mongoCollections.owners;
const { students } = require('../config/mongoCollections');
const { ObjectId, ServerApiVersion } = require("mongodb");

const validate = require("../helpers");
const index = require('./index');

const cloudinary = require('../config/cloudinary');
const { default: axios } = require('axios');
require("dotenv/config");



const createProperty = async (images,address, description, laundry, rent, listedBy, emailId, area, bed, bath) => {
    validate.validateProperty(address,description,laundry,rent,listedBy,emailId,area,bed,bath);

    //covert base64 encoded image to respective URL, these URL can be used to display images
    let imageBuffer=[];
    let result;
    for(let i=0;i<images.length;i++){
        result = await cloudinary.uploader.upload(images[i],{
            //uploaded images are stored in sanjan's cloudinary account under uploads folder
            folder: "uploads",
            //width and crop to alter image size, not needed right now, will uncomment if needed in future
            // width:300,
            // crop:"scale"
        });
        imageBuffer.push({
            _id: new ObjectId(),
            url: result.secure_url
        })
    };

    const ownerCollection = await owners();
    const userOwner = await ownerCollection.findOne({
      emailId: emailId
    });

    if(!userOwner||userOwner==null){
        throw "Error : Owner Not Found";
    }
    
    address=address.trim()
    description=description.trim()
    laundry=laundry.trim()
    rent=rent.trim()
    listedBy=listedBy.trim()
    emailId=emailId.trim()
    area=area.trim()
    bed=bed.trim()
    bath=bath.trim()

    rent=Number(rent);
    area=Number(area);
    bed=Number(bed);
    bath=Number(bath);

    let current = new Date();
    let dateListed = (current.getMonth()+1)+"/"+current.getDate()+"/"+current.getFullYear();
    //distance calulation logic
    let formattedAddress;
    let response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
        params:{
            address:address,
            key:'AIzaSyD8FReQh61YLuQP68YvmQveuU7dY3LVC9w'
        }
    });
    formattedAddress=response.data.results[0].formatted_address
    addresLat=response.data.results[0].geometry.location.lat;
    addresLng=response.data.results[0].geometry.location.lng;

    const stevensLat = 40.744838;
    const stevensLng = -74.025683;
    let distance = getDistanceFromLatLonInMi(stevensLat,stevensLng,addresLat,addresLng);
    distance=Number(distance.toFixed(2));
    
    // getDistanceFromLatLonInMi : https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
    
    function getDistanceFromLatLonInMi(lat1, lon1, lat2, lon2) {
        var R = 3958.8; // Radius of the earth in Miles
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in Miles
        return d;
        }

        function deg2rad(deg) {
        return deg * (Math.PI/180)
        }
    //
    const propertyCollection = await properties();
    const propertyExist = await propertyCollection.findOne({
        address: formattedAddress
      });
    if(propertyExist!=null || propertyExist!=undefined){
        if(propertyExist.address===formattedAddress){
            throw "Error : Property already exists";
        }
    }

    const newProperty={
        images:imageBuffer,
        address:formattedAddress,
        description:description,
        laundry:laundry,
        dateListed:dateListed,
        rent:rent,
        listedBy:listedBy,
        emailId:emailId,
        area:area,
        bed:bed,
        bath:bath,
        distance:distance,
        comments:[]
    }
    
    const insertInfo = await propertyCollection.insertOne(newProperty);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Error : Could not add property';

    let newId = insertInfo.insertedId.toString();

    //add property to owner's property array

    const updatedInfo = await ownerCollection.updateOne(
        {emailId: emailId},
        {$addToSet: {properties:newId}}
    );

    if (updatedInfo.modifiedCount === 0) {
        throw 'Error : could not add property to owner collection';
    }
    
    return newId
}

const getAllProperties = async () => {
    const propertyCollection = await properties();
    const propertyList = await propertyCollection.find({}).toArray();
    if (!propertyList) throw 'Internal server error, could not get all properties';
    return propertyList;
}


const getAllPropertiesByUser = async (idArray) => {
    for(let i = 0; i<idArray.length; i++) {
        validate.checkId(idArray[i]);
    }
    const propertyCollection = await properties();
    const propertyList = await propertyCollection.find({}).toArray();
    if (!propertyList) throw 'Internal server error, could not get all properties';
    let ansList = [];
    
    for(let i = 0; i<idArray.length; i++) {
        idArray[i] = idArray[i].toString();
    }

    for(let i = 0; i<propertyList.length; i++) {
        if(idArray.includes(propertyList[i]._id.toString())) ansList.push(propertyList[i]);
    }
    return ansList;
}


const getPropertyById = async (id) => {
    id = validate.checkId(id);
    const propertyCollection = await properties();
    const propertyExist = await propertyCollection.findOne({
        _id: ObjectId(id)
      });
    if(!propertyExist) throw "No property with this ID found";
    return propertyExist;
}

const removeProperty = async (id, emailId) => {
    validate.checkId(id);
    validate.validateEmail(emailId);

    const propertyCollection = await properties();
    const deletionInfo = await propertyCollection.deleteOne(
        {_id: ObjectId(id)}
    );

    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete property with id of ${id}`;
    }

    emailId=emailId.trim().toLowerCase();
    const ownerCollection = await owners();
    const ownerData = await ownerCollection.findOne({
      emailId: emailId
    });
    
    let ownerPropertyListArr = ownerData.properties;
    for(let i = 0; i<ownerPropertyListArr.length; i++) {
        if(ownerPropertyListArr[i].toString() == id) {
            ownerPropertyListArr.splice(i, 1);
        }
    }

    let ownerUpdateInfo = {
        emailId: ownerData.emailId,
        hashedPassword: ownerData.hashedPassword,
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        contact: ownerData.contact,
        gender: ownerData.gender,
        city: ownerData.city,
        state: ownerData.state,
        age: ownerData.age,
        properties: ownerPropertyListArr
    }

    const ownerUpdatedInfo = await ownerCollection.updateOne(
        {emailId: emailId},
        {$set: ownerUpdateInfo}
    );

    if (ownerUpdatedInfo.modifiedCount === 0) {
        throw 'Could not update the owner profile';
    }

    // delete from student favourite list  

    const studentCollection = await students();
    const studentData = await studentCollection.find({}).toArray();
    if(studentData.length>0){
        studentData.forEach(studentuser=>{
            if(studentuser.favourites.length>0){
                studentuser.favourites.forEach(async favId=>{
                    if(favId===id){
                        const updatedInfo = await studentCollection.updateOne({
                            emailId:studentuser.emailId
                        },{
                            $pull:{favourites:favId}
                        });
                        if (updatedInfo.modifiedCount === 0) {
                            throw 'Error : could not delete image';
                        }  
                    }
                })
            }
        })
    }
}

const removePropertybyEmail = async (emailId) => {
    validate.validateEmail(emailId);
    const propertyCollection = await properties();
    const deletionInfo = await propertyCollection.deleteOne({emailId: emailId});

    if(deletionInfo.deletedCount === 0) {
        throw `Could not delete property with email of ${emailId}`
    }
}

const createComment = async (id,emailId,firstName,lastName, comment) => {
    id = validate.checkId(id);
    emailId = validate.checkEmail(emailId);
    let fullName = validate.validateFullName(firstName,lastName);
    comment = validate.checkComment(comment);
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const propertyCollection = await properties();
    let newUpdate = {
        _id: new ObjectId(),
        dateTime:date+" "+time,
        fullName,
        emailId:emailId,
        comment
    }
    const updatedInfo = await propertyCollection.updateOne(
        {_id: ObjectId(id)},
        {$addToSet: {comments: newUpdate}}
    );

    if (updatedInfo.modifiedCount === 0) {
        throw 'Error : could not add comment to property collection';
    }
}

let sorted = [];
let last = [false, false];
const getSortedData = async (txt) => {
    let tempData;
    if(last[0] == true && sorted.length != 0 && txt != "0")  tempData = sorted;
    else {
        tempData = await getAllProperties();
        last = [false, false];
    }
    sorted = [];
    if(txt == "1") {
        sorted = tempData.sort(function (a, b) {
            return a.rent - b.rent;
        });
    }
    else if(txt == "2") {
        sorted = tempData.sort(function (a, b) {
            return b.rent - a.rent;
        });
    }
    else if(txt == "3") {
        sorted = tempData.sort(function (a, b) {
            return a.distance - b.distance;
        });
    }
    else if(txt == "4") {
        sorted = tempData.sort(function (a, b) {
            return b.distance -  a.distance;
        });
    }
    else {
        sorted = tempData;
    }
    if(sorted.length != 0) last[1] = true;
    else last[1] = false;
    return sorted;
}

const getBedBath = async (bedVal, bathVal) => {
    let tempData;
    if(last[0] != true && last[1] == true && sorted.length != 0)  tempData = sorted;
    else {
        tempData = await getAllProperties();
        last = [false, false];
    }
    sorted = [];
    for(let i = 0; i<tempData.length; i++) {
        if(tempData[i].bed == bedVal && tempData[i].bath == bathVal) {
            sorted.push(tempData[i]);
        }
    }
    if(sorted.length != 0) last[0] = true;
    else last[0] = false;
    return sorted;
}

const searchProp = async (search) => {
    try {
        if (!search) throw new Error('You must provide text to search');    
        if (typeof search !== 'string') throw new TypeError('search must be a string');

        let prop = search.toLowerCase();
        let num = Number(prop.replace(/[a-zA-Z ]/g,""));
        let regex = new RegExp([".*", prop, ".*"].join(""), "i");
        const propertyCollection = await properties();
        const searchPropresults = await propertyCollection.find({ $or: [{ "address": regex }, { "description": regex }, { "laundry": regex },{ "dateListed": regex }, {"rent":{$eq: num}},{ "listedBy": regex },{ "emailId": regex },{"area":{$eq: num}}, { "bed": {$eq: num} }, { "bath": {$eq: num} }, {"distance": {$eq: num}}] }).toArray();
        return searchPropresults;
    } catch (err) {
        throw err;
    }
}

const deleteImage = async (id) => {
    id=validate.checkId(id);
    id=id.toString();    
    const propertyCollection = await properties();
    const propList = await propertyCollection.find({}).toArray();
    let propId;
    propList.forEach(prop=>{
        prop.images.forEach(img=>{
            img._id=img._id.toString();
            if(id===img._id){
                propId=prop._id;
            }
        })
    })
    if(!propId){
        throw "Error : no such image exists";
    }
    const updatedInfo = await propertyCollection.updateOne({
        _id:ObjectId(propId)
    },{
        $pull:{images:{_id:ObjectId(id)}}
    });
    if (updatedInfo.modifiedCount === 0) {
        throw 'Error : could not delete image';
    }
    return propId.toString();
}

module.exports={
    createProperty,
    getAllProperties,
    getPropertyById,
    getAllPropertiesByUser,
    createComment,
    removeProperty,
    searchProp,
    removePropertybyEmail,
    getSortedData,
    deleteImage,
    getBedBath
}