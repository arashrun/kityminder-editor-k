require('jquery');
window.marked = require('marked');
require('hotbox');
const { kity, kityminder } = require('./viewer');
kityminder.Editor = require('./src/editor');
module.exports = { kity, kityminder };
