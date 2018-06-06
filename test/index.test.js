const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;

var application = require("../index");
var db = require("../db/application");
var MONGO_DB_URL = process.env.MONGODB_URI || "mongodb://10.10.69.204/TestPlatform_Dev";

chai.use(chaiAsPromised);

describe("Testing index.js", () => {
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      done();
    });
  });
  var testApp = {
    applicationName: 'Docket',
    applicationCode: "Dock",
    createdBy: "SYSTEM",
    createdDate: new Date().toISOString()
  };
  var testApp1 = {
    applicationName: "Flux CDA",
    applicationCode: "CDA",
    createdBy: "SYSTEM",
    createdDate: new Date().toISOString()
  };

  describe("Testing saveApplication", () => {
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      }).catch((e) => {
        done(e);
      });
    });

    it("should save a application to database", (done) => {
      let res = application.saveApplication(testApp);
      expect(res).to.be.eventually.a("object")
        .to.have.property("applicationName")
        .to.eql(testApp.applicationName)
        .notify(done);
    });

    it("should be rejected with Validation Error", (done) => {
      let res = application.saveApplication({
        applicationName: "Docket"
      });
      expect(res).to.be.rejectedWith("Validation Failed")
        .notify(done);
    });
  });

  describe("Testing FindByCode", () => {
    beforeEach((done) => {
      db.deleteAll().then(() => {
        db.saveApplication(testApp).then((app) => {
          db.saveApplication(testApp1).then((app) => {
            done();
          });
        });
      });
    });

    it("should return a application identified by Code", (done) => {
      let res = application.FindByCode("Dock");
      expect(res).to.be.eventually.be.a("object");
      expect(res).to.be.eventually.have.property("applicationCode")
        .to.deep.equal(testApp.applicationCode);
      done();
    });

    it("should return empty object i.e {} as no application is identified by this Code ", (done) => {
      let res = application.FindByCode("Doc");
      expect(res).to.be.eventually.be.a("object");
      expect(res).to.be.eventually.not.have.property("applicationCode");
      expect(res).to.be.eventually.deep.equal({});
      done();
    });

    it('should be rejected with not a number error for string input', (done) => {
      let res = application.FindByCode(12);
      expect(res).to.be.rejectedWith("Code value must be a string")
        .notify(done);
    });

    it('should be rejected with not a string error for undefined input', (done) => {
      var k;
      let res = application.FindByCode(k);
      expect(res).to.be.rejectedWith("Code value must be a string")
        .notify(done);
    });
  });

  describe("testing FindByCodeAndEnabled", () => {
    beforeEach((done) => {
      db.deleteAll().then(() => {
        db.saveApplication(testApp).then((res) => {
          db.saveApplication(testApp1).then((res) => {
            done();
          });
        });
      });
    });

    it("should return application identified by Code and Enabled", (done) => {
      let res = application.FindByCodeAndEnabled("Dock", true);
      expect(res).to.be.eventually.be.a('object');
      expect(res).to.be.eventually.have.property('applicationCode')
        .to.deep.equal(testApp.applicationCode);
      expect(res).to.be.eventually.have.property('applicationCode')
        .to.deep.equal(testApp.applicationCode);
      done();
    });

    it("should return empty object i.e {} as no application is identified by this Code and Enabled ", (done) => {
      let res = application.FindByCodeAndEnabled("kmk", false);
      expect(res).to.be.eventually.be.a('object')
        .not.have.property('applicationCode')
        .deep.equal({})
        .notify(done);
    });

    it("should be rejected with error for invalid enabled input ", (done) => {
      let res = application.FindByCodeAndEnabled("Dock", "false");
      expect(res).to.be.rejectedWith('Code value must be a string and enabled must be of boolean type')
        .notify(done);
    });

    it("should be rejected with error for invalid code input ", (done) => {
      let res = application.FindByCodeAndEnabled(11, false);
      expect(res).to.be.rejectedWith('Code value must be a string and enabled must be of boolean type')
        .notify(done);
    });
  });

  describe('testing application.getAll when data present', () => {
    // 1. Delete all records in the table and Insert two new records.
    // 2. Find -should return an array of size 2 with the  two application objects.

    beforeEach((done) => {
      db.deleteAll()
        .then((res) => {
          db.saveApplication(testApp)
            .then((res) => {
              db.saveApplication(testApp1)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should return 2 application objects', (done) => {
      let res = application.getAll();
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(2);
          expect(docs[0].applicationName)
            .to.equal(testApp.applicationName);
          done();
        });
    });
  });

  describe('testing application.getAll when there is no data in database', () => {
    // 1.Delete all the records from database
    // 2.Query the databse , should return empty array
    beforeEach((done) => {
      db.deleteAll()
        .then(() => {
          done();
        });
    });

    it('should return empty array', (done) => {
      let res = application.getAll();
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
    });
  });

  describe("testing updateApplication", () => {
    var id;
    beforeEach((done) => {
      db.deleteAll()
        .then((res) => {
          db.saveApplication(testApp)
            .then((res) => {
              id = res._id;
              db.saveApplication(testApp1)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should update a application', (done) => {
      application.updateApplication(id, {
        applicationName: "DocketNew",
        applicationCode: "Dock",
        createdBy: "SYSTEM",
        createdDate: new Date().toISOString()
      }).then((res) => {
        var result = application.getAll().then((apps) => {
          expect(apps.length).to.eql(2);
          expect(apps[0]).to.have.property('applicationName')
            .to.eql("DocketNew");
          done();
        });
      });
    });

    it("should throw IllegalArgumentException for wrong type of applicationName input ", (done) => {
      let res = application.updateApplication(id, {
        applicationName: "Flux-CDA",
        applicationCode: "Dock",
        createdBy: "SYSTEM",
        createdDate: new Date().toISOString()
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });


    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      let undefinedId;
      let res = application.updateApplication(undefinedId, {
        applicationName: "Application"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = application.updateApplication(id, undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.updateApplication(null, {
        applicationName: "Application"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = application.updateApplication(id, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });
});