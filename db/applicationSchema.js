const mongoose = require('mongoose');

var applicationSchema = new mongoose.Schema({
  applicationId: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  applicationCode: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 4
  },
  applicationName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
    validate: {
      validator: function(v) {
        return /^[A-Za-z ]*$/.test(v);
      },
      message: "{PATH} can contain only alphabets and spaces"
    }
  },
  enabled: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 255
  },
  logo: {
    type: String
  },
  favicon: {
    type: String
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  },
  createdDate: {
    type: Date,
    required: true
  },
  updatedDate: {
    type: Date
  }
});

module.exports = applicationSchema;