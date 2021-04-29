const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    note : {
        type : String,
        required : true
    },
    writer : {
        type : String,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    type : {
        type : String,
        required : true
    },
    AID : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model('note',noteSchema);
