var applicationEntity = require('./db/applicationEntity');
const applicationSchema = require("./model/applicationEntitySchema").schema;
const validate = require("jsonschema")
  .validate;

module.exports.saveApplication = (application) => {
  return new Promise((resolve, reject) => {
    try {
      var res = validate(application, applicationSchema);
      if (res.valid) {
        applicationEntity.save(application).then((app) => {
          resolve(app);
        }).catch((e) => {
          reject(e);
        });
      } else {
        reject("Validation Failed" + res.errors);
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.FindByCode = (code) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof code === 'number' && typeof code !== 'undefined') {
        applicationEntity.FindByCode(code).then((app) => {
          resolve(app);
        }).catch((e) => {
          reject(e);
        });
      } else {
        reject("Code value must be a number");
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.FindByCodeAndEnabled = (code, enabled) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof code === 'number' && typeof enabled === 'boolean') {
        applicationEntity.FindByCodeAndEnabled(code, enabled).then((app) => {
          resolve(app);
        }).catch((e) => {
          reject(e);
        });
      } else {
        reject("Code value must be a number and enabled must be of boolean type");
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports.getAll = () => {
  return new Promise((resolve, reject) => {
    try {
      applicationEntity.FindAllEntities().then((docs) => {
        resolve(docs);
      }).catch((e) => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
};