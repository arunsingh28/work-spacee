const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    AID : {
        type : String,
        required : true
    },
    link : {
        type : String,
        required : true
    },
    For : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('link',linkSchema);