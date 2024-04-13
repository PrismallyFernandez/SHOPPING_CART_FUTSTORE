const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartSchema = require('../models/carro');

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cart:  {
        type: Object,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Order', schema);