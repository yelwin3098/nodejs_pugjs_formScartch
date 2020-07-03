const express=require('express');
const router=express.Router();
const Articles=require('../models/articles');
const User=require('../models/user');

router.get('/add',ensureAuthenticated,(req,res)=>{
    res.render('addArticle',{
        head_title:"Article Form",
        content:"Add Article"
    })
});

router.post('/add',(req,res)=>{
    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('addArticle', {
        title:'Add Article',
        errors:errors
        });
    } else {
    let article=new Articles();
    article.title=req.body.title;
    article.author=req.user._id;
    article.body=req.body.body;

    article.save((err)=>{
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('success','Article Added');
            res.redirect('/')
        }
    })
    }
})
router.get('/:id',(req,res)=>{
    Articles.findById(req.params.id,(err,article)=>{
        User.findById(article.author,(err,user)=>{
            if(err){
                console.log(err);
            }else{
                res.render('single_article',{
                    head_title:"View Article",
                    article:article,
                    author:user.name
                })
            }
        })
    })
})
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
    Articles.findById(req.params.id,(err,article)=>{
        if(err){
            console.log(err);
        }else{
            res.render('edit_article',{
                head_title:"Edit Article",
                article:article
            })
        }
    })
})
router.post('/edit/:id',(req,res)=>{
    let article={};
    article.title=req.body.title;
    article.author=req.body.author;
    article.body=req.body.body;
    let query={_id:req.params.id}
    Articles.updateOne(query,article,(err,article)=>{
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('success','Article Updated');
            res.redirect('/');
        }
    })
})
router.get('/delete/:id',ensureAuthenticated, function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
    
      let query = {_id:req.params.id}
    
      Articles.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
          res.status(500).send();
        } else {
          Articles.remove(query, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
        }
      });
  });
  // Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
      return next();
    } else {
      req.flash('danger', 'Please login');
      res.redirect('/user/login');
    }
  }
  module.exports = router;