const express = require('express')
const router = express.Router()
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const { isEmpty, uploadDir } = require('../../helpers/upload-helper')
const fs = require('fs')


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

router.get('/', (req, res) => {
    Post.find({}).lean()
        .populate('category')
        .then(posts => {
        res.render('admin/posts/index', {posts: posts})
        })
})

router.get('/my-posts', (req, res) => {
    Post.find({user: req.user._id}).lean()
    .populate('category')
    .then(posts => {
    res.render('admin/posts/my-posts', {posts: posts})
    })
})

router.get('/create', (req, res) => {
    Category.find({}).lean().then(categories => {
        res.render('admin/posts/create', {categories: categories})
    })
})

router.post('/create', (req, res) => {

    let errors = []

    if(!req.body.title) {
        errors.push({message: 'Please add a title'})
    } 
    if(!req.body.body) {
        errors.push({message: 'Please add a description'})
    } 
    if(errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        })
    }
    else {
        let fileName = ''
        if(!isEmpty(req.files)) {
            let file = req.files.file
            fileName = Date.now() + '-' + file.name
    
            file.mv('./public/uploads/' + fileName, (err) => {
                if (err) throw err
            })
        }
        
        let allowComments = true
        if(req.body.allowComments) {
            allowComments = true
        } else {
            allowComments = false
        }
    
        const newPost = new Post({
            user: req.user._id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category: req.body.category,
            file: fileName
        })
    
        newPost.save().then(savedPost => {
            req.flash('success_message', `Post "${savedPost.title}" was created successfully`)
            res.redirect('/admin/posts/my-posts')
        }).catch(err => {
            
            console.log('Could not save post', err)
        })
    }
})

router.get('/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then(post => {
        Category.find({}).lean().then(categories => {
            res.render('admin/posts/edit', {post: post, categories: categories})
        })
    })
})


router.put('/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {

        let fileName = ''
        if(!isEmpty(req.files)) {
            let file = req.files.file
            fileName = Date.now() + '-' + file.name
            post.file = fileName
            file.mv('./public/uploads/' + fileName, (err) => {
                if (err) throw err
            })
        }

        if(req.body.allowComments) {
            allowComments = true
        } else {
            allowComments = false
        }

        post.user = req.user._id
        post.title = req.body.title
        post.status = req.body.status
        post.allowComments = allowComments
        post.body = req.body.body
        post.category = req.body.category

        post.save().then(updatedPost => {
            req.flash('success_message', `Post "${updatedPost.title}" was updated successfully`)
            res.redirect('/admin/posts/my-posts')
        })

    })
})

router.delete('/:id', (req, res) => {
    Post.findOneAndDelete({_id: req.params.id})
        .populate('comments')
        .then(post => {
            fs.unlink(uploadDir + post.file, (err) => {
                if (!post.comments.length < 1) {
                    post.comments.forEach(comment => {
                        comment.deleteOne({_id: comment._id}).then()
                    })
                }
                req.flash('success_message', `Post "${post.title}" was deleted successfully`)
                res.redirect('/admin/posts/my-posts')
            })
        })
})


module.exports = router