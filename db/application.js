const debug = require("debug")("evolvus-application:db:application");
const mongoose = require("mongoose");
const applicationSchema = require('./applicationSchema');
const ObjectId = require("mongodb").ObjectID;

//Creates Application collection in database
var Application = mongoose.model("Application", applicationSchema);


// Stores the application object into database
module.exports.saveApplication = (applicationObj) => {
  return new Promise((resolve, reject) => {
    try {
      var application = new Application(applicationObj);
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

//Finds one application by its code and updates it with new values
module.exports.updateApplication = (id, update) => {
  return new Promise((resolve, reject) => {
    try {
      Application.findById({
        _id: new ObjectId(id)
      }).then((app) => {
        if (app) {
          var updateObject = new Application(update);
          var errors = updateObject.validateSync();
          if (errors != null) {
            throw new Error(`IllegalArgumentException: ${errors.message}`);
          }
          Application.update({
            _id: id
          }, {
            $set: update
          }).then((response) => {
            if (response.nModified === 0) {
              debug("failed to update");
              reject("Sorry! this data to be updated is invalid or you are trying to update with the same values");
            } else {
              debug("updated successfully");
              resolve(response);
            }
          });
        } else {
          debug(`Application not found with id, ${id}`);
          reject(`There is no such Application with id:${id}`);
        }
      }).catch((e) => {
        debug(`exception on findById ${e}`);
        reject(e.message);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e.message);
    }
  });
};

// Finds the application object for the code parameter from the application collection
// If there is no object matching the code, return empty object i.e. {}
// Should return a Promise
module.exports.FindByCode = (codevalue) => {
  return new Promise((resolve, reject) => {
    try {
      Application.findOne({
        applicationCode: codevalue
      }).then((app) => {
        if (app) {
          debug(`application found ${app.applicationName}`);
          resolve(app);
        } else {
          // return empty object in place of null
          debug("application not found");
          resolve({});
        }
      }).catch((e) => {
        debug(`failed to find the application with error ${e}`);
        reject(e);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

//Finds application by its code and enabled attributes
module.exports.FindByCodeAndEnabled = (codeValue, enabledValue) => {
  return new Promise((resolve, reject) => {
    try {
      Application.findOne({
        $and: [{
          applicationCode: codeValue
        }, {
          enabled: enabledValue
        }]
      }).then((app) => {
        if (app) {
          debug(`application found ${app}`);
          resolve(app);
        } else {
          debug("application not found");
          resolve({});
        }
      }).catch((e) => {
        debug(`failed to find the application with ${e}`);
        reject(e);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

//Returns all the application entities
module.exports.FindAllApplications = () => {
  return Application.find({});
};

//Deletes all the records from the database
//Used only for testing
module.exports.deleteAll = () => {
  return Application.remove({});
};