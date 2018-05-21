const debug = require("debug")("evolvus-application:index");
const application = require('./db/application');
const applicationSchema = require("./model/applicationSchema").schema;
const validate = require("jsonschema")
  .validate;

module.exports.saveApplication = (applicationObj) => {
  return new Promise((resolve, reject) => {
    try {
      var res = validate(applicationObj, applicationSchema);
      if (res.valid) {
        application.saveApplication(applicationObj).then((app) => {
          debug(`saved successfully ${app.applicationName}`);
          resolve(app);
        }).catch((e) => {
          debug(`exception on save ${e}`);
          reject(e);
        });
      } else {
        debug(`validation failed ${res.errors}`);
        reject("Validation Failed" + res.errors);
      }
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.updateApplication = (id, update) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof id == "undefined" || id == null || typeof update == "undefined" || update == null) {
        throw new Error("IllegalArgumentException:id/update is null or undefined");
      } else {
        application.updateApplication(id, update).then((resp) => {
          debug("updated successfully");
          resolve("Updated successfully.");
        }).catch((error) => {
          debug(`failed to update ${error}`);
          reject(error);
        });
      }
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.FindByCode = (code) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof code === 'string' && typeof code !== 'undefined') {
        application.FindByCode(code).then((app) => {
          debug(`application found ${app}`);
          resolve(app);
        }).catch((e) => {
          debug(`failed to find ${e}`);
          reject(e);
        });
      } else {
        reject("Code value must be a string");
      }
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.FindByCodeAndEnabled = (code, enabled) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof code === 'string' && typeof enabled === 'boolean') {
        application.FindByCodeAndEnabled(code, enabled).then((app) => {
          debug(`application found ${app}`);
          resolve(app);
        }).catch((e) => {
          debug(`failed to find ${e}`);
          reject(e);
        });
      } else {
        reject("Code value must be a string and enabled must be of boolean type");
      }
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.getAll = () => {
  return new Promise((resolve, reject) => {
    try {
      application.FindAllApplications().then((docs) => {
        resolve(docs);
      }).catch((e) => {
        debug(`exception on find ${e}`);
        reject(e);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};