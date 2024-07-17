const express = require('express');

const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User=require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email!')
            .normalizeEmail(),
        body('password','Please enter a password with only numbers and text and at least 5 character!')
            .isLength({min:5})
            .isAlphanumeric()
            .trim(),
    ],
     authController.postLogin);

router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter valid email!')
            .custom((value,{req})=>{
                return User.findOne({email: value})
                    .then(userDoc=>{
                        if(userDoc){
                            return Promise.reject('E-mail exist already.');
                        }
                });
            })
            .normalizeEmail(),
        body('password','Please enter a password with only numbers and text and at least 5 character!')
            .isLength({min:5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, {req})=>{
                if(value!==req.body.password){
                    throw new Error('Passwords have to match!');
                }
                return true;
            })
    ],
     authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.get('/new-password', authController.postNewPassword);

module.exports = router;