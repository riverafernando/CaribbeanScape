const mongoose = require('mongoose');
const Attraction = require('./models/attraction');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/attraction', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{                     //       ^ specifies which db to use, creates if no exists
        console.log('MONGO CONNECTED');
    }).catch(err=>{
        console.log("MONGO CONNECTION FAILURE")
    });


const names = [

    'Woodcastle',
    'Ostcrest',
    'Glasshedge',
    'Eastsilver',
    'Dragonview',
    'Wildebeach',
    'Prynesse',
    'Sagewynne',
    'Ostwald',
    'Springtown',
    'Baybarrow',
    'Blackhaven',
    'Lochspring',
    'Shorewick',
    'Wheatfort',
    'Aelton',
    'Bridgeholl',
    'Icetown',
    'Summerdell',
    'Glassbush'
]

const locations = [

    'Hamdaler',
    'New Mid',
    'Saltkarfs',
    'Sageneser',
    'Waterwo',
    'Hardby',
    'Pailwic',
    'New Spring',
    'Rosepor',
    'Holtsmoa',
    'Hollowd Uged',
    'Chatwicke',
    'Sandham Rich',
    'Sageton',
    'Dodgebu',
    'East Grim',
    'West Now',
    'Westfor',
    'Cruxvil',
    'Clamtowers'
]

const countries = [

'Benin',
'Nicaragua',
'Croatia',
'Tuvalu',
'Niger',
'Chile',
'Sao Tome and Principe',
'Guinea-Bissau',
'Sierra Leone',
'Sint Maarten',
'Spain',
'Malawi',
'Hong Kong',
'Guernsey',
'Turkey',
'Latvia',
'Puerto Rico',
'Morocco',
'South Georgia',
'South Korea'

]


const seedDb = async() =>{
    await Attraction.deleteMany({});
    await Review.deleteMany({});
  
    for(let i = 0; i < names.length; i++)
    {
        const randLongitiude = Math.random() * 90 * (Math.random() < 0.5 ? -1: 1);
        const randLatitude = Math.random() * 20 * (Math.random() < 0.5 ? -1: 1);
        const newAttraction = new Attraction({
            name: names[i].toLowerCase(), 
            location: locations[i].toLowerCase(), 
            country: countries[i].toLowerCase(),
            description: 'Description Goes Here',
            reviews: [],
            author: '60c10ac65dd929087e30a660',
            images: [],
            geometry: {

                type: 'Point',
                coordinates:[randLongitiude, randLatitude]
                    
            },
            rating: 0
        });
        await newAttraction.save();
    }
   
} 

seedDb().then(()=>{
    mongoose.connection.close();
});