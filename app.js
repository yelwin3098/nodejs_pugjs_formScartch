const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const session=require('express-session');
const expressValidator=require('express-validator');
const flash=require('connect-flash');
const cookieParser=require('cookie-parser');
const passport=require('passport');
const Articles=require('./models/articles');
const articleRouter=require('./routes/articles');
const userRoute=require('./routes/user');

const app=express();
const port=process.env.PORT || 3000;

const url=process.env.MONGOD_URI || "mongodb://localhost:27017/nodesk";

try{
    mongoose.connect(url,{
        //useMongoClient:true
        useNewUrlParser:true,
        useUnifiedTopology: true 
    },
    console.log('MongoDB connected'));
}catch(error){
    console.log(error)
}

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')))

app.use(cookieParser());
// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
  
  // Express Messages Middleware
  app.use(flash());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  
//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace=param.split('.'),
            root =namespace.shift(),
            formParam=root;
        while(namespace.length){
            formParam+='[' + namespace.shift() + ']';
        }
        return {
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));
 
//Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});
app.get('/',(req,res)=>{
    Articles.find({},function(err,articles){
        if(err){
            console.log(err)
        }else{
            res.render('index',{
                head_title:"Home Page",
                articles:articles
            });
        }
    });
});

app.use('/article',articleRouter);
app.use('/user',userRoute);


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
