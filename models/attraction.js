const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;
const Review = require('./review');
const {cloudinary} = require('../cloudinary');

const ImageSchema = new Schema(
    {    
        url: String,
        filename: String  
    }
);

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_250,h_200');
});

const AttractionSchema = new Schema({

    name:{
        type: String,
        required: true
    },
    location:{
       type: String,
       required: true
    },

    geometry:{

        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    // array of Review Schemas references
    reviews:[{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    description: {
        type: String,
        required: true
    },
    
    images:[ImageSchema], 
   
    // reference to author schema
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating:{
        type: Number,
        required: true
    }

}, {toJSON: {virtuals: true}});

AttractionSchema.virtual('properties.popUpHTML').get(function(){
    return `<a href='/attractions/id?id=${this._id}'>${this.name}</a>`;
});


// Middleware for deleting campground and all reviews and images
AttractionSchema.post('findOneAndDelete', async function(doc){
    if(doc)
    {
        // Delete all reviews if reviewId is in doc.reviews     
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        });
     
        // delete images in cloudinary database
        for(let images of doc.images)          
            await cloudinary.uploader.destroy(images.filename);
    }    
});

module.exports = mongoose.model('Attraction', AttractionSchema);