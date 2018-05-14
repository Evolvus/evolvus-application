const debug = require("debug")("evolvus-applicationentity:db:applicationEntity");
const mongoose = require("mongoose");
const applicationSchema = require('./applicationEntitySchema');

//Creates ApplicationEntity collection in database
var ApplicationEntity = mongoose.model("ApplicationEntity", applicationSchema);


// Stores the applicationEntity object into database
module.exports.save = (applicationEntity) => {
  return new Promise((resolve, reject) => {
    try {
      var application = new ApplicationEntity(applicationEntity);
      application.save().then((app) => {
        debug("saved successfully", app.applicationName);
        resolve(app);
      }, (err) => {
        debug(`failed to save with an error ${err}`);
        reject(err);
      }).catch((e) => {
        debug(`exception on save ${e}`);
        reject(e);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

// Finds the application object for the code parameter from the applicationEntity collection
// If there is no object matching the code, return empty object i.e. {}
// Should return a Promise
module.exports.FindByCode = (codevalue) => {
  return new Promise((resolve, reject) => {
    try {
      ApplicationEntity.findOne({
        applicationCode: codevalue
      }).then((app) => {
        if (app) {
          debug(`application found ${app.applicationName}`);
          resolve(app);
        } else {
          // return empty object in place of null
          resolve({});
        }
      }).catch((e) => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
};

//Finds application entity by its code and enabled attributes
module.exports.FindByCodeAndEnabled = (codeValue, enabledValue) => {
  return new Promise((resolve, reject) => {
    try {
      ApplicationEntity.findOne({
        $and: [{
          applicationCode: codeValue
        }, {
          enabled: enabledValue
        }]
      }).then((app) => {
        if (app) {
          resolve(app);
        } else {
          resolve({});
        }
      }).catch((e) => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
};

//Returns all the application entities
module.exports.FindAllEntities = () => {
  return ApplicationEntity.find({});
};


//Deletes all the records from the database
//Used only for testing
module.exports.deleteAll = () => {
  return ApplicationEntity.remove({});
};