// JSON schema representation of application entity module

module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "applicationEntity",
  "type": "object",
  "properties": {
    "applicationId": {
      "type": "number"
    },
    "code": {
      "type": "number"
    },
    "applicationName": {
      "type": "string"
    },
    "enabled": {
      "type": "boolean",
      "default": true
    },
    "logo": {
      "type": "string"
    },
    "favicon": {
      "type": "string"
    },
    "createdBy": {
      "type": "string"
    },
    "updatedBy": {
      "type": ["string", "null"]
    },
    "createdDate": {
      "type": "string",
      "format": "date-time"
    },
    "updatedDate": {
      "type": ["string", "null"]
    }
  },
  "required": ["applicationId", "code", "applicationName", "createdBy", "createdDate"]
};