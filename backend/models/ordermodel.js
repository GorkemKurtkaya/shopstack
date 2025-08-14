import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [{
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
        price: Number,
        variant: {
            size: String,
            color: String
        }
    }],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentInfo: {
        method: String,
        status: String,
        transactionId: String
    },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "pending" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
