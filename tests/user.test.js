const it = require("ava").default;
const chai = require("chai");
var expect = chai.expect;
const startDB = require('../helpers/DB');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addUser, getAllUsers, getSingleUser, deleteUser } = require('../index'); 

const User = require('../models/user');
const sinon = require("sinon");
const utils = require('../helpers/utils')
it.before(async (t)=>{
    t.context.mongod = await MongoMemoryServer.create();
    process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
    await startDB();
});
it.beforeEach(async (t) => {
  await User.deleteMany({}); 
});
it.after.always(async (t) => {
  await t.context.mongod.stop();
});

it("create use succesfully", async (t) => {
  // setup
  const request = {
    body: {
      firstName: "Menna",
      lastName: "Hamdy",
      age: 11,
      job: "fs",
    },
  };
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };
//   sinon.stub(utils, 'getFullName').returns('Menna Hamdy');
  // sinon.stub(utils, 'getFullName').callsFake((fname, lname)=>{
  //   expect(fname).to.be.equal(request.body.firstName);
  //   expect(lname).to.be.equal(request.body.lastName);
  //   return 'Menna Hamdy'
  // })
  const actualResult = await addUser(request);
  const result = {
    ...expectedResult,
    __v: actualResult.__v,
    _id: actualResult._id
  }
  expect(actualResult).to.be.a('object');
  expect(actualResult._doc).to.deep.equal(result);
  t.teardown(async () => {
    await User.deleteMany({  fullName: request.body.fullName, })
  })
  t.pass();
});

//---------------Lab--------------------

// getUsers
it("get Users successfully", async (t) => {
  // setup
  const user1 = await addUser({
    body: {
      firstName: "Noran",
      lastName: "Zaki",
      age: 22,
      job: "Devops Engineer",
    },
  });
  const user2 = await addUser({
    body: {
      firstName: "Nora",
      lastName: "Zaky",
      age: 22,
      job: "Unemployed",
    },
  });
  const user3 = await addUser({
    body: {
      firstName: "Noraaan",
      lastName: "Zaki",
      age: 22,
      job: "Engineer",
    },
  });
  
  const actualResult = await getAllUsers();
  expect(actualResult).to.be.an('array');
  expect(actualResult.length).to.be.at.least(2); 
 
  t.pass();
});

// getSingleUser
it("get Single User successfully", async (t) => {
  // Setup
  const user = await addUser({
    body: {
      firstName: "Nour",
      lastName: "Zaky",
      age: 22,
      job: "Engineer",
    },
  });

  const request = { params: { id: user._id } };
  const response = await getSingleUser(request);

  expect(response).not.to.be.null; 
  expect(response._id.toString()).to.equal(user._id.toString());

  t.pass();
});

// deleteUser
it("delete User successfully", async (t) => {
  // Setup
  const user = await addUser({
    body: {
      firstName: "Nora",
      lastName: "Mohamed",
      age: 22,
      job: "Unemployed",
    },
  });
  const request = { params: { id: user._id } };
  await deleteUser(request);
  
  const deletedUser = await User.findOneAndDelete({ _id: user._id });
  expect(deletedUser).to.not.be.null;

  t.pass();
});

