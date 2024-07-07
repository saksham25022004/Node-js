const path=require('path');

const express=require('express');
const bodyParser=require('body-parser');

const app=express();

app.set('view engine','ejs');
app.set('views', 'views');

const adminData=require('./routes/admin');
const shopRouter=require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.use('/admin',adminData.routes);
app.use(shopRouter);

app.use((req, res, next)=>{
    res.status(404).render('404',{pageTitle:'page not found'});
});

app.listen(2000);