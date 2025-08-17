import User from "../models/usermodel.js";




export const changeNameandMailService = async (userId, newFirstName, newLastName, newMail) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (newFirstName) user.firstName = newFirstName;
    if (newLastName) user.lastName = newLastName;
    if (newMail) user.email = newMail;
    await user.save();

    return "User info changed successfully";
};

export const getUserByIdService = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const updateUserinfo = async (id, name, email, role) => {
    try {
        const user = await User.findByIdAndUpdate(
            id, 
            { firstName: name, email, role }, 
            { new: true }
        );
        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

export const deleteUserById = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getAllUsers = async () => {
    try {
        const users = await User.find({}).select('-password'); // Şifreleri hariç tut
        return users;
    } catch (error) {
        throw new Error(error.message);
    }
};