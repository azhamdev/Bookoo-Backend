import express from 'express';
import {
  getArticle, getArticleById, createArticle, updateArticle, deleteArticle
} from '../controllers/Article.js'
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/articles', getArticle);
router.get('/articles/:id', getArticleById);
router.post('/articles', verifyUser, adminOnly, createArticle);
router.patch('/articles/:id', verifyUser, adminOnly, updateArticle);
router.delete('/articles/:id', verifyUser, adminOnly, deleteArticle);
// router.patch('/products/:id', verifyUser, updateProduct);
// router.post('/products', verifyUser, createProduct);
// router.delete('/products/:id', verifyUser, deleteProduct);

export default router;