const express = require('express')
const router = express.Router()
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { model } = require('mongoose')
const LocalStrategy = require('passport-local').Strategy

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home'
    next()
})

router.get('/', (req, res) => {

    const perPage = 10
    const page = req.query.page || 1

    Post.find({}).lean()
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('user')
        .then(posts => {
            Post.countDocuments().then(postCount => {
                Category.find({}).lean().then(categories => {
                    res.render('home/index', {
                        posts: posts, 
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage),
                        postCount: postCount,
                    })
                })
            })
        })
})

router.get('/about', (req, res) => {
    res.render('home/about')
})

router.get('/register', (req, res) => {
    res.render('home/register')
})

router.post('/register', (req, res) => {
    let errors = []


    if(!req.body.firstName) {
        errors.push({message: 'Please enter your first name'})
    } 
    if(!req.body.lastName) {
        errors.push({message: 'Please enter your last name'})
    } 
    if(!req.body.email) {
        errors.push({message: 'Please enter your email'})
    } 
    if(!req.body.password && !req.body.passwordConfirm) {
        errors.push({message: 'Please enter your password'})
    } 
    if(req.body.password != req.body.passwordConfirm) {
        errors.push({message: "Password fields don't match"})
    } 
    if(errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        })
    }
    else {
        User.findOne({email: req.body.email}).then(user => {
            if(user) {
                req.flash('error_message', 'Email already exists, please login')
                res.redirect('/login')
            }
            else{
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    username: req.body.username,
                    password:  req.body.password,
                })
        
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You are now registered, please login')
                            res.redirect('/login')
                        })
                    })
                })
            }
        })
    }
})

router.get('/login', (req, res) => {
    res.render('home/login')
})

// APP LOGIN

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({email: email}).then(user => {
        if(!user) return done(null, false, {message: 'User not found'})
        
        bcrypt.compare(password, user.password, (err, matched) => {
            if(err) return err

            if(matched) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'Incorrect password'})
            }
        })
    })
}))
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true,
        
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logOut(done => {
        req.flash('success_message', 'You are logged out')
        res.redirect('/login')
    })
})

router.get('/post/:slug', (req, res) => {
    Post.findOne({slug: req.params.slug}).lean()
        .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
        .populate('user')
        .then(post => {
            Category.find({}).lean().then(categories => {
                res.render('home/post', {post: post, categories: categories})

            })
        })
})

module.exports = router