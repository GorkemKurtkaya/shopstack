import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  specifications: { type: Map, of: String },
  tags: [String],
  featured: { type: Boolean, default: false },
  variants: [{
    size: String,
    color: String,
    additionalPrice: Number
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

export default Product;