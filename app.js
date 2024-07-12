const path=require('path');

const express=require('express');
const bodyParser=require('body-parser');

const errorController=require('./controllers/error');
const mongoConnect=require('./util/database').mongoConnect;

const app=express();

app.set('view engine','ejs');
app.set('views', 'views');

const adminData=require('./routes/admin');
const shopRouter=require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.use((req,res,next)=>{
    next();
});

app.use('/admin',adminData);
app.use(shopRouter);

app.use(errorController.get404);

mongoConnect(()=>{
    app.listen(2000);
});
