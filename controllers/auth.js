const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User=require('../models/user');
const { validationResult } = require('express-validator');
const path = require('path');

const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:
          ''
      }
    })
  );

exports.getLogin = (req, res, next) => {
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage:message,
        oldInput:{
            email:'',
            password:''
        },
        validationErrors:[]
    });
};

exports.getSignup = (req, res, next) => {
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage:message,
      oldInput:{
        email:"",
        password:'',
        confirmPassword:''
      },
      validationErrors:[]
    });
  };

exports.postLogin = (req, res, next) => {
    const email=req.body.email;
    const password=req.body.password;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'login',
            errorMessage:errors.array()[0].msg,
            oldInput:{email:email, password:password},
            validationErrors:errors.array()
        });
    }
    User.findOne({email:email})
        .then(user=>{
            if(!user){
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'login',
                    errorMessage:'Invalid email or password!',
                    oldInput:{email:email, password:password},
                    validationErrors:[]
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch=>{
                    if(doMatch){
                        req.session.isLoggedIn=true;
                        req.session.user=user;
                        return req.session.save((err)=>{
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'login',
                        errorMessage:'Invalid email or password!',
                        oldInput:{email:email, password:password},
                        validationErrors:[]
                    });
                })
                .catch(err=>res.redirect('/login'))
        })
        .catch(err=>{
            const error=new Error(err);
            error.httpStatuscode=500;
            return next(error);
        })};

exports.postSignup = (req, res, next) => {
    const email=req.body.email;
    const password=req.body.password;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage:errors.array()[0].msg,
            oldInput:{email:email, password:password, confirmPassword:req.body.confirmPassword},
            validationErrors:errors.array()
        });
    }
    
    bcrypt
        .hash(password, 12)
        .then(hashPassword=>{
            const user=new User({
                email:email,
                password:hashPassword,
                cart:{item:[]}
            });
            return user.save();
        })
        .then(result=>{
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'shop@node-complete.com',
                subject: 'Signup succeeded!',
                html: '<h1>You successfully signed up!</h1>'
                });
        })
        .catch(err=>{
            const error=new Error(err);
            error.httpStatuscode=500;
            return next(error);
        })
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(()=>{
        res.redirect('/');
    })
};

exports.getReset=(req,res,next)=>{
    let message=req.flash('error');
    if(message.length>0){
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage:message
      });
};

exports.postReset=(req,res,next)=>{
    crypto.randomBytes(32, (err, buffer)=>{
        if(err){
            return res.redirect('/reset');
        }
        const token=buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user=>{
                if(!user){
                    req.flash('error', 'No account found!');
                    return res.redirect('/reset');
                }
                user.resetToken=token;
                user.resetTokenExpriration=Date.now()+3600000;
                user.save();
            })
            .then(result=>{
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'shop@node-complete.com',
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password Reset</p>
                        <p>Click this <a href="https://locolhost:2000/reset/${token}">link</a> to set a new password </p>
                    `
                  });
            })
            .catch(err=>{
                const error=new Error(err);
                error.httpStatuscode=500;
                return next(error);
            })
    })
}

exports.getNewPassword=(req,res,next)=>{
    const token=req.params.token;
    User.findOne({resetToken: token, resetTokenExpriration: {$gt: Date.now()}})
        .then(user=>{
            let message=req.flash('error');
            if(message.length>0){
                message=message[0];
            }
            else{
                message=null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage:message,
                userId: user._id.toString(),
                passwordToken:token
            });
        })
        .catch(err=>{
            const error=new Error(err);
            error.httpStatuscode=500;
            return next(error);
        })
    
}

exports.postNewPassword=(req,res,next)=>{
    const newPassword=req.body.password;
    const userId=req.body.userId;
    const passwordToken=req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken:passwordToken,
        resetTokenExpriration:{$gt: Date.now()},
        _id:userId
    })
    .then(user=>{
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword=>{
        resetUser.password=hashedPassword;
        resetUser.resetToken=null;
        resetUser.resetTokenExpriration=undefined;
        return resetUser.save();
    })
    .then(result=>{
        res.redirect('/login');
    })
    .catch(err=>{
        const error=new Error(err);
        error.httpStatuscode=500;
        return next(error);
    })
}