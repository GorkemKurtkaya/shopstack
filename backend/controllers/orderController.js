import * as orderService from "../services/orderService.js";
import logger from "../utils/logger.js";

// Sipariş Oluşturma
export const createOrder = async (req, res) => {
    logger.info("Sipariş Oluşturma İşlemi");
    // body -> orderItems, shippingAddress, paymentInfo
    const payload = {
        user: req.user._id,
        orderItems: req.body.orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentInfo: req.body.paymentInfo
    };
    try {
        const savedOrder = await orderService.createOrderService(payload);
        logger.info("Sipariş başarıyla oluşturuldu");
        return res.status(200).json({ message: "Sipariş başarıyla oluşturuldu!", order: savedOrder });
    } catch (err) {
        logger.error("Sipariş oluşturulurken hata:", err);
        return res.status(400).json({ message: err.message });
    }
};

// Sipariş Güncelleme
export const updateOrder = async (req, res) => {
    try {
        logger.info("Sipariş Güncelleme İşlemi");
        const updatedOrder = await orderService.updateOrderService(req.params.id, req.body);
        logger.info("Sipariş başarıyla güncellendi");
        res.status(200).json(updatedOrder);
    } catch (err) {
        logger.error("Sipariş güncellenirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};

// Sipariş Silme
export const deleteOrder = async (req, res) => {
    try {
        logger.info("Sipariş Silme İşlemi");
        const message = await orderService.deleteOrderService(req.params.id);
        logger.info("Sipariş başarıyla silindi");
        res.status(200).json({ message });
    } catch (err) {
        logger.error("Sipariş silinirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};

// Sipariş Getirme
export const getOrder = async (req, res) => {
    try {
        logger.info("Sipariş Getirme İşlemi");
        const order = await orderService.getOrderService(req.params.id);
        logger.info("Sipariş başarıyla getirildi");
        res.status(200).json(order);
    } catch (err) {
        logger.error("Sipariş getirilirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};

// Kullanıcı Siparişlerini Getirme
export const getUserOrders = async (req, res) => {
    try {
        logger.info("Kullanıcı Siparişlerini Getirme İşlemi");
        const userId = req.params.userId || (req.user && req.user._id);
        const orders = await orderService.getUserOrdersService(userId);
        logger.info("Kullanıcı siparişleri başarıyla getirildi");
        res.status(200).json(orders);
    } catch (err) {
        logger.error("Kullanıcı siparişleri getirilirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};

// Tüm Siparişleri Getirme
export const getAllOrders = async (req, res) => {
    try {
        logger.info("Tüm Siparişleri Getirme İşlemi");
        const orders = await orderService.getAllOrdersService();
        logger.info("Tüm siparişler başarıyla getirildi");
        res.status(200).json(orders);
    } catch (err) {
        logger.error("Tüm siparişler getirilirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};

// Sipariş Gelirini Getirme
export const getOrderIncome = async (req, res) => {
    try {
        logger.info("Sipariş Geliri Getirme İşlemi");
        const income = await orderService.getOrderIncomeService();
        logger.info("Sipariş geliri başarıyla getirildi");
        res.status(200).json(income);
    } catch (err) {
        logger.error("Sipariş geliri getirilirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};

// Sipariş Durumu Güncelleme
export const updateOrderStatus = async (req, res) => {
    try {
        logger.info("Sipariş Durumu Güncelleme İşlemi");
        const updatedOrder = await orderService.updateOrderStatusService(req.params.id, req.body.status);
        logger.info("Sipariş durumu başarıyla güncellendi");
        res.status(200).json(updatedOrder);
    } catch (err) {
        logger.error("Sipariş durumu güncellenirken hata:", err);
        res.status(500).json({ message: err.message });
    }
};
