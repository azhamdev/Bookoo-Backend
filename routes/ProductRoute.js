import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/Products.js'
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/products', verifyUser, getProducts);
router.get('/products/:id', verifyUser, getProductById);
// router.post('/products', verifyUser, adminOnly, createProduct);
router.post('/products', verifyUser, createProduct);
// router.patch('/products/:id', verifyUser, adminOnly, updateProduct);
router.patch('/products/:id', verifyUser, updateProduct);
// router.delete('/products/:id', verifyUser,adminOnly, deleteProduct);
router.delete('/products/:id', verifyUser, deleteProduct);

export default router;