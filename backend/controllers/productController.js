
import * as productService from "../services/productService.js";
import fs from "fs";
import logger from "../utils/logger.js";
import path from 'path';




// Ürün oluşturma
export const createProduct = async (req, res) => {
    try {
        logger.info("Ürün Oluşturma İşlemi");
        const files = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : []);
        const imagePaths = files.map(f => (f.filename ? `/uploads/${f.filename}` : f.path)).filter(Boolean);
        const data = { ...req.body };
        if (typeof data.tags === 'string') {
            data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (typeof data.specifications === 'string') {
            try { data.specifications = JSON.parse(data.specifications); } catch (_) {}
        }
        if (typeof data.variants === 'string') {
            try { data.variants = JSON.parse(data.variants); } catch (_) {}
        }

        const product = await productService.createProductService(req.user.role, data, imagePaths);
        return res.status(201).json({ succeeded: true, product, message: 'Ürün Başarıyla Oluşturuldu' });
    } catch (error) {
        return res.status(500).json({ succeeded: false, message: error.message });
    }
};


// Ürün güncelleme
export const updateProduct = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            succeeded: false,
            message: "Product ID is required",
        });
    }
    try {
        logger.info("Ürün Güncelleme İşlemi");

        const files = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : []);
        const imagePaths = files.map(f => (f.filename ? `/uploads/${f.filename}` : f.path)).filter(Boolean);

        const data = { ...req.body };
        if (typeof data.tags === 'string') {
            data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (typeof data.specifications === 'string') {
            try { data.specifications = JSON.parse(data.specifications); } catch (_) {}
        }
        if (typeof data.variants === 'string') {
            try { data.variants = JSON.parse(data.variants); } catch (_) {}
        }

        const removeImages = typeof data.removeImages === 'string'
          ? data.removeImages.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(data.removeImages) ? data.removeImages : [];

        const updatedProduct = await productService.updateProductService(
            req.user.role,
            req.params.id,
            data,
            imagePaths,
            removeImages
        );

        res.status(200).json({ succeeded: true, product: updatedProduct, message: 'Ürün güncellendi' });
        console.log("Ürün güncellendi");
        logger.info("Ürün Güncellendi");
    } catch (error) {
        const statusCode = error.message === "Product not found or invalid ID" ? 404 : 500;
        res.status(statusCode).json({
            succeeded: false,
            message: error.message,
        });
        logger.error("Ürün Güncellenirken Hata Oluştu:", error);
    }
};


// Ürün silme
export const deleteProduct = async (req, res) => {
    try {
        logger.info("Ürün Silme İşlemi");
        const message = await productService.deleteProductService(req.user.role, req.params.id);
        res.status(200).json({
            succeeded: true,
            message,
        });

        console.log("Ürün silindi");
        logger.info("Ürün Silindi");
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            message: error.message,
        });
        logger.error("Ürün Silinirken Hata Oluştu:", error);
    }
};


// Tek Ürün Getirme
export const getAProduct = async (req, res) => {
    try {
        logger.info("Ürün Getirme İşlemi");
        const product = await productService.getAProductService(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            message: error.message,
        });
        logger.error("Ürün Getirilirken Hata Oluştu:", error);
    }
};


// Tüm Ürünleri Getirme
export const getAllProduct = async (req, res) => {
    try {
        logger.info("Tüm Ürünleri Getirme İşlemi");
        const products = await productService.getAllProductsService(req.query);
        res.status(200).json(products);
        console.log("Tüm ürünler getirildi");
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            message: error.message,
        });
        logger.error("Tüm Ürünler Getirilirken Hata Oluştu:", error);
    }
};


// Öne Çıkan Ürünleri getirme
export const getFeaturedProducts = async (req, res) => {
    try {
        logger.info("Öne Çıkan Ürünleri Getirme İşlemi");
        const products = await productService.getFeaturedProductsService();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            message: error.message,
        });
        logger.error("Öne Çıkan Ürünler Getirilirken Hata Oluştu:", error);
    }
}
