const path = require('path')

module.exports = {

    uploadDir: path.join(__dirname, '../public/uploads/'),

    isEmpty: function(obj) {
        for(let key in obj) {
            if(Object.prototype.hasOwnProperty.bind(obj, key)) {
                return false
            }
        }
        return true
    }
}