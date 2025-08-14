import Order from "../models/ordermodel.js";
import Product from "../models/productmodel.js";


// Sipariş oluşturma
export const createOrderService = async (orderData) => {
    const { user, orderItems, shippingAddress, paymentInfo } = orderData;
    if (!user || !Array.isArray(orderItems) || orderItems.length === 0) {
        throw new Error('user ve orderItems zorunludur');
    }

    let totalAmount = 0;
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Ürün bulunamadı: ${item.product}`);
        if (product.stock < item.quantity) throw new Error(`Üründe yeterli stok yok: ${product.name}`);
        const unitPrice = item.price != null ? Number(item.price) : Number(product.price);
        totalAmount += unitPrice * Number(item.quantity || 1);
    }

    // Stok güncelle
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -Number(item.quantity || 1) } });
    }

    const newOrder = await Order.create({
        user,
        orderItems: orderItems.map(i => ({
            product: i.product,
            quantity: Number(i.quantity || 1),
            price: i.price != null ? Number(i.price) : undefined,
            variant: i.variant
        })),
        shippingAddress,
        paymentInfo,
        totalAmount,
        status: 'pending'
    });

    return newOrder;
};

// Sipariş güncelleme
export const updateOrderService = async (orderId, orderData) => {
    return await Order.findByIdAndUpdate(
        orderId,
        { $set: orderData },
        { new: true }
    );
};

// Sipariş durumunu güncelleme
export const updateOrderStatusService = async (orderId, status) => {
    return await Order.findByIdAndUpdate(
        orderId,
        { $set: { status } },
        { new: true }
    );
}


// Sipariş silme
export const deleteOrderService = async (orderId) => {
    await Order.findByIdAndDelete(orderId);
    return "Sipariş silindi";
};


// Sipariş getirme
export const getOrderService = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Silinmiş veya hatalı sipariş id'si");
    return order;
};


// Kullanıcıya ait siparişleri getirme
export const getUserOrdersService = async (userId) => {
    return await Order.find({ user: userId });
};


// Tüm siparişleri getirme
export const getAllOrdersService = async () => {
    return await Order.find();
};


// Sipariş gelirlerini getirme
export const getOrderIncomeService = async () => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    return await Order.aggregate([
        { $match: { createdAt: { $gte: previousMonth } } },
        {
            $project: {
                month: { $month: "$createdAt" },
                sales: "$amount",
            },
        },
        {
            $group: {
                _id: "$month",
                total: { $sum: "$sales" },
            },
        },
    ]);
};

