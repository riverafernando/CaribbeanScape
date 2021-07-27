const User = require('../models/user');

module.exports.renderRegistrationForm = (req, res)=>{
    res.render('auth/register.ejs');
};
 module.exports.register = async(req, res)=>{
    
    try{

        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);

        // automatically attempts login after registration
        req.login(registeredUser, (err)=>{
            if(err) return next(err);
            
            req.flash('success', 'Welcome to CaribbeanScape!');
            // Return to previous page after login if it exists
            if(req.session.returnTo)
                res.redirect(req.session.returnTo);
            else
                res.redirect('/attractions')
        });
       
    }catch(err){
        req.flash('error', err.message);
        return res.redirect('/register');
    }
};

module.exports.renderLoginForm = async(req, res)=>{
    res.render('auth/login.ejs');
};

module.exports.login = (req, res)=>{
    req.flash('success', `Welcome back ${req.body.username}!`);
    res.redirect('/attractions');
};

module.exports.logout = (req, res)=>{
    req.flash('success', 'Goodbye!');
    req.logOut();
    res.redirect('/attractions');
};

