
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = function cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = (item, id) => {
        let storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {
                item: item,
                qty: 0,
                price: 0
            };
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    }

    this.reduceByOne = id => {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    }

    
    this.addOne = id => {
        this.items[id].qty++;
        this.items[id].price += this.items[id].item.price;
        this.totalQty++;
        this.totalPrice += this.items[id].item.price;
      }
      

    this.removeItem = function (id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    this.generateArray = () => {
        let arr = [];
        for (const id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }

};

    // const cartSchema = new Schema({
    //     items: [{
    //         producto: {
    //             type: String,
    //             required: true
    //         },
    //         cantidad: {
    //             type: Number,
    //             required: true
    //         },
    //         precio: {
    //             type: Number,
    //             required: true
    //         }
    //     }],
    //     totalQty: {
    //         type: Number,
    //         required: true
    //     },
    //     totalPrice: {
    //         type: Number,
    //         required: true
    //     }
    // });

    // module.exports = mongoose.model('Cart', cartSchema);
