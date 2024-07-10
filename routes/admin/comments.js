const express = require('express')
const router = express.Router()
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin'
    next()
})

router.get('/', (req, res) => {
    Comment.find({user: req.user._id}).lean().populate('user')
    .then(comments => {
        res.render('admin/comments', {comments: comments})
    })
})

router.post('/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {
        
        const newComment = new Comment({
            user: req.user._id,
            body: req.body.body,
        })

        post.comments.push(newComment)
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                req.flash('success_message', 'Your comment was created successfully')
                res.redirect(`/post/${post.slug}`)
            })
        })
    })
})

router.delete('/:id', (req, res) => {
    Comment.findOneAndDelete({_id: req.params.id}).then(deletedComment=>{
        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}).then(()=>{
            res.redirect('/admin/comments')
        })

    })
})

router.post('/approve-comment/:id', (req, res) => {
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}).then(result => {
        res.send(result)
    })
})

module.exports = router