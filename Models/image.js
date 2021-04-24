// const mongoose = require('mongoose')
// const Schema = mongoose.Schema;

// const imgSchema = new Schema({
//     img: {
//         type: Buffer,
//         required: true
//     },
//     imgType: {
//         type: String,
//         required: true
//     },
//     allot: {
//         type: String,
//         required: true
//     }
// });

// imgSchema.virtual('coverImagePath').get(function () {
//     if (this.img != null && this.imgType != null) {
//         return `data:${this.imgType};charset=utf-8;base64,${this.img.toString('base64')}`;
//     }
// })


// module.exports = mongoose.model('image', imgSchema);


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
    img: {
        type: Buffer,
        required: true
    },
    imgType: {
        type: String,
        required: true
    },
    allot : {
        type : String,
        required : true
    }
    
});

movieSchema.virtual('coverImagePath').get(function (){
    if(this.img != null && this.imgType != null){
        return `data:${this.imgType};charset=utf-8;base64,${this.img.toString('base64')}`;
    }
})



module.exports = mongoose.model('Image', movieSchema);