const multer = require('multer')
const AWS = require('aws-sdk')
const env = require('dotenv').config()


module.exports = {
     storage : multer.memoryStorage({
        destination : (req,file,cb)=>{
            cb(null, '/upload')
        },
        filename : (req,file,cb)=>{
            cb(null, file.fieldname+'-'+file.originalname+Date.now()+'.jpg')
        }   
    }),
        s3 : new AWS.S3({
            accessKeyId :  process.env.AWS_ACCESS_KEY,
            secretAccessKey : process.env.AWS_SECREAT_KEY,
            endpoint : process.env.AWS_ENDPOINT,
            s3BucketEndpoint : false
        }),
        upload : multer({storage:this.storage,limits : {fileSize : 3000000 }}).single('image')
}