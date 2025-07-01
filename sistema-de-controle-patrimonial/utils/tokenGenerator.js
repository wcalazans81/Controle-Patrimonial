const crypto = require('crypto');
module.exports = () => crypto.randomBytes(20).toString('hex');
