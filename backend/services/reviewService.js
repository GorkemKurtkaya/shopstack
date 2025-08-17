import Review from "../models/reviewmodel.js";
import Order from "../models/ordermodel.js";
import Product from "../models/productmodel.js";
import mongoose from 'mongoose';

const recalculateProductAverage = async (productId) => {
    const res = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), approved: true } },
        { $group: { _id: "$product", avg: { $avg: "$rating" } } }
    ]);
    const avg = res.length ? Number(res[0].avg.toFixed(2)) : 0;
    await Product.findByIdAndUpdate(productId, { averageRating: avg });
};

export const createReviewService = async (userId, productId, rating, comment) => {
    if (!productId || !rating) throw new Error("productId ve rating zorunludur");
    if (Number(rating) < 1 || Number(rating) > 5) throw new Error("rating 1-5 arası olmalıdır");

    const purchased = await Order.findOne({ user: userId, "orderItems.product": productId });
    if (!purchased) throw new Error("Ürünü satın alan kullanıcı yorum yapabilir");

    const exists = await Review.findOne({ user: userId, product: productId });
    if (exists) throw new Error("Bu ürün için zaten yorum yaptınız");

    const review = await Review.create({
        user: userId,
        product: productId,
        rating: Number(rating),
        comment
    });

    await recalculateProductAverage(productId);
    return review;
};

export const getProductReviewsService = async (productId, includeUnapproved = false) => {
    const filter = { product: productId };
    if (!includeUnapproved) filter.approved = true;
    return Review.find(filter).populate("user", "firstName lastName").sort({ createdAt: -1 });
};

export const updateReviewService = async (userId, reviewId, rating, comment) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review bulunamadı");
    if (String(review.user) !== String(userId)) throw new Error("Bu yorumu güncelleme yetkiniz yok");
    if (rating != null) {
        if (Number(rating) < 1 || Number(rating) > 5) throw new Error("rating 1-5 arası olmalıdır");
        review.rating = Number(rating);
    }
    if (comment != null) review.comment = comment;
    await review.save();
    await recalculateProductAverage(review.product);
    return review;
};

export const deleteReviewService = async (userId, reviewId, isAdmin = false) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review bulunamadı");
    if (!isAdmin && String(review.user) !== String(userId)) throw new Error("Bu yorumu silme yetkiniz yok");
    await Review.findByIdAndDelete(reviewId);
    await recalculateProductAverage(review.product);
    return { message: "Yorum silindi" };
};

export const approveReviewService = async (reviewId, approved) => {
    const review = await Review.findByIdAndUpdate(reviewId, { approved: !!approved }, { new: true });
    if (!review) throw new Error("Review bulunamadı");
    await recalculateProductAverage(review.product);
    return review;
};


export const getAllReviewsService = async (includeUnapproved = false) => {
    const filter = {};
    if (!includeUnapproved) filter.approved = true;
    return Review.find(filter)
        .populate("user", "firstName lastName")
        .populate("product", "name slug")
        .sort({ createdAt: -1 });
}

// Kullanıcının belirli bir ürün için yorum yapıp yapmadığını kontrol et
export const checkUserReviewService = async (userId, productId) => {
    const review = await Review.findOne({ 
        user: userId, 
        product: productId 
    }).populate("user", "firstName lastName");
    
    return review;
}



