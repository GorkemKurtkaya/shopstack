import User from "../models/usermodel.js";




const changeNameandMailService = async (userId, newFirstName, newLastName, newMail) => {
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

const getUserByIdService = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};




export {  changeNameandMailService, getUserByIdService};