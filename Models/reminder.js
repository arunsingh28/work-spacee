const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    AID : {
        type : String,
        required : true
    },
    reminder : {
        type : String,
        required : true
    },
    date : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('Reminder',reminderSchema);