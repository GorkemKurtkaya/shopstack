import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String,
        required: [true, "Mail adresi boş bırakılamaz"],
        unique: true,
        validate: [validator.isEmail, "Mail adresi geçerli değil"],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Şifre alanı boş bırakılamaz"],
        minLength: [6, "Şifre en az 6 karakter olmalıdır"]
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    },
    phoneNumber: { type: String },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: { type: Boolean, default: false }
    }],
    favoriteCategories: [String],
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date }
}, { timestamps: true });


userSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) {
        return next();
    }

    bcrypt.hash(user.password, 10, (error, hash) => {
        if (error) return next(error);
        user.password = hash;
        next();
    });
});

const User = mongoose.model("User", userSchema);

export default User;
