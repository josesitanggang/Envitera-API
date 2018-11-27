const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const validatePostInput = require('../../validation/post');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

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
        user:req.user.id,
        avatar:req.user.avatar,
        name:req.user.name,
        text:req.body.text,
        title:req.body.title,
        tags:tags,
        category:req.body.category,
        image:req.body.image
    });

    newPost.save().then(post => res.json(post))
        .catch(err=> res.json(err));
})

//  @route  GET api/posts
//  @desc   Get All Post
//  @access Public
router.get('/',(req,res)=>{
    Post.find().sort({date:-1})
    .populate('user',['name','avatar'])
    .then(posts=>res.json(posts))
    .catch(err => res.status(404).json(err));
})

//  @route  GET api/posts/:id
//  @desc   Get Single Post by Id
//  @access Public
router.get('/:id',(req,res)=>{
    Post.findById(req.params.id)
    .populate('user',['name','avatar'])
    .then(posts=>res.json(posts))
    .catch(err => res.status(404).json({msg:"no post found by given id"}));
})

//  @route  DELETE api/posts/:id
//  @desc   Delete Single Post by Id
//  @access Private
router.delete('/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            Post.findById(req.params.id)
                .then(post=>{
                    //check for owner post
                    if(post.user.toString()!==req.user.id){
                        return res.status(401).json({notautorized:'User not autorized'});
                    }
                    //Delete
                    post.remove().then(()=>res.json({success:true}))
                        .catch(err=> res.status(404).json({notpostfound:"No post found"}))
                })
        })
})

module.exports = router;