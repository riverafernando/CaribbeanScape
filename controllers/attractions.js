const Attraction = require('../models/attraction');
const ExpressError = require('../utils/ExpressError');
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res)=>{
    let allAttractions = null; 
    if(Object.keys(req.query).length)
    {
        let {filter} = req.query;
        allAttractions = await Attraction.find({});
        allAttractions.sort(function(a,b){
            return filter === '0' ?   b.rating - a.rating:  b.reviews.length - a.reviews.length;
        })
    }
    else
        allAttractions = await Attraction.find({});

    res.render('index.ejs', {allAttractions, search : ''});
};

module.exports.renderNewForm = (req, res)=>{
    res.render('new.ejs');
};

module.exports.search = async (req, res)=>{
    const q = req.query;
    const allAttractions = await Attraction.find({$or: [{country: q}, {location: q}]});
    if(allAttractions.length > 0)
       res.render( 'index.ejs', {allAttractions, search: country})
    else    
       throw new ExpressError('Country Not Found', 404)
};

module.exports.show  = async (req, res)=>{
    const {id} = req.query;
    // Get attraction, populates reviews references and author reference
    const attraction = await Attraction.findById(id).populate({path: 'reviews', populate:{path: 'author'}}).populate('author');
    res.render('show.ejs', {attraction})
};

module.exports.updateAttraction = async (req, res)=>{
    const {id} = req.params;
    const attraction = await Attraction.findByIdAndUpdate(id, req.body); 
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));  
    attraction.images.push(...imgs);
    await attraction.save();
    res.redirect(`/attractions/id?id=${id}`);
};

module.exports.createAttraction = async (req, res)=>{
    
    const {name, location, country, description, geometry} = req.body; 
    const newAttraction = new Attraction({
        name,
        location, 
        country,
        images: req.files.map(f => ({url: f.path, filename: f.filename})),
        description,
        author: req.user._id,
        geometry: geometry,
        rating: 0
    });    
    await newAttraction.save();  
    req.flash('success', 'Successfully made a new attraction!')
    res.redirect(`/attractions/id?id=${newAttraction._id}`);    
};

module.exports.renderEditForm = async (req, res, next)=>{
    const {id}  = req.query;
    const attraction = await Attraction.findById(id);
    res.render('edit.ejs', {attraction});
};

module.exports.renderImages = async(req, res, next)=>{
   const {id} = req.params;   
   const attraction = await Attraction.findById(id);
   res.render('images.ejs', {attraction})
};

module.exports.deleteAttraction = async (req, res, next)=>{
    const {id} = req.params;
    await Attraction.findOneAndDelete({_id: id});
    req.flash('success', 'Successfully deleted attraction!')
    res.redirect('/attractions');
};

module.exports.deleteImage = async (req, res, next)=>{
    const {id} = req.params;
    const {deleteImages} = req.body;
    if(deleteImages)
    {
        for(let filename of deleteImages)          
            await cloudinary.uploader.destroy(filename);
            
        await Attraction.findByIdAndUpdate(id, { $pull : { images : {  filename: { $in : deleteImages }  }  } });
        req.flash('success', 'Successfully deleted image(s)!');
    }
    res.redirect(`/attractions/${id}/images`);
};