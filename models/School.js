const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema({
  peopleId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  cityOfSchool: {
    type: String,
    required: true
  },
  curriculum: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  created_at: {
    type: String,
    required: true
  },
  updated_at: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("Schools", schoolSchema)