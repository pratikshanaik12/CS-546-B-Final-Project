const mongoCollections = require('../config/mongoCollections');
const propertyData = require('./properties');
//const studentData = require('./students');
const properties = mongoCollections.properties;
const owners = mongoCollections.owners;
const students = mongoCollections.students;
const validate = require("../helpers");
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const { ObjectId } = require('mongodb');
const axios = require('axios');
require("dotenv/config");
//const { properties } = require('../config/mongoCollections');
const saltRounds = 10;

const createUser = async (emailId, password, firstName, lastName, contact, gender, city, state, age) => {
    validate.validateRegistration(emailId,password,firstName,lastName,contact,gender,city,state,age);
    emailId=emailId.trim().toLowerCase();
    password=password.trim();
    firstName=firstName.trim();
    lastName=lastName.trim();
    contact=contact.trim();
    gender=gender.trim();
    city=city.trim();
    state=state.trim();
    age=age.trim();
    let hash = await bcrypt.hash(password, saltRounds);
    const ownerCollection = await owners();
    const user = await ownerCollection.findOne({
      emailId: emailId
    });
    if(user!=null){
      if(user.emailId.toLowerCase()===emailId.toLowerCase()){
        throw "user with that email already exists";
      }
    }
    let newUser={
      emailId:emailId,
      hashedPassword:hash,
      firstName:firstName,
      lastName:lastName,
      contact:contact,
      gender:gender,
      city:city,
      state:state,
      age:age,
      properties:[]
    }
    const insertInfo = await ownerCollection.insertOne(newUser);
      if (!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Error : Could not add owner';
      }
    return newUser;
  };

const checkUser = async (emailId, password) => {

    validate.validateUser(emailId,password);
    emailId=emailId.trim().toLowerCase();
    password=password.trim();
    const ownerCollection = await owners();
    const user = await ownerCollection.findOne({
      emailId: emailId
    });
    if(user===null){
      throw "Either the email or password is invalid";
    }
    let compare = await bcrypt.compare(password, user.hashedPassword);
    if(!compare){
      throw "Either the email or password is invalid";
    }
    return user;
  };

const getAllOwners = async () => {
    const ownerCollection = await owners();
    const ownerList = await ownerCollection.find({}).toArray();
    if (!ownerList) throw 'Error : Could not get all owners';
    return ownerList;
};

const getOwnerByEmail = async (emailId) => {
    validate.validateEmail(emailId);
    emailId=emailId.trim().toLowerCase();
    const ownerCollection = await owners();
    const owner = await ownerCollection.findOne({
      emailId: emailId
    });
    return owner;
}

const updateOwnerDetails = async (emailId, firstName, lastName, contact, gender, city, state, age) => {
    // we are using emailid to uniquely identify a user to use that while updating user data
    validate.validateUpdate(emailId,firstName,lastName,contact,gender,city,state,age);
    emailId=emailId.trim().toLowerCase();
    firstName=firstName.trim();
    lastName=lastName.trim();
    contact=contact.trim();
    gender=gender.trim();
    city=city.trim();
    state=state.trim();
    age=age.trim();

    let oldOwner = await getOwnerByEmail(emailId);
    let properties = oldOwner.properties;
    
    let ownerUpdateInfo = {
      emailId: emailId,
      hashedPassword: oldOwner.hashedPassword,
      firstName: firstName,
      lastName: lastName,
      contact: contact,
      gender: gender,
      city: city,
      state: state,
      age: age,
      properties: properties
  }

  const ownerCollection = await owners();
  const ownerUpdatedInfo = await ownerCollection.updateOne(
    {emailId: emailId},
    {$set: ownerUpdateInfo}
  );

  if (ownerUpdatedInfo.modifiedCount === 0) {
    throw 'Could not update the owner profile';
  }

  return await getOwnerByEmail(emailId);

}

const deleteOwner = async (emailId) => {

  validate.validateEmail(emailId);

  const ownerCollection = await owners();

  let owner = await getOwnerByEmail(emailId);
  let ownerProp = owner.properties;

  for(i=0;i<ownerProp.length;i++){
    await propertyData.removeProperty(ownerProp[i], emailId);
  }

  const removeInfo = await ownerCollection.deleteOne({emailId: emailId});

  if (removeInfo.deletedCount === 0) {
    throw `Could not delete the Owner`;
  }

  return {deleted: true};

}

const editProp = async (id,images, address, description, laundry, rent, listedBy, emailId, area, bed, bath) => {
  validate.checkId(id);
  validate.validateProperty(address,description,laundry,rent,listedBy,emailId,area,bed,bath);
    
  let imageBuffer=[];
  let result;
  if(images.length>0){
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
  let distance = validate.getDistanceFromLatLonInMi(stevensLat,stevensLng,addresLat,addresLng);
  distance=Number(distance.toFixed(2));
  
  const owner = await getOwnerByEmail(emailId);
  let oldproperty = owner.properties;
  for(i=0; i<oldproperty.length; i++){
    if(id === oldproperty[i]){
      const property = await propertyData.getPropertyById(id);

      let oldComment = property.comments;
      let oldImages = property.images;
      for(let i=0;i<oldImages.length;i++){
        imageBuffer.push(oldImages[i]);
      }
      let current = new Date();
      let dateListed = (current.getMonth()+1)+"/"+current.getDate()+"/"+current.getFullYear();

      const updateProperty={
          _id: ObjectId(id),
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
          comments:oldComment
      }

      const propertyCollection = await properties();
      const propertyUpdatedInfo = await propertyCollection.updateOne(
        {_id: ObjectId(id)},
        {$set: updateProperty}
      );
    
      if (propertyUpdatedInfo.modifiedCount === 0) {
        throw 'could not update the property';
      }
    
      return await propertyData.getPropertyById(id);
    }
  }
}

  


module.exports = {
    checkUser,
    createUser,
    getAllOwners,
    getOwnerByEmail,
    updateOwnerDetails,
    deleteOwner,
    editProp
}
