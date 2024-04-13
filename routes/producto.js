const express = require('express');
const router = express.Router();
const Product = require('../models/producto');
var auth = require('../config/auth');

var isAdmin = auth.isAdmin;

router.get('/insertar-producto', isAdmin, async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        res.render('user/insertar-producto', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los productos de la base de datos');
    }
});

router.post('/insertar-producto', async (req, res) => {
    const { imagePath, title, description, price } = req.body;
    
    if (!imagePath || !title || !description || !price) {
        return res.render('user/insertar-producto', { errorMessage: 'Por favor, complete todos los campos.' });
    }

    const newProduct = new Product({
        imagePath: imagePath,
        title: title,
        description: description,
        price: price
    });

    try {
        await newProduct.save();
        req.flash('successMessage', 'Producto creado con éxito');
        res.redirect('/producto/insertar-producto'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al insertar el producto en la base de datos');
    }
});

const renderEditForm = async (req, res) => {
    try {
      const producto = await Product.findById(req.params.id).lean();
      if (!producto) {
        req.flash("error_msg", "Producto no encontrado");
        return res.redirect("/producto/insertar-producto");
      }
      res.render("editar-producto", { producto });
    } catch (error) {
      console.error(error);
      req.flash("error_msg", "Error al obtener el producto de la base de datos");
      res.redirect("/producto/insertar-producto");
    }
  };

const updateProduct = async (req, res) => {
    try {
      const { imagePath, title, description, price } = req.body;
      await Product.findByIdAndUpdate(req.params.id, { imagePath, title, description, price });
      req.flash("successMessage", "Producto actualizado exitosamente");
      res.redirect("/producto/insertar-producto");
    } catch (error) {
      console.error(error);
      req.flash("error_msg", "Error al actualizar el producto");
      res.redirect("/producto/insertar-producto");
    }
};

router.get("/editar/:id", isAdmin, renderEditForm);

router.post("/editar-producto/:id", updateProduct);

router.get('/borrar/:id', isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.findByIdAndRemove(productId);
        req.flash('successMessage', 'Producto eliminado con éxito');
        res.redirect('/producto/insertar-producto');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el producto de la base de datos');
    }
});

module.exports = router;
