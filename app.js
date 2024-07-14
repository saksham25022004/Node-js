const path=require('path');

const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');

const errorController=require('./controllers/error');
//const User= require('./models/user');

const app=express();

app.set('view engine','ejs');
app.set('views', 'views');

const adminData=require('./routes/admin');
const shopRouter=require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

/*app.use((req,res,next)=>{
    User.findById('6692bc385652e245b05f8241')
        .then(user=>{
            req.user=new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err=>console.log(err))
});*/

app.use('/admin',adminData);
app.use(shopRouter);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://saksham:W9Gqe1CXMq2WYEhf@cluster0.qcxjood.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
    .then(result=>{
        app.listen(2000);
    })
    .catch(err=>{
        console.log(err);
    })
