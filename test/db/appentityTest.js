const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;

var applicationEntity = require("../../db/applicationEntity");
var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://localhost/TestApplications";

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
    applicationId: 1,
    applicationName: "Docket",
    code: 11,
    createdBy: "Kavya",
    createdDate: Date.now()
  };
  var testApp1 = {
    applicationId: 2,
    applicationName: "Sprint",
    code: 22,
    createdBy: "Srihari",
    createdDate: Date.now()
  };
  describe("testing save", () => {
    beforeEach((done) => {
      applicationEntity.deleteAll().then((res) => {
        done();
      }).catch((e) => {
        done(e);
      });
    });

    it("should save a application entity into database", (done) => {
      let res = applicationEntity.save(testApp);
      expect(res).to.be.eventually.have.property('applicationId')
        .to.equal(testApp.applicationId)
        .notify(done);
    });

    it("should not save a invalid application entity into database", (done) => {
      let res = applicationEntity.save({
        applicationId: 1
      });
      expect(res).to.be.rejectedWith("ApplicationEntity validation failed")
        .notify(done);
    });
  });

  describe("testing FindByCode", () => {
    beforeEach((done) => {
      applicationEntity.deleteAll().then(() => {
        applicationEntity.save(testApp).then((res) => {
          done();
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
  });

  describe("testing FindByCodeAndEnabled", () => {
    beforeEach((done) => {
      applicationEntity.deleteAll().then(() => {
        applicationEntity.save(testApp).then((res) => {
          done();
        });
      });
    });

    it("should return a application identified by Code and Enabled", (done) => {
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
  });

  describe('testing applicationEntity.findAllEntities when data present', () => {
    // 1. Delete all records in the table and Insert two new records.
    // 2. Find -should return an array of size 2 with the  two application objects.

    beforeEach((done) => {
      applicationEntity.deleteAll()
        .then((res) => {
          applicationEntity.save(testApp)
            .then((res) => {
              applicationEntity.save(testApp1)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should return 2 application objects', (done) => {
      let res = applicationEntity.FindAllEntities();
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

  describe('testing applicationEntity.findAll when there is no data in database', () => {
    // 1.Delete all the records from database
    // 2.Query the databse , should return empty array
    beforeEach((done) => {
      applicationEntity.deleteAll()
        .then(() => {
          done();
        });
    });

    it('should return empty array', (done) => {
      let res = applicationEntity.FindAllEntities();
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