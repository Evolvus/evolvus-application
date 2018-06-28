const debug = require("debug")("evolvus-application:db:application");
const mongoose = require("mongoose");
const ObjectId = require('mongodb')
  .ObjectID;

const applicationSchema = require("./applicationSchema");

// Creates a applicationCollection collection in the database
var applicationCollection = mongoose.model("applicationCollection", applicationSchema);

// Saves the applicationCollection object to the database and returns a Promise
// The assumption here is that the Object is valid
module.exports.save = (object) => {
  return new Promise((resolve, reject) => {
    try {
      // any exception during construction will go to catch
      let application = new applicationCollection(object);
      // on resolve we need to resolve the this method
      // on reject or exception we reject it,
      // this is because the record either saves or it doesnt
      // in any case it does not save, is a reject
      application.save()
        .then((data) => {
          debug("saved successfully", data._id);
          resolve(data);
        }, (err) => {
          debug(`rejected save.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on save: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};


// Returns a limited set if all the application(s) with a Promise
// if the collectiom has no records it Returns
// a promise with a result of  empty object i.e. {}
module.exports.findAll = (limit) => {
  if (limit < 1) {
    return applicationCollection.find({});
  }
  return applicationCollection.find({}).limit(limit);
};

// Finds the application which matches the value parameter from application collection
// If there is no object matching the attribute/value, return empty object i.e. {}
// null, undefined should be rejected with Invalid Argument Error
// Should return a Promise
module.exports.findOne = (query) => {
  return new Promise((resolve, reject) => {
    try {
      // var query = {};
      // query[attribute] = value;
      applicationCollection.findOne(query)
        .then((data) => {
          debug(`application found ${data}`);
          resolve(data);
        }, (err) => {
          debug(`rejected find.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on find: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};

//
// Finds the application for the id parameter from the application collection
// If there is no object matching the id, return empty object i.e. {}
// null, undefined, invalid objects should be rejected with Invalid Argument Error
// All returns are wrapped in a Promise
//
module.exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      applicationCollection.findById({
          _id: new ObjectId(id)
        })
        .then((res) => {
          debug("findById successfull: ", res);
          resolve(res);
        }, (err) => {
          debug(`rejected finding applicationCollection.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on finding application: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};

//Finds one application by its code and updates it with new values
module.exports.update = (id, update) => {
  return new Promise((resolve, reject) => {
    try {
      applicationCollection.findById({
        _id: new ObjectId(id)
      }).then((app) => {
        if (app) {
          app.set(update);
          app.save().then((res) => {
            debug(`updated successfully ${res}`);
            resolve(res);
          }).catch((e) => {
            debug(`failed to update ${e}`);
            reject(e);
          });
        } else {
          debug(`application not found with id, ${id}`);
          reject(`There is no such application with id:${id}`);
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

// Deletes all the entries of the collection.
// To be used by test only
module.exports.deleteAll = () => {
  return applicationCollection.remove({});
};