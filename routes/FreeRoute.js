import express from 'express';
import {
  getFree, createFree, getFreeById, updateFree, deleteFree
} from '../controllers/Free.js'
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/freeproducts', getFree);
router.get('/freeproducts/:id', getFreeById);
router.post('/freeproducts', verifyUser, adminOnly, createFree);
router.patch('/freeproducts/:id', verifyUser, adminOnly, updateFree);
router.delete('/freeproducts/:id', verifyUser, adminOnly, deleteFree);
// router.patch('/products/:id', verifyUser, updateProduct);
// router.post('/products', verifyUser, createProduct);
// router.delete('/products/:id', verifyUser, deleteProduct);

export default router;