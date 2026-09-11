import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/ProductController.js';
import { protect,authorizeAdmin} from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
const router = express.Router();

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', authorizeAdmin, deleteProduct);

export default router;
