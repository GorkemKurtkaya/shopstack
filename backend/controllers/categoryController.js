import { listActiveCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryService.js";

export const getCategories = async (req, res) => {
	try {
		const sort = req.query.sort || 'name';
		const cats = await listActiveCategories(sort);
		return res.status(200).json(cats);
	} catch (e) {
		return res.status(500).json({ message: e.message });
	}
};

export const adminCreateCategory = async (req, res) => {
	try {
		const { name, active } = req.body;
		const cat = await createCategory(name, active);
		return res.status(201).json(cat);
	} catch (e) {
		return res.status(400).json({ message: e.message });
	}
};

export const adminUpdateCategory = async (req, res) => {
	try {
		const cat = await updateCategory(req.params.id, req.body);
		return res.status(200).json(cat);
	} catch (e) {
		const status = e.message.includes('bulunamadı') ? 404 : 400;
		return res.status(status).json({ message: e.message });
	}
};

export const adminDeleteCategory = async (req, res) => {
	try {
		const result = await deleteCategory(req.params.id);
		return res.status(200).json(result);
	} catch (e) {
		return res.status(400).json({ message: e.message });
	}
};
