import Product from "../models/productmodel.js";
import Category from "../models/categorymodel.js";

// Ürün oluşturma
export const createProductService = async (userRole, data, imagePaths = []) => {
    const { name, description, category, price, stock, specifications, tags, featured, variants } = data;

    const missing = [];
    if (!name) missing.push('name');
    if (!description) missing.push('description');
    if (!category) missing.push('category');
    if (price === undefined || price === null || Number.isNaN(Number(price))) missing.push('price');
    if (stock === undefined || stock === null || Number.isNaN(Number(stock))) missing.push('stock');
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) missing.push('images');
    if (missing.length) {
        throw new Error(`Zorunlu alanlar eksik: ${missing.join(', ')}`);
    }
    const cat = await Category.findById(category);
    if (!cat) throw new Error("Kategori bulunamadı");
    const product = await Product.create({
        name,
        description,
        images: imagePaths,
        category,
        price: Number(price),
        stock: Number(stock),
        specifications,
        tags,
        featured,
        variants
    });
    return product;
};

// Ürün güncelleme
export const updateProductService = async (userRole, productId, productData, newImagePaths = [], removeImages = []) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Product not found or invalid ID");
    }

    if (Array.isArray(removeImages) && removeImages.length > 0) {
        product.images = product.images.filter(img => !removeImages.includes(img));
    }

  
    if (Array.isArray(newImagePaths) && newImagePaths.length > 0) {
        product.images = [...product.images, ...newImagePaths];
    }

    const updatable = { name:1, description:1, category:1, price:1, stock:1, specifications:1, tags:1, featured:1, variants:1 };
    Object.keys(productData || {}).forEach((key) => {
        if (updatable[key] !== undefined) {
            product[key] = key === 'price' || key === 'stock' ? Number(productData[key]) : productData[key];
        }
    });

    await product.save();
    return product;
};


// Ürün silme
export const deleteProductService = async (userRole, productId) => {

    await Product.findByIdAndDelete(productId);
    return "Product has been deleted...";
};


// Tek Ürün Getirme
export const getAProductService = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};


// Tüm Ürünleri Getirme
export const getAllProductsService = async (query) => {
    const {
        q,
        category,
        min,
        max,
        rating,
        tags,
        sort,
        page = 1,
        limit = 12
    } = query;

    const filter = {};
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];
    }
    if (category) filter.category = category;
    if (min || max) filter.price = { ...(min ? { $gte: Number(min) } : {}), ...(max ? { $lte: Number(max) } : {}) };
    if (rating) filter.averageRating = { $gte: Number(rating) };
    if (tags) filter.tags = { $in: String(tags).split(',') };

    let sortObj = { createdAt: -1 };
    if (sort === 'price') sortObj = { price: 1 };
    else if (sort === 'rating') sortObj = { averageRating: -1 };
    else if (sort === 'new') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
        Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).populate('category'),
        Product.countDocuments(filter)
    ]);

    return {
        items,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
    };
};


export const getFeaturedProductsService = async (limit = 10) => {
    const products = await Product.find({ featured: true })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('category');
    
    return products;
}