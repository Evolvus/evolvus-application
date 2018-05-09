const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;

var applicationEntity = require("../index");
var db = require('../db/applicationEntity');
var MONGO_DB_URL = process.env.MONGODB_URI || "mongodb://localhost/TestApplications";

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
    applicationId: 1,
    applicationName: "Docket",
    code: 11,
    createdBy: "Kavya",
    createdDate: new Date().toISOString()
  };
  var testApp1 = {
    applicationId: 2,
    applicationName: "Sprint",
    code: 22,
    createdBy: "Srihari",
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

    it('should save a application to database', (done) => {
      let res = applicationEntity.saveApplication(testApp);
      expect(res).to.be.eventually.a('object')
        .to.have.property('applicationName')
        .to.eql(testApp.applicationName)
        .notify(done);
    });

    it('should be rejected with Validation Error', (done) => {
      let res = applicationEntity.saveApplication({
        applicationName: "Docket"
      });
      expect(res).to.be.rejectedWith("Validation Failed")
        .notify(done);
    });
  });


  describe("Testing FindByCode", () => {
    beforeEach((done) => {
      db.deleteAll().then(() => {
        db.save(testApp).then((app) => {
          db.save(testApp1).then((app) => {
            done();
          });
        });
      });
    });


    it("should return a application identified by Code", (done) => {
      let res = applicationEntity.FindByCode(11);
      expect(res).to.be.eventually.be.a('object');
      expect(res).to.be.eventually.have.property('code')
        .to.deep.equal(testApp.code);
      done();
    });

    it("should return empty object i.e {} as no application is identified by this Code ", (done) => {
      let res = applicationEntity.FindByCode(1);
      expect(res).to.be.eventually.be.a('object');
      expect(res).to.be.eventually.not.have.property('code');
      expect(res).to.be.eventually.deep.equal({});
      done();
    });

    it('should be rejected with not a number error for string input', (done) => {
      let res = applicationEntity.FindByCode("k");
      expect(res).to.be.rejectedWith('Code value must be a number')
        .notify(done);
    });

    it('should be rejected with not a number error for undefined input ', (done) => {
      var k;
      let res = applicationEntity.FindByCode(k);
      expect(res).to.be.rejectedWith('Code value must be a number')
        .notify(done);
    });
  });

  describe("testing FindByCodeAndEnabled", () => {
    beforeEach((done) => {
      db.deleteAll().then(() => {
        db.save(testApp).then((res) => {
          db.save(testApp1).then((res) => {
            done();
          });
        });
      });
    });

    it("should return application identified by Code and Enabled", (done) => {
      let res = applicationEntity.FindByCodeAndEnabled(11, true);
      expect(res).to.be.eventually.be.a('object');
      expect(res).to.be.eventually.have.property('code')
        .to.deep.equal(testApp.code);
      expect(res).to.be.eventually.have.property('applicationId')
        .to.deep.equal(testApp.applicationId);
      done();
    });

    it("should return empty object i.e {} as no application is identified by this Code and Enabled ", (done) => {
      let res = applicationEntity.FindByCodeAndEnabled(10, false);
      expect(res).to.be.eventually.be.a('object')
        .not.have.property('code')
        .deep.equal({})
        .notify(done);
    });

    it("should be rejected with error for invalid enabled input ", (done) => {
      let res = applicationEntity.FindByCodeAndEnabled(10, "false");
      expect(res).to.be.rejectedWith('Code value must be a number and enabled must be of boolean type')
        .notify(done);
    });

    it("should be rejected with error for invalid code input ", (done) => {
      let res = applicationEntity.FindByCodeAndEnabled("10", false);
      expect(res).to.be.rejectedWith('Code value must be a number and enabled must be of boolean type')
        .notify(done);
    });
  });

  describe('testing applicationEntity.getAll when data present', () => {
    // 1. Delete all records in the table and Insert two new records.
    // 2. Find -should return an array of size 2 with the  two application objects.

    beforeEach((done) => {
      db.deleteAll()
        .then((res) => {
          db.save(testApp)
            .then((res) => {
              db.save(testApp1)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should return 2 application objects', (done) => {
      let res = applicationEntity.getAll();
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

  describe('testing applicationEntity.getAll when there is no data in database', () => {
    // 1.Delete all the records from database
    // 2.Query the databse , should return empty array
    beforeEach((done) => {
      db.deleteAll()
        .then(() => {
          done();
        });
    });

    it('should return empty array', (done) => {
      let res = applicationEntity.getAll();
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
});