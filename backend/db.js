import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const conn =() => {
    
    mongoose.connect(process.env.DB_URI,{
        dbName: "Seed_Shopstack_db",
    })
    .then(() => {
        console.log("Seed_Shopstack_db Veritabanına bağlandı");
    })
    .catch((err) => {
        console.log(`Veritabanına bağlanamadı, ${err}`);
    });
};


export default conn;