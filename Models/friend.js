const mongsoose = require('mongoose')

const friend = new mongsoose.Schema({
    user : {
        type : String,
        required : true
    },
    friends : [{
        fID : {
            type : String
        }
    }]
})

const dost = mongsoose.model('Friend',friend)

exports.default = dost