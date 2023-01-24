const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } =  require('express-validator');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');
const Users = require('../models/users');

// Welcome Page
//router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
const baseUrl = process.env.BASE_URL || '';


router.get('/', auth.checkNotAuth, function(req, res) {
    res.render('index', {page: 'home'});
});

router.get('/login', auth.checkNotAuth, function(req, res) {
    res.render('index', {page: 'login', message: req.flash('error')});
});

router.post('/login', function(req, res, next) {
    if(req.body.email && req.body.password) {
        passport.authenticate('local', {
            successRedirect: baseUrl+'/app/overview',
            failureRedirect: baseUrl+'/login',
            failureFlash: true
        })(req, res, next);
    } else {
        res.render('index', {page: 'login', message: 'Fill in all fields'});
    }
});

router.get('/register', auth.checkNotAuth, function(req, res) {
    res.render('index', {page: 'register'});
});

router.post('/register', [
        check('firstname').exists()
        .isLength({min: 3, max: 12}).withMessage('The name must be between 3 and 12 characters long')
        .matches('^[a-zA-Z]+$', 'i').withMessage('The name contains illegal characters'),
        check('lastname').exists()
        .isLength({min: 3, max: 12}).withMessage('Last name must be between 3 and 12 characters long')
        .matches('^[a-zA-Z]+$', 'i').withMessage('The name contains illegal characters'),
        check('email').exists().isEmail().withMessage('Invalid email'),
        check('password').exists().isLength({min: 8, max: 30}).withMessage('The password must be between 8 and 30 characters')
        .matches('^(?=.*[A-Za-z])(?=.*[0-9]).+$').withMessage('The password must contain at least one letter and number')
        .matches('^[A-Za-z0-9@$!%*#?&+=<>:;\._^{}()]+$').withMessage('The password may contain characters: A-Za-z0-9@$!%*#?&+=<>:;._^{}()')
        .custom((value, {req, loc, path}) => {
            if(value != req.body.passwordRepeat) {
                throw new Error('The passwords provided are not the same');
            } else {
                return value;
            }
        })
    ], function(req, res, next) {
    const { firstname, lastname, email, password, passwordRepeat } = req.body;
    if(!firstname || !lastname || !email || !password || !passwordRepeat ) {
        res.render('index', {page: 'register', error: {msg: 'Fill in all fields'}, values: req.body});
    } else {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render('index', {page: 'register', error: errors.array()[0], values: req.body});
        } else {
            Users.findOne({email: email}, (err, user) => {
                if(user) {
                    res.render('index', {page: 'register', error: {msg: 'User with given email address already exists'}, values: req.body});
                } else {
                    const newUser = new Users({
                        firstname,
                        lastname,
                        email,
                        password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save((err, user) => {
                                if(err) console.log(err);
                                res.redirect(baseUrl+'/login');
                            });
                        });
                    });
                }
            });
        }
    }
});

router.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
    res.redirect(baseUrl+'/');
});
});

module.exports = router;