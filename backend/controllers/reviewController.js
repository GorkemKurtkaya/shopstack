import { 
    createReviewService,
    getProductReviewsService,
    updateReviewService,
    deleteReviewService,
    approveReviewService
} from "../services/reviewService.js";

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const review = await createReviewService(req.user._id, productId, rating, comment);
        return res.status(201).json(review);
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await getProductReviewsService(productId);
        return res.status(200).json(reviews);
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const review = await updateReviewService(req.user._id, reviewId, rating, comment);
        return res.status(200).json(review);
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const isAdmin = req.user && req.user.role === 'admin';
        const result = await deleteReviewService(req.user._id, reviewId, isAdmin);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
};

export const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { approved } = req.body;
        const review = await approveReviewService(reviewId, approved);
        return res.status(200).json(review);
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
};

