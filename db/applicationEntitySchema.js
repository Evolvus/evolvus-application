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
    maxlength: 100
  },
  enabled: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 255
  }
  logo: {
    data: Buffer,
    contentType: String
  },
  favicon: {
    data: Buffer,
    contentType: String
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