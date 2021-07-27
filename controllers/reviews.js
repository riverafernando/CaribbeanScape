const Attraction = require('../models/attraction');
const Review = require('../models/review.js');

module.exports.postReview = async (req, res)=>{

    const {id} = req.params;
    const {text, rating} = req.body;  
   // console.log(req.body);  
    const review = new Review({text, rating, author: req.user._id});
    const attraction = await Attraction.findById(id);
    await attraction.reviews.push(review);
    attraction.rating = (attraction.rating + rating)/attraction.reviews.length;
    await review.save();
    await attraction.save();
    res.redirect(`/attractions/id?id=${id}`);   

};

module.exports.deleteReview = async (req, res)=>{

    const {id, reviewId} = req.params;
    const attraction = await Attraction.findByIdAndUpdate(id , {$pull: {reviews: reviewId}})
    const {rating} = await Review.findByIdAndDelete(reviewId);
    attraction.rating = (attraction.rating - rating)/attraction.reviews.length;
    await attraction.save(); 
    res.redirect(`/attractions/id?id=${id}`);
    
};