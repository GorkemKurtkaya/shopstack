import {
    changeNameandMailService,
    getUserByIdService,
    updateUserinfo,
    deleteUserById,
    getAllUsers
} from "../services/userService.js";



export const changeNameandMail = async (req, res) => {
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


export const getAUser = async (req, res) => {
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

export const updateUser = async (req, res) => {
    try {
        console.log("Kullanıcı Güncelleme İşlemi Başladı");
        const { name, email, role } = req.body;
        const user = await updateUserinfo(req.params.id, name, email, role);
        const updatedUser = await getUserByIdService(req.params.id); // getUserById yerine getUserByIdService
        console.log("Kullanıcı Başarıyla Güncellendi");
        res.status(200).json({ message: "User updated", updatedUser });
    } catch (error) {
        console.error("Kullanıcı Güncellenirken Hata:", error);
        res.status(400).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
  try {
    console.log("Kullanıcı Silme İşlemi Başladı");
    const deletedUser = await deleteUserById(req.params.id);
    console.log("Kullanıcı Başarıyla Silindi");
    res.json({ message: "Kullanıcı başarıyla silindi", deletedUser });
  } catch (error) {
    console.error("Kullanıcı Silinirken Hata:", error);
    res.status(400).json({ error: error.message });
  }
};


export const getUsers = async (req, res) => {
    try {
        console.log("Tüm Kullanıcıları Getirme İşlemi Başladı");
        const users = await getAllUsers();
        console.log("Tüm Kullanıcılar Başarıyla Getirildi");
        res.json(users);
      } catch (error) {
        console.error("Kullanıcıları Getirirken Hata:", error);
        res.status(400).json({ error: error.message });
      }
}