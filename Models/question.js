const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
     /* allot ID */
     AID : { 
        type : String,
        required : true
    },
    question : {
        type : String,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    allotUser : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('question',questionSchema);