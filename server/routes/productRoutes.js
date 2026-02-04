const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Initialize upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept any image/* mime type; fallback to extension check.
    const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (isImageMime || extname) {
      return cb(null, true);
    }
    cb(new Error('Images Only!'));
  }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { keyword, category, brand, pageNumber } = req.query;
    
    const pageSize = 8;
    const page = Number(pageNumber) || 1;
    
    const query = {};
    
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (brand && brand !== 'All') {
      query.brand = brand;
    }
    
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const parseSizes = (sizesValue) => {
  if (!sizesValue) return [];
  if (Array.isArray(sizesValue)) return sizesValue.map((s) => String(s).trim()).filter(Boolean);
  return String(sizesValue)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseSpecifications = (specValue) => {
  if (!specValue) return [];
  if (Array.isArray(specValue)) return specValue;
  const text = String(specValue);
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');
      return {
        label: label?.trim() || 'Spec',
        value: rest.join(':').trim()
      };
    })
    .filter((spec) => spec.value);
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, sizes, specifications } = req.body;
    
    // Process image paths
    const images = req.files.map(file => `/uploads/${file.filename}`);
    
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      brand,
      stock: Number(stock),
      images,
      sizes: parseSizes(sizes),
      specifications: parseSpecifications(specifications),
      user: req.user._id
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, sizes, specifications } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price ? Number(price) : product.price;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.stock = stock ? Number(stock) : product.stock;
      if (sizes !== undefined) {
        product.sizes = parseSizes(sizes);
      }
      if (specifications !== undefined) {
        product.specifications = parseSpecifications(specifications);
      }
      
      // Handle images
      if (req.files && req.files.length > 0) {
        const images = req.files.map(file => `/uploads/${file.filename}`);
        product.images = images;
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      await product.remove();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
