const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // Find all products and include associated Category and Tag data
    const products = await Product.findAll({
      include: [Category, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // Find a single product by its `id` and include associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [Category, { model: Tag, through: ProductTag }],
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    // Create a new product
    const product = await Product.create(req.body);

    // If there are product tags, create pairings in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const updatedProduct = await Product.update(req.body, {
      where: { id: req.params.id },
    });

    // If there are product tags, update them in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      await ProductTag.destroy({ where: { product_id: req.params.id } });
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: req.params.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

// delete product
router.delete('/:id', async (req, res) => {
  try {
    // Delete one product by its `id` value
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id },
    });
    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
