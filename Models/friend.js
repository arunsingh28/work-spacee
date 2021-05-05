const mongsoose = require('mongoose')

const friend = new mongsoose.Schema({
    user : {
        type : String,
        required : true
    },
    // nested array
    friends : [String]
})


module.exports = mongsoose.model('Friend-Data',friend)

