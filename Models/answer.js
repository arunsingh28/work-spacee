const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionID : {
        type : String,
        required : true
    },
    userID : {
        type : String,
        required : true
    },
    answer : {
        type : String,
        required : true
    },
})

module.exports = mongoose.model('answer',answerSchema);