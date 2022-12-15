const mongoCollections = require('../config/mongoCollections');
const students = mongoCollections.students;
const validate = require("../helpers");
const bcrypt = require('bcryptjs');
const { ObjectId } = require("mongodb");
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
    const studentCollection = await students();
    const user = await studentCollection.findOne({
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
      favourites:[]
    }
    const insertInfo = await studentCollection.insertOne(newUser);
      if (!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Error : Could not add owner';
      }
    return newUser;
  };

  const checkUser = async (emailId, password) => {

    validate.validateUser(emailId,password);
    emailId=emailId.trim().toLowerCase();
    password=password.trim();
    const studentCollection = await students();
    const user = await studentCollection.findOne({
      emailId: emailId
    });
    if(user===null){
      throw "Either the email or password is invalid";
    }
    let compare=false;
    compare = await bcrypt.compare(password, user.hashedPassword);
    if(!compare){
      throw "Either the email or password is invalid";
    }
    return user;
  };

const getAllStudent = async () => {
    const studentCollection = await students();
    const studentList = await studentCollection.find({}).toArray();
    if (!studentList) throw 'Error : Could not get all students';
    return studentList;
};

const getStudentByEmail = async (emailId) => {
  validate.validateEmail(emailId);
  emailId=emailId.trim().toLowerCase();
  const studentCollection = await students();
  const student = await studentCollection.findOne({
    emailId: emailId
  });
  return student;
}


const updateStudentDetails = async (emailId, firstName, lastName, contact, gender, city, state, age) => {
  // we are using emailid to uniquely identify a user to use that while updating user data

  //validate.validateEmail(emailId);
  validate.validateUpdate(emailId,firstName,lastName,contact,gender,city,state,age);
  emailId=emailId.trim().toLowerCase();
  firstName=firstName.trim();
  lastName=lastName.trim();
  contact=contact.trim();
  gender=gender.trim();
  city=city.trim();
  state=state.trim();
  age=age.trim();
  let oldStudent = await getStudentByEmail(emailId);
  let favourites = oldStudent.favourites;

  //validations!!!
  const studentCollection = await students();
  const updatedStudent = {
    emailId: emailId,
    hashedPassword: oldStudent.hashedPassword,
    firstName: firstName,
    lastName: lastName,
    contact: contact,
    gender: gender,
    city: city,
    state: state,
    age: age,
    favourites:favourites
  };

  const updatedInfo = await studentCollection.updateOne(
    {emailId: emailId},
    {$set: updatedStudent}
  );

  if (updatedInfo.modifiedCount === 0) {
    throw 'Could not update Student details';
  }

  return await getStudentByEmail(emailId);
};

const deleteStudent = async(emailId) => {
  const studentCollection = await students();
  //const student = await getStudentByEmail(emailId);
  const deletionInfo = await studentCollection.deleteOne({emailId: emailId});

  if (deletionInfo.deletedCount === 0) {
    throw `Could not remove user with emailid of ${emailId}`;
  }  

  return 'User has been successfully deleted!';
};

const addFavouriteProperty = async(emailId, id) =>{
  id = validate.checkId(id);
  validate.validateEmail(emailId);
  const studentCollection = await students();

  //if fav already exists, show alert
  let studentData = await studentCollection.findOne({emailId: emailId});
  if(studentData.favourites.includes(id)){
    throw 'Property already exists in favourites!';
  }

  const favouritesInfo = await studentCollection.updateOne({emailId: emailId}, {$push: {favourites: id}});

  if (favouritesInfo.modifiedCount === 0) {
    throw 'Could not add to favourites.';
  }

  return await getStudentByEmail(emailId);
};

const removeFavouriteProperty = async(emailId, id) =>{
  id = validate.checkId(id);
  emailId = validate.validateEmail(emailId);
  const studentCollection = await students();

  const favouritesInfo = await studentCollection.updateOne({emailId: emailId}, {$pull: {favourites: id}});

  if (favouritesInfo.modifiedCount === 0) {
    throw 'Could not remove from Student favourite properties';
  }

  return await getStudentByEmail(emailId);
};

// const removeFavouritePropertiesById = async(idArray) =>{
//   for(let i = 0; i<idArray.length; i++) {
//     idArray[i] = idArray[i].toString();
//   }
//   const studentCollection = await students();

//   for(i=0; i<idArray.length; i++){
//     await studentCollection.updateOne({$pull: {favourites: idArray[i]}});
//   }

//   // if (favouritesInfo.modifiedCount === 0) {
//   //   throw 'Could not remove from Student favourite properties';
//   // }

//   return {deleted: true};
// };

module.exports = {
    checkUser,
    createUser,
    getAllStudent,
    getStudentByEmail,
    updateStudentDetails,
    deleteStudent,
    addFavouriteProperty,
    removeFavouriteProperty,
    //removeFavouritePropertiesById
}


//Things left to do
// student should be able to edit his details -- Done
// student should be able to delete his account -- Done
// student should be able to add property to favourites --Done