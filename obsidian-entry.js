require('jquery');
window.marked = require('marked');
require('hotbox');
require('json-diff');
const { kity, kityminder } = require('./viewer');
kityminder.Editor = require('./src/editor');
module.exports = { kity, kityminder };
