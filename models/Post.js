const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const Schema = mongoose.Schema

const PostSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    file: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now()
    },
    slug: {
        type: String,
        slug: "title",
        unique: true,
        slugPaddingSize: 2
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }],

})

mongoose.plugin(slug)

module.exports = mongoose.model('posts', PostSchema)