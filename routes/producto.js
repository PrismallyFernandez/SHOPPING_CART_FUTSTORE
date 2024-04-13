const express = require('express');
const router = express.Router();
const Product = require('../models/producto');

router.get('/insertar-producto', (req, res) => {
    res.render('insertar-producto');
});

router.post('/insertar-producto', (req, res) => {
    const { imagePath, title, description, price } = req.body;
    
    const newProduct = new Product({
        imagePath: imagePath,
        title: title,
        description: description,
        price: price
    });

    newProduct.save()
        .then(() => {
            res.redirect('/'); 
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error al insertar el producto en la base de datos');
        });
});

module.exports = router;
