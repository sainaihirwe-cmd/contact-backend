import pool from '../db.js';

const productColumns = `
  id, name, description, price, quantity, category, image,
  created_by AS "createdBy", created_by_name AS "createdByName", created_by_role AS "createdByRole",
  updated_by AS "updatedBy", updated_by_name AS "updatedByName", updated_by_role AS "updatedByRole",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

const parseProductId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const { id: userId, username, role } = req.user;
    const imageUrl = req.file ? req.file.path : '';
    const cleanPrice = Number(price);
    const cleanQuantity = Number(quantity);
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanDescription = typeof description === 'string' ? description.trim() : '';
    const cleanCategory = typeof category === 'string' ? category.trim() : '';
    const errors = [];

    if (!cleanName) errors.push('Product name is required');
    if (!cleanDescription) errors.push('Description is required');
    if (!cleanCategory) errors.push('Category is required');
    if (Number.isNaN(cleanPrice) || cleanPrice < 0) errors.push('Price must be a valid number');
    if (Number.isNaN(cleanQuantity) || cleanQuantity < 0) errors.push('Quantity must be a valid number');
    if (!Number.isInteger(cleanQuantity)) errors.push('Quantity must be a whole number');
    if (errors.length > 0) return res.status(400).json({ success: false, errors });

    const result = await pool.query(
      `INSERT INTO products
       (name, description, price, quantity, category, image, created_by, created_by_name, created_by_role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${productColumns}`,
      [cleanName, cleanDescription, cleanPrice, cleanQuantity, cleanCategory, imageUrl, userId, username, role]
    );

    return res.status(201).json({ success: true, message: 'Product created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Unable to create product', error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${productColumns} FROM products ORDER BY created_at DESC`);
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch products', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: 'Invalid product id' });

  try {
    const result = await pool.query(`SELECT ${productColumns} FROM products WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch product', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: 'Invalid product id' });

  try {
    const { name, description, price, quantity, category } = req.body;
    const { id: userId, username, role } = req.user;
    const existing = await pool.query(`SELECT ${productColumns} FROM products WHERE id = $1`, [id]);
    if (existing.rowCount === 0) return res.status(404).json({ success: false, message: 'Product not found' });

    const current = existing.rows[0];
    const nextPrice = price === undefined ? current.price : Number(price);
    const nextQuantity = quantity === undefined ? current.quantity : Number(quantity);
    if (Number.isNaN(nextPrice) || nextPrice < 0) return res.status(400).json({ success: false, message: 'Price must be a valid number' });
    if (Number.isNaN(nextQuantity) || nextQuantity < 0 || !Number.isInteger(nextQuantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a valid whole number' });
    }

    const result = await pool.query(
      `UPDATE products SET
       name = $1, description = $2, price = $3, quantity = $4, category = $5,
       image = COALESCE($6, image), updated_by = $7, updated_by_name = $8,
       updated_by_role = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING ${productColumns}`,
      [
        typeof name === 'string' ? name.trim() : current.name,
        typeof description === 'string' ? description.trim() : current.description,
        nextPrice,
        nextQuantity,
        typeof category === 'string' ? category.trim() : current.category,
        req.file ? req.file.path : null,
        userId,
        username,
        role,
        id,
      ]
    );

    return res.status(200).json({ success: true, message: 'Product updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Unable to update product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: 'Invalid product id' });

  try {
    const { id: userId, username } = req.user;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING name', [id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Product not found' });

    console.log(`Product "${result.rows[0].name}" deleted by ${username} (${userId}) at ${new Date()}`);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { productName: result.rows[0].name, deletedBy: username, deletedAt: new Date() },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete product', error: error.message });
  }
};