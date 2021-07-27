const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
const ExpressError = require('./ExpressError');
const Attraction = require('../models/attraction.js');
const Review = require('../models/review');
const mapBoxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapBoxGeocoding({accessToken : mapBoxToken});

// Checks if corrdiantes are in the caribbean
function inbounds(long, lat){
    return long >= -105 && long <= -45 && lat <= 40 && lat >= 0;
}

const extension = (joi) => ({

    type:'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML':'{{#label}} must not include HTML!'
    },
    rules:{
        escapeHTML:{
            validate(value, helpers){
                const clean = sanitizeHtml(value,{
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('stirng.escapeHTML', {value});
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension);

module.exports.validateAttraction = async function(req, res, next) {

    const attractionSchema = Joi.object().keys({
        name: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        country: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    });
   
    const {error} = attractionSchema.validate(req.body);

    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();

    if(!geoData.body.features.length || !inbounds(geoData.body.features[0].geometry.coordinates[0], geoData.body.features[0].geometry.coordinates[1]))
        throw new ExpressError('Invalid location!', 406);

    req.body.geometry = geoData.body.features[0].geometry;

    if(error)    
        throw new ExpressError('Unable to create attraction!', 406);
    else
        next();
}

module.exports.validateReview = function(req, res, next){
   
    const reviewSchema = Joi.object().keys({
        text: Joi.string().required().escapeHTML(),
        rating: Joi.number().integer().min(1).max(5).required(),
    });
    
    const {error} = reviewSchema.validate(req.body);
    
    if(error)       
        throw new ExpressError('Unable to make review!', 406);  
    else
        next();
}

module.exports.isLoggedIn = function(req, res, next){

    if(!req.user){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Must be logged in!');
        return res.redirect('/register');
    }   
    next();
};

module.exports.wrapAsync = function (func) {
    return (req, res, next) => {
        func(req, res, next).catch(err => next(err));
    }
};

// Check if person is authorized to make changes to an attraction
module.exports.isAuthorAttraction = async(req, res, next)=>{
    const {id} = req.params;
    const attraction = await Attraction.findById(id);
    if(!attraction.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/attractions/id?id=${id}`);
    }
    next();
};

// Check if person is authorized to delete review
module.exports.isAuthorReview = async(req, res, next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/attractions/id?id=${id}`);
    }
    next();
};