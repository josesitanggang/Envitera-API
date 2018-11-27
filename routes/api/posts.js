const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const validatePostInput = require('../../validation/post');
const Post = require('../../models/Post');

router.get('/test',(req,res)=>{
    res.json({status:'success'});
})

//  @route  POST api/posts
//  @desc   Create New Post
//  @access Private
router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{

    const {errors, isValid} = validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    const tags = req.body.tags.split(',');
    const newPost = new Post({
        text:req.body.text,
        title:req.body.title,
        tags:tags,
        category:req.body.category,
        image:req.body.image
    });

    newPost.save().then(post => res.json(post))
        .catch(err=> res.json(err));
})

module.exports = router;