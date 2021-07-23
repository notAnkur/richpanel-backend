const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
  id: String,
  name: String,
  category: String
});

module.exports = mongoose.model('Page', PageSchema, 'page');