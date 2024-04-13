var express = require('express');
var router = express.Router();

const Product = require('../models/producto');
const Cart = require('../models/carro');
const Order = require('../models/orden');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    let successMsg = req.flash('success')[0];
    const products = await Product.find({}).lean();
    let productsChunks = [];
    let chunkSize = 4;
    for (let i = 0; i < products.length; i += chunkSize) {
      productsChunks.push(products.slice(i, i + chunkSize));
    }
    res.render('shop/index', {
      title: 'FutStore',
      products: productsChunks,
      successMsg: successMsg,
      noMessages: !successMsg
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los productos de la base de datos');
  }
});


router.get('/add-to-cart/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, productId);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/add/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, productId);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/shopping-cart');
  });
});

router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/vaciar', function (req, res) {

  delete req.session.cart;
  
  req.flash('success', 'Carro Vacío');
  res.redirect('/shopping-cart');

});


router.get('/reduce/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', (req, res, next) => {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {
      products: null
    });
  }
  let cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.get('/checkout', isLoggedIn,(req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  let cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg
  });
});

router.post('/checkout', isLoggedIn,(req, res, next) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = new Cart(req.session.cart);

      var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name
    });
    order.save(function (err, result) {
      req.flash('success', 'Compra Realizada');
      console.log("Datos del pedido a guardar:", order); 

      console.log('Guardado');
      req.session.cart = null;
      res.redirect('/');
    });
  });


module.exports = router;


//Methods middleware 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/usuario/signin');
}