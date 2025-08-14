import {
    changeNameandMailService,
    getUserByIdService,
} from "../services/userService.js";


// Kullanıcı adı veya mail değiştirme
const changeNameandMail = async (req, res) => {
    try {
        const message = await changeNameandMailService(
            res.locals.user._id,
            req.body.firstName,
            req.body.lastName,
            req.body.email
        );

        res.status(200).json({
            succeeded: true,
            message,
        });
    } catch (error) {
        res.status(500).json({
            succeeded: false,
            message: error.message,
        });
    }
};

// Kullanıcı bilgilerini getirme
const getAUser = async (req, res) => {
    try {
        const user = await getUserByIdService(req.params.id);

        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user._id,
            role: user.role,
            phoneNumber: user.phoneNumber,
            addresses: user.addresses,
            favoriteCategories: user.favoriteCategories,
            emailVerified: user.emailVerified
        });
    } catch (error) {
        res.status(400).json({
            succeeded: false,
            error: error.message,
        });
    }
};



export {  changeNameandMail, getAUser };