import mongoose from "mongoose";

const { Schema } = mongoose;

const CategorySchema = new Schema({
	name: { type: String, required: true, unique: true, trim: true },
	slug: { type: String, required: true, unique: true, lowercase: true },
	active: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model("Category", CategorySchema);
export default Category;
