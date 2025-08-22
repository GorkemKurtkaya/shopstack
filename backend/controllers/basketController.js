import * as basketService from "../services/basketService.js";
import logger from "../utils/logger.js";



export const addToBasket = async (req, res) => {
    logger.info("Ürün Sepete Ekleme İşlemi");
    const userId = req.user?._id;
    const { product } = req.body;
    if (!product.productId) {
        return res.status(502).send({ message: "productId is required" })
    }
    try {
        const response = await basketService.addToCart({
            userId,
            product: {
                productId: product.productId,
                quantity: product.quantity || 1
            }
        });
        res.status(200).send({ response: true })
        logger.info("Ürün Sepete Eklendi");

    } catch (e) {
        console.log(e, 'error')
        res.status(500).send({ message: "Error adding to basket" })
        logger.error("Ürün Sepete Eklenirken Hata Oluştu:", e);
    }
}


export const getMyBasket = async (req, res) => {
    try {
        logger.info("Sepet Listeleme İşlemi");
        const response = await basketService.getBasket({ userId: req.user?._id })

        if (!response || response.length === 0) {
            return res.status(404).send({ message: "Sepet bulunamadı" })
            logger.error("Sepet Bulunamadı");
        } else {
            res.status(200).send({ response: response })
            logger.info("Sepet Listelendi");
        }

    } catch (e) {
        console.log(e, 'error')
    }

}

// Sepet Silme (kendi sepeti)
export const deleteMyBasket = async (req, res) => {
    const userId = req.user?._id;
    logger.info("Sepet Silme İşlemi");
    if (!userId) {
        return res.status(401).send({ message: "Unauthorized" })
    }
    try {
        const response = await basketService.removeCart({ userId }, res)
        console.log(response, 'result');
        res.status(200).send({ response: response })
        logger.info("Sepet Silindi");
    } catch (e) {
        console.log(e, 'error')
        logger.error("Sepet Silinirken Hata Oluştu:", e);
    }

}


// Sepetteki ürünü güncelleme
export const updateCartItem = async (req, res) => {
    const userId = req.user?._id;
    const { productId, action } = req.body;

    if (!userId) {
        return res.status(401).send({ message: "Unauthorized" });
    }
    if (!productId) {
        return res.status(400).send({ message: "productId is required" });
    }
    if (!action || !["increment", "decrement", "remove"].includes(action)) {
        return res.status(400).send({ message: "Valid action is required (increment, decrement, remove)" });
    }

    try {
        logger.info("Sepet Güncelleme İşlemi");
        const result = await basketService.updateCartItem({ userId, productId, action });
        return res.status(result.status).send({ message: result.message });
    } catch (e) {
        logger.error("Error: ", e);
        console.log(e);
        return res.status(500).send({ message: "Internal Server Error" });
    }
}



