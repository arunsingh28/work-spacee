const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    nickName : {
        type : String,
        required : true
    },
    join : {
        type : String,
        default : '2-04-2021'
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    img: {
        type: Buffer,
        required: true
    },
    imgType: {
        type: String,
        required: true
    }
});

userSchema.virtual('coverImagePath').get(function (){
    if(this.img != null && this.imgType != null){
        return `data:${this.imgType};charset=utf-8;base64,${this.img.toString('base64')}`;
    }
})

module.exports = mongoose.model('user', userSchema);