import Product from '../models/Product.js';
import pool from '../db.js';
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const { id: userId, username, role } = req.user;
    
    // Get the image URL from Cloudinary upload
    const imageUrl = req.file ? req.file.path : '';
    
    const cleanPrice = Number(price);
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanDescription = typeof description === 'string' ? description.trim() : '';
    const cleanCategory = typeof category === 'string' ? category.trim() : '';
    const cleanQuantity = Number(quantity)

    const errors = [];

    if (!cleanName) errors.push('Product name is required');
    if (!cleanDescription) errors.push('Description is required');
    if (!cleanCategory) errors.push('Category is required');
    if (Number.isNaN(cleanPrice) || cleanPrice < 0) errors.push('Price must be a valid number');
    if (Number.isNaN(cleanQuantity) || cleanQuantity < 0) errors.push('Quantity must be a valid number');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const product = new Product({
      name: cleanName,
      description: cleanDescription,
      price: cleanPrice,
      quantity: cleanQuantity,
      category: cleanCategory,
      image: imageUrl,
      // Track who created the product
      createdBy: userId,
      createdByName: username,
      createdByRole: role,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to create product',
      error: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch products',
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch product',
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, category } = req.body;
    const { id: userId, username, role } = req.user;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (typeof name === 'string') existingProduct.name = name.trim();
    if (typeof description === 'string') existingProduct.description = description.trim();
    if (typeof category === 'string') existingProduct.category = category.trim();
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid number' });
      }
      existingProduct.price = parsedPrice;
    }
    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be a valid number' });
      }
      existingProduct.quantity = parsedQuantity;
    }

    // Update image if a new one is uploaded
    if (req.file) {
      existingProduct.image = req.file.path;
    }

    // Track who updated the product
    existingProduct.updatedBy = userId;
    existingProduct.updatedByName = username;
    existingProduct.updatedByRole = role;

    await existingProduct.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: existingProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update product',
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, username } = req.user;
    
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Optional: Create a deletion log (you can create a separate model for this)
    console.log(`Product "${product.name}" deleted by ${username} (${userId}) at ${new Date()}`);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        productName: product.name,
        deletedBy: username,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete product',
      error: error.message,
    });
  }
};
