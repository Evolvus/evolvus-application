const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;

var application = require("../../db/application");
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost/TestApplication";

chai.use(chaiAsPromised);

describe("Applications db testing", () => {
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      done();
    });
  });
  var testApp = {
    "applicationId": 1,
    "applicationName": "Docket",
    "applicationCode": "Dock",
    "createdBy": "Kavya",
    "createdDate": Date.now()
  };
  var testApp1 = {
    "applicationId": 2,
    "applicationName": "Sprint",
    "applicationCode": "Spri",
    "createdBy": "Srihari",
    "createdDate": Date.now()
  };
  describe("testing saveApplication", () => {
    beforeEach((done) => {
      application.deleteAll().then((res) => {
        done();
      }).catch((e) => {
        done(e);
      });
    });

    it("should  save a application into database", (done) => {
      let res = application.saveApplication(testApp);
      expect(res).to.be.eventually.have.property("applicationId")
        .to.equal(testApp.applicationId)
        .notify(done);
    });

    it("should not  save a invalid application into database", (done) => {
      let res = application.saveApplication({
        applicationId: 1
      });
      expect(res).to.be.rejectedWith("Application validation failed")
        .notify(done);
    });
  });

  describe("testing FindByCode", () => {
    beforeEach((done) => {
      application.deleteAll().then(() => {
        application.saveApplication(testApp).then((res) => {
          done();
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
      let res = application.FindByCode(1);
      expect(res).to.be.eventually.be.a("object");
      expect(res).to.be.eventually.not.have.property("applicationCode");
      expect(res).to.be.eventually.deep.equal({});
      done();
    });
  });

  describe("testing FindByCodeAndEnabled", () => {
    beforeEach((done) => {
      application.deleteAll().then(() => {
        application.saveApplication(testApp).then((res) => {
          done();
        });
      });
    });

    it("should return a application identified by Code and Enabled", (done) => {
      let res = application.FindByCodeAndEnabled("Dock", true);
      expect(res).to.be.eventually.be.a("object");
      expect(res).to.be.eventually.have.property("applicationCode")
        .to.deep.equal(testApp.applicationCode);
      expect(res).to.be.eventually.have.property("applicationId")
        .to.deep.equal(testApp.applicationId);
      done();
    });

    it("should return empty object i.e {} as no application is identified by this Code and Enabled ", (done) => {
      let res = application.FindByCodeAndEnabled("aaaa", false);
      expect(res).to.be.eventually.be.a('object')
        .not.have.property('applicationCode')
        .deep.equal({})
        .notify(done);
    });
  });

  describe("testing application.FindAllApplications when data present", () => {
    // 1. Delete all records in the table and Insert two new records.
    // 2. Find -should return an array of size 2 with the  two application objects.

    beforeEach((done) => {
      application.deleteAll()
        .then((res) => {
          application.saveApplication(testApp)
            .then((res) => {
              application.saveApplication(testApp1)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should return 2 application objects', (done) => {
      let res = application.FindAllApplications();
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

  describe('testing application.findAll when there is no data in database', () => {
    // 1.Delete all the records from database
    // 2.Query the databse , should return empty array
    beforeEach((done) => {
      application.deleteAll()
        .then(() => {
          done();
        });
    });

    it('should return empty array', (done) => {
      let res = application.FindAllApplications();
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

  describe('testing update application', () => {
    //Delete all the recods from database
    //add 2 applications
    let id;
    let update = {
      applicationId: 12,
      applicationName: "NewDocket",
      applicationCode: "dock",
      createdBy: "KavyaK",
      createdDate: Date.now()
    };
    beforeEach((done) => {
      application.deleteAll().then((res) => {
        application.saveApplication(testApp).then((res) => {
          id = res._id;
          application.saveApplication(testApp1).then((res) => {
            done();
          });
        });
      });
    });

    it('should update a application ', (done) => {
      application.updateApplication(id, update).then((resp) => {
        var res = application.FindAllApplications().then((apps) => {
          expect(apps).to.be.a('array');
          expect(apps.length).to.eql(2);
          expect(apps[0].applicationName).to.eql(update.applicationName);
          done();
        });
      });
    });

    it("should be rejected when there is no application matching the parameter id", (done) => {
      var res = application.updateApplication("5afe65875e5b3218cf267086", update);
      expect(res).to.be.rejectedWith(`There is no such Application with id:5afe65875e5b3218cf267086`)
        .notify(done);
    });

    it("should be rejected when data to be updated is invalid", (done) => {
      var res = application.updateApplication(id, {
        application: "DOCKET"
      });
      expect(res).to.be.rejectedWith("Sorry! this data to be updated is invalid")
        .notify(done);
    });

    it("should be rejected for arbitrary object as Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value
      let invalidId = "some value";
      let res = application.updateApplication(invalidId, update);
      expect(res)
        .to.eventually.to.be.rejectedWith("must be a single String of 12 bytes")
        .notify(done);
    });
  });
});