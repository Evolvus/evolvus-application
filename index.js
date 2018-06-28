const debug = require("debug")("evolvus-application:index");
const applicationSchema = require("./model/applicationSchema")
    .schema;
const applicationCollection = require("./db/application");
const validate = require("jsonschema")
    .validate;
const docketClient = require("evolvus-docket-client");
const applicationDBschema=require("./db/applicationSchema");

var applicationDBschema = require("./db/applicationSchema");

var docketObject = {
    // required fields
    application: "PLATFORM",
    source: "application",
    name: "",
    createdBy: "",
    ipAddress: "",
    status: "SUCCESS", //by default
    eventDateTime: Date.now(),
    keyDataAsJSON: "",
    details: "",
    //non required fields
    level: ""
};

module.exports.application = {
    applicationDBschema,
    applicationSchema
};

module.exports.menu = {
  applicationDBschema,
  applicationSchema
};

module.exports.validate = (applicationObject) => {
    return new Promise((resolve, reject) => {
        try {
            if (typeof applicationObject === "undefined") {
                throw new Error("IllegalArgumentException:applicationObject is undefined");
            }
            var res = validate(applicationObject, applicationSchema);
            debug("validation status: ", JSON.stringify(res));
            if (res.valid) {
                resolve(res.valid);
            } else {
                reject(res.errors);
            }
        } catch (err) {
            reject(err);
        }
    });
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (applicationObject) => {
    return new Promise((resolve, reject) => {
        try {
            if (typeof applicationObject === 'undefined' || applicationObject == null) {
                throw new Error("IllegalArgumentException: applicationObject is null or undefined");
            }
            docketObject.name = "application_save";
            docketObject.keyDataAsJSON = JSON.stringify(applicationObject);
            docketObject.details = `application creation initiated`;
            docketClient.postToDocket(docketObject);
            var res = validate(applicationObject, applicationSchema);
            debug("validation status: ", JSON.stringify(res));
            if (!res.valid) {
                reject(res.errors);
            }

            // Other validations here


            // if the object is valid, save the object to the database
            applicationCollection.save(applicationObject).then((result) => {
                debug(`saved successfully ${result}`);
                resolve(result);
            }).catch((e) => {
                debug(`failed to save with an error: ${e}`);
                reject(e);
            });
        } catch (e) {
            docketObject.name = "application_ExceptionOnSave";
            docketObject.keyDataAsJSON = JSON.stringify(applicationObject);
            docketObject.details = `caught Exception on application_save ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

// List all the objects in the database
// makes sense to return on a limited number
// (what if there are 1000000 records in the collection)
module.exports.getAll = (limit) => {
    return new Promise((resolve, reject) => {
        try {
            if (typeof(limit) == "undefined" || limit == null) {
                throw new Error("IllegalArgumentException: limit is null or undefined");
            }
            docketObject.name = "application_getAll";
            docketObject.keyDataAsJSON = `getAll with limit ${limit}`;
            docketObject.details = `application getAll method`;
            docketClient.postToDocket(docketObject);

            applicationCollection.findAll(limit).then((docs) => {
                debug(`application(s) stored in the database are ${docs}`);
                resolve(docs);
            }).catch((e) => {
                debug(`failed to find all the application(s) ${e}`);
                reject(e);
            });
        } catch (e) {
            docketObject.name = "application_ExceptionOngetAll";
            docketObject.keyDataAsJSON = "applicationObject";
            docketObject.details = `caught Exception on application_getAll ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};


// Get the entity idenfied by the id parameter
module.exports.getById = (id) => {
    return new Promise((resolve, reject) => {
        try {

            if (typeof(id) == "undefined" || id == null) {
                throw new Error("IllegalArgumentException: id is null or undefined");
            }
            docketObject.name = "application_getById";
            docketObject.keyDataAsJSON = `applicationObject id is ${id}`;
            docketObject.details = `application getById initiated`;
            docketClient.postToDocket(docketObject);

            applicationCollection.findById(id)
                .then((res) => {
                    if (res) {
                        debug(`application found by id ${id} is ${res}`);
                        resolve(res);
                    } else {
                        // return empty object in place of null
                        debug(`no application found by this id ${id}`);
                        resolve({});
                    }
                }).catch((e) => {
                    debug(`failed to find application ${e}`);
                    reject(e);
                });

        } catch (e) {
            docketObject.name = "application_ExceptionOngetById";
            docketObject.keyDataAsJSON = `applicationObject id is ${id}`;
            docketObject.details = `caught Exception on application_getById ${e.message}`;
            docketClient.postToDocket(docketObject);
            debug(`caught exception ${e}`);
            reject(e);
        }
    });
};

module.exports.getOne = (query) => {
  return new Promise((resolve, reject) => {
    try {
      if (query == null) {
        throw new Error("IllegalArgumentException: query is null or undefined");
      }

      docketObject.name = "application_getOne";
      docketObject.keyDataAsJSON = `applicationObject ${query}`;
      docketObject.details = `application getById initiated`;
      docketClient.postToDocket(docketObject);
      applicationCollection.findOne(query).then((data) => {
        if (data) {
          debug(`application found ${data}`);
          resolve(data);
        } else {
          // return empty object in place of null
          debug(`no application found by this ${query}`);
          resolve({});
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "application_ExceptionOngetOne";
      docketObject.keyDataAsJSON = `applicationObject ${query}`;
      docketObject.details = `caught Exception on application_getOne ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.update = (id, update) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof id == "undefined" || id == null || typeof update == "undefined" || update == null) {
        throw new Error("IllegalArgumentException:id/update is null or undefined");
      }
      docketObject.name = "application_getOne";
      docketObject.keyDataAsJSON = `applicationObject ${id} to be updated with  ${update}`;
      docketObject.details = `application getById initiated`;
      docketClient.postToDocket(docketObject);
      applicationCollection.update(id, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        debug(`failed to update ${error}`);
        reject(error);
      });
    } catch (e) {
      docketObject.name = "application_ExceptionOngetOne";
      docketObject.keyDataAsJSON = `applicationObject ${id} to be updated with  ${update}`;
      docketObject.details = `caught Exception on application_getOne ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};
