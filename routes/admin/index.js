const express = require('express')
const router = express.Router()
const {faker} = require('@faker-js/faker')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const Category = require('../../models/Category')
const User = require('../../models/User')
const {userAuthenticated} = require('../../helpers/authentication')

router.all('/*', userAuthenticated,(req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

router.get('/', (req, res) => {
    const promises = [
        Post.countDocuments().exec(),
        Comment.countDocuments().exec(),
        Category.countDocuments().exec(),
        User.countDocuments().exec()
    ]

    Promise.all(promises).then(([postCount, commentCount, categoryCount, userCount]) => {
        res.render('admin/index', {
            postCount: postCount, 
            commentCount: commentCount, 
            categoryCount: categoryCount, 
            userCount: userCount
        })
    })
})

router.post('/generate-fake-posts', (req, res) => {
    for(let i = 0; i < req.body.amount; i++) {
        let post = new Post()

        post.title = faker.lorem.sentence()
        post.user = req.user._id
        post.status = 'public'
        post.allowComments = faker.datatype.boolean()
        post.body = faker.lorem.paragraphs()
        post.slug = faker.lorem.sentence()
        post.save().then(savedPost=>{})
    }
    res.redirect('/admin/posts/my-posts')
})

// router.get('/dashboard', (req, res) => {
//     res.render('admin/dashboard')
// })

module.exports = router