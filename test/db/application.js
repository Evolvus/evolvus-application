const debug = require("debug")("evolvus-application.test.db.application");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const application = require("../../db/application");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204/TestPlatform_Dev";

chai.use(chaiAsPromised);

// High level wrapper
// Testing db/application.js
describe("db application testing", () => {
  /*
   ** Before doing any tests, first get the connection.
   */
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      debug("ok got the connection");
      done();
    });
  });

  let object1 = {
    // add a valid application object
    tenantId: "IVL",
    applicationName: "Docket",
    applicationCode: "Dock",
    createdBy: "Kavya",
    createdDate: new Date().toISOString()
  };
  let object2 = {
    // add a valid application object
    tenantId: "IVL",
    applicationName: "Sprint",
    applicationCode: "Spri",
    createdBy: "Srihari",
    createdDate: new Date().toISOString()
  };
  let object3 = {
    // add a valid application object
    tenantId: "IVL",
    applicationName: "Combat",
    applicationCode: "COM",
    createdBy: "Kavya",
    createdDate: new Date().toISOString()
  };

  describe("testing application.save", () => {
    // Testing save
    // 1. Valid application should be saved.
    // 2. Non application object should not be saved.
    // 3. Should not save same application twice.
    beforeEach((done) => {
      application.deleteAll()
        .then((data) => {
          done();
        });
    });

    it("should save valid application to database", (done) => {
      let testapplicationCollection = {
        // add a valid application object
        tenantId: "IVL",
        applicationName: "FLUX CDA",
        applicationCode: "CDA",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      };
      let res = application.save(testapplicationCollection);
      expect(res)
        .to.eventually.have.property("_id")
        .notify(done);
    });

    it("should fail saving invalid object to database", (done) => {
      // not even a  object
      let invalidObject = {
        // add a invalid application object
        tenantId: "IVL",
        applicationName: "Docket",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      };
      let res = application.save(invalidObject);
      expect(res)
        .to.be.eventually.rejectedWith("applicationCollection validation failed")
        .notify(done);
    });
  });

  describe("testing application.findAll by limit", () => {
    // 1. Delete all records in the table and insert
    //    4 new records.
    // find -should return an array of size equal to value of limit with the
    // roleMenuItemMaps.
    // Caveat - the order of the roleMenuItemMaps fetched is indeterminate

    // delete all records and insert four roleMenuItemMaps
    beforeEach((done) => {
      application.deleteAll().then(() => {
        application.save(object1).then((res) => {
          application.save(object2).then((res) => {
            application.save(object3).then((res) => {
              done();
            });
          });
        });
      });
    });

    it("should return limited number of records", (done) => {
      let res = application.findAll(3);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(3);
          expect(docs[0])
            .to.have.property("tenantId")
            .to.equal("IVL");
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });

    it("should return all records if value of limit parameter is less than 1 i.e, 0 or -1", (done) => {
      let res = application.findAll(-1);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(3);
          expect(docs[0])
            .to.have.property("tenantId")
            .to.equal("IVL");
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });
  });

  describe("testing roleMenuItemMap.find without data", () => {
    // delete all records
    // find should return empty array
    beforeEach((done) => {
      application.deleteAll()
        .then((res) => {
          done();
        });
    });

    it("should return empty array i.e. []", (done) => {
      let res = application.findAll(2);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(0);
          expect(docs)
            .to.eql([]);
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });
  });

  describe("testing application.findById", () => {
    // Delete all records, insert one record , get its id
    // 1. Query by this id and it should return one application
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    // 5. Query with arbitrary object
    let testObject = {
      //add a valid application object
      tenantId: "IVL",
      applicationName: "Docket",
      applicationCode: "Dock",
      createdBy: "Kavya",
      createdDate: new Date().toISOString()
    };
    var id;
    beforeEach((done) => {
      application.deleteAll()
        .then((res) => {
          application.save(testObject)
            .then((savedObj) => {
              id = savedObj._id;
              done();
            });
        });
    });

    it("should return application identified by Id ", (done) => {
      let res = application.findById(id);
      expect(res)
        .to.eventually.have.property("createdBy")
        .to.eql("Kavya")
        .notify(done);
    });

    it("should return null as no application is identified by this Id ", (done) => {
      let badId = new mongoose.mongo.ObjectId();
      let res = application.findById(badId);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing application.findOne", () => {
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return one application
    // 2. Query by an arbitrary attribute value and it should return {}

    // delete all records and insert two applications
    beforeEach((done) => {
      application.deleteAll()
        .then((res) => {
          application.save(object1)
            .then((res) => {
              application.save(object2)
                .then((savedObj) => {
                  done();
                });
            });
        });
    });

    it("should return object for valid attribute value", (done) => {
      // take one valid attribute and its value
      let attributename = "applicationName";
      let attributeValue = "Docket";
      let res = application.findOne(attributename, attributeValue);
      expect(res)
        .to.eventually.have.property("applicationName")
        .to.eql("Docket")
        .notify(done);
    });

    it("should return null as no application is identified by this attribute ", (done) => {
      let res = application.findOne("applicationCode", "CDA");
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });
});