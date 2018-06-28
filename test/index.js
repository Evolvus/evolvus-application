const debug = require("debug")("evolvus-application.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204/TestPlatform_Dev";
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const application = require("../index");
const db = require("../db/application");

describe('application model validation', () => {
  let applicationObject = {
    // add a valid application Object here
    tenantId: "IVL",
    applicationName: "FLUX RTP",
    applicationCode: "RTP",
    createdBy: "Kavya",
    createdDate: new Date().toISOString()
  };

  let invalidObject = {
    //add invalid application Object here
    applicationName: "Docket",
    applicationCode: "Dock",
    createdBy: "Kavya",
    createdDate: new Date().toISOString()
  };

  let undefinedObject; // object that is not defined
  let nullObject = null; // object that is null

  // before we start the tests, connect to the database
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      debug("ok got the connection");
      done();
    });
  });

  describe("validation against jsonschema", () => {
    it("valid application should validate successfully", (done) => {
      try {
        var res = application.validate(applicationObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid application object should not throw exception: ${e}`);
      }
    });

    it("invalid application should return errors", (done) => {
      try {
        var res = application.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if ("should error out for undefined objects", (done) => {
        try {
          var res = application.validate(undefinedObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

    if ("should error out for null objects", (done) => {
        try {
          var res = application.validate(nullObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

  });

  describe("testing application.save method", () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should save a valid application object to database', (done) => {
      try {
        var result = application.save(applicationObject);
        //replace anyAttribute with one of the valid attribute of a application Object
        expect(result)
          .to.eventually.have.property("applicationName")
          .to.eql("FLUX RTP")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving application object should not throw exception: ${e}`);
      }
    });

    it('should not save a invalid application object to database', (done) => {
      try {
        var result = application.save(invalidObject);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing application.getAll when there is data in database', () => {
    let object1 = {
        //add one valid application object here
        tenantId: "IVL",
        applicationName: "FLUX CDA",
        applicationCode: "CDA",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      },
      object2 = {
        //add one more valid application object here
        tenantId: "IVL",
        applicationName: "FLUX RTP",
        applicationCode: "RTP",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            done();
          });
        });
      });
    });

    it('should return limited records as specified by the limit parameter', (done) => {
      try {
        let res = application.getAll(2);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(2);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return all records if limit is -1', (done) => {
      try {
        let res = application.getAll(-1);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(2);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for null value of limit', (done) => {
      try {
        let res = application.getAll(null);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for undefined value of limit', (done) => {
      try {
        let undefinedLimit;
        let res = application.getAll(undefinedLimit);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing application.getAll when there is no data', () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should return empty array when limit is -1', (done) => {
      try {
        let res = application.getAll(-1);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(0);
            expect(docs)
              .to.eql([]);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty array when limit is positive value ', (done) => {
      try {
        let res = application.getAll(2);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(0);
            expect(docs)
              .to.eql([]);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });

  describe('testing getById', () => {
    // Insert one record , get its id
    // 1. Query by this id and it should return one application object
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    var id;
    beforeEach((done) => {
      db.deleteAll().then(() => {
        db.save(applicationObject).then((res) => {
          id = res._id;
          done();
        });
      });
    });

    it('should return one application matching parameter id', (done) => {
      try {
        var res = application.getById(id);
        expect(res).to.eventually.have.property('_id')
          .to.eql(id)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no application is identified by this Id ', (done) => {
      try {
        let badId = new mongoose.mongo.ObjectId();
        var res = application.getById(badId);
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      try {
        let undefinedId;
        let res = application.getById(undefinedId);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      try {
        let res = application.getById(null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should be rejected for arbitrary object as Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value
      let id = applicationObject;
      let res = application.getById(id);
      expect(res)
        .to.eventually.to.be.rejectedWith("must be a single String of 12 bytes")
        .notify(done);
    });

  });

  describe("testing application.getOne", () => {
    let object1 = {
        //add one valid application object here
        tenantId: "IVL",
        applicationName: "FLUX CDA",
        applicationCode: "CDA",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      },
      object2 = {
        //add one more valid application object here
        tenantId: "IVL",
        applicationName: "FLUX RTP",
        applicationCode: "RTP",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            done();
          });
        });
      });
    });

    it("should return one application record identified by attribute", (done) => {
      try {
        // take one attribute from object1 or object2 and its value
        let res = application.getOne({
          applicationCode: "CDA"
        });
        expect(res)
          .to.eventually.be.a("object")
          .to.have.property('applicationCode')
          .to.eql('CDA')
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no application is identified by this attribute', (done) => {
      try {
        // replace validAttribute and add a bad value to it
        var res = application.getOne({
          applicationCode: "KMK"
        });
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined query parameter ", (done) => {
      try {
        //replace validvalue with a valid value for an attribute
        let undefinedQuery;
        let res = application.getOne(undefinedQuery);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null query parameter ", (done) => {
      try {
        //replace validValue with a valid value for an attribute
        let res = application.getOne(null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe("testing updateApplication", () => {
    var id;
    let object1 = {
        //add one valid application object here
        tenantId: "IVL",
        applicationName: "FLUX CDA",
        applicationCode: "CDA",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      },
      object2 = {
        //add one more valid application object here
        tenantId: "IVL",
        applicationName: "FLUX RTP",
        applicationCode: "RTP",
        createdBy: "Kavya",
        createdDate: new Date().toISOString()
      };
    beforeEach((done) => {
      db.deleteAll()
        .then((res) => {
          db.save(object1)
            .then((res) => {
              id = res._id;
              db.save(object2)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should update a application and have same _id', (done) => {
      var res = application.update(id, {
        applicationName: "FLUX RTP",
        createdBy: "Kavya"
      });
      expect(res)
        .to.eventually.be.a("object")
        .to.have.property("_id")
        .to.eql(id)
        .notify(done);
    });

    it('should update a application with new values', (done) => {
      var res = application.update(id, {
        applicationName: "FLUX RTP",
        createdBy: "Kavya"
      });
      expect(res)
        .to.eventually.be.a("object")
        .to.have.property("applicationName")
        .to.eql("FLUX RTP")
        .notify(done);
    });

    it("should be rejected for wrong type of applicationName input ", (done) => {
      let res = application.update(id, {
        tenantId: "asa",
        applicationName: "Flux-CDA",
        applicationCode: "Dock"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("applicationCollection validation failed")
        .notify(done);
    });


    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      let undefinedId;
      let res = application.update(undefinedId, {
        applicationName: "Application"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = application.update(id, undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.update(null, {
        applicationName: "Application"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.update(id, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
});