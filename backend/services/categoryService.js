import Category from "../models/categorymodel.js";
import slugify from "slugify";

export const listActiveCategories = async (sort = 'name') => {
	const sortObj = sort === 'createdAt' ? { createdAt: -1 } : { name: 1 };
	return Category.find({ active: true }).sort(sortObj);
};

export const listAllCategories = async (sort = 'name') => {
	const sortObj = sort === 'createdAt' ? { createdAt: -1 } : { name: 1 };
	return Category.find().sort(sortObj);
};

export const getCategoryFromId = async (id) => {
	const category = await Category.findById(id);
	if (!category) throw new Error('Kategori bulunamadı');
	return category;
}



export const createCategory = async (name, active = true) => {
	if (!name) throw new Error('name gerekli');
	const slug = slugify(name, { lower: true, strict: true });
	const exists = await Category.findOne({ slug });
	if (exists) throw new Error('Kategori zaten var');
	return Category.create({ name, slug, active });
};

export const updateCategory = async (id, data) => {
	const cat = await Category.findById(id);
	if (!cat) throw new Error('Kategori bulunamadı');
	if (data.name) {
		cat.name = data.name;
		cat.slug = slugify(data.name, { lower: true, strict: true });
	}
	if (typeof data.active === 'boolean') cat.active = data.active;
	await cat.save();
	return cat;
};

export const deleteCategory = async (id) => {
	await Category.findByIdAndDelete(id);
	return { message: 'Kategori silindi' };
};
