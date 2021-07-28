if(process.env.NODE_ENV !== 'production')
    require('dotenv/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); 
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

// Get Routers
const attractionsRoutes = require('./routes/attractions');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/attraction';
const secret = process.env.SECRET || 'mysecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // time period in seconds,
    secret,
});

store.on("error", function (e) {
    console.log('Store Error', e);
})

mongoose.connect(dbUrl, {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useCreateIndex: true,
        useFindAndModify: false
    }).then(()=>{      
        console.log('MONGO CONNECTED');
    }).catch(err=>{
        console.log("MONGO CONNECTION FAILURE")
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs'); // Allows rendering of ejs files in views directory
path.join('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true})); // Parses incoming url request body
app.use(express.json()); // Parses incoming Request Object (req) to json
app.use(methodOverride('_method')); // Used for more CRUD functionality i.e. Delete and Put request
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize()); // Prevent database injection queries

app.use(session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Used in user authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Sets req local variables for flash messages
app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// Splits Routes into corresponding files for use
app.use('/attractions', attractionsRoutes);
app.use('/attractions/:id/review', reviewsRoutes);
app.use('/register', usersRoutes);

// Home Page
app.get('/', (req, res)=>{
    res.render('home.ejs')
})

// Error middleware catcher
app.use((err, req, res, next)=>{    
    console.log(err);   
    const {status = 500, message = "Something Went Wrong!"} = err;
   
    if(req.session.returnTo)
        res.status(status).redirect(req.session.returnTo);
    else
        res.status(status).redirect('/attractions');
});

const port = process.env.PORT || 3000;

// Start Server
app.listen(port, ()=>{
    console.log(`ON PORT ${port}`);
});
