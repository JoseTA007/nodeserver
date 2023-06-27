const express = require('express');
const mongoose = require('mongoose');
const Product = require('./product');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
mongoose.connect('mongodb+srv://45600874:Veronic0@cluster0.aswbijj.mongodb.net/flutterproyect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });

// Ruta para agregar un producto
app.post('/api/add_product', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(200).json(savedProduct);
    } catch (error) {
        res.status(400).json({ status: 'Error', message: error.message });
    }
});

// Ruta para obtener todos los productos (excluyendo los eliminados)
app.get('/api/get_products', async (req, res) => {
    try {
        const products = await Product.find({ deleted: false });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

/* // Ruta para buscar productos por nombre
app.get('/api/search_products', async (req, res) => {
    const nombreProducto = req.query.nombre;

    try {
        const regex = new RegExp(nombreProducto, 'i');
        const productos = await Product.find({ pname: regex, deleted: false });
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
}); */
// Ruta para buscar productos por nombre o ID
app.get('/api/search_products', async (req, res) => {
    const { search } = req.query;

    try {
        let products;

        // Verificar si el parámetro de búsqueda es un número (posible ID del producto)
        if (!isNaN(search)) {
            // Búsqueda por ID del producto
            products = await Product.find({
                _id: search,
                deleted: false
            });
        } else {
            // Búsqueda por nombre del producto
            products = await Product.find({
                pname: { $regex: search, $options: 'i' },
                deleted: false
            });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});



// Ruta para actualizar un producto
app.patch('/api/update_product/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ status: 'Error', message: error.message });
    }
});

// Ruta para eliminar un producto (soft delete)
app.delete('/api/delete_product/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const deletedProduct = await Product.findByIdAndUpdate(productId, { deleted: true }, { new: true });
        res.status(200).json({ status: 'Success', message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ status: 'Error', message: error.message });
    }
});

// Iniciar el servidor
app.listen(2000, '0.0.0.0', () => {
    console.log('Server started on port 2000');
});
