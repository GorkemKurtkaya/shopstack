import express from "express";
import {getAUser, changeNameandMail, updateUser, deleteUser, getUsers} from "../controllers/userController.js";
import { authenticateToken, requireAdmin } from "../middlewares/authmiddleware.js";

const router = express.Router();


router.get('/', authenticateToken, requireAdmin, getUsers);

// Public
router.route('/:id').get(getAUser);
router.put("/changeNameandMail", authenticateToken, changeNameandMail);


//Admin
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);






export default router;
