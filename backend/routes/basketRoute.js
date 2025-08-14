import express from "express";
import basketController from "../controllers/basketController.js";
import { authenticateToken } from "../middlewares/authmiddleware.js";



const router = express.Router();

// Auth
router.post('/add', authenticateToken, basketController.addToBasket)
router.get('/me', authenticateToken, basketController.getMyBasket)
router.delete('/me', authenticateToken, basketController.deleteMyBasket)
router.post('/update', authenticateToken, basketController.updateCartItem)


export default router;


