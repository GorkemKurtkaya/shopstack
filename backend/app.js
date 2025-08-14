import express from "express";
import dotenv from "dotenv";
import conn from "./db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path';
import { checkUser } from "./middlewares/authmiddleware.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import orderRoute from "./routes/orderRoute.js";
import basketRoute from "./routes/basketRoute.js";
import logger from "./utils/logger.js";

// .env dosyasını okuma
dotenv.config();

// uploads static serving (multer)
const uploadDir = path.resolve(process.cwd(), 'uploads');

//db connection
conn();


//express
const PORT = process.env.PORT || 3000;
const app = express();

// log işlemleri
app.use((req, res, next) => {
  logger.info(`${req.method} - ${req.url} - ${req.ip}`);
  next();
});

//static dosyası
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*', 
  credentials: true, 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));

//routes
app.use('*', checkUser);
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/product", productRoute);
app.use("/", categoryRoute);
app.use("/reviews", reviewRoute);
app.use("/orders", orderRoute);
app.use("/basket", basketRoute);

app.listen(PORT, () => {
  console.log(`Express Server Çalışıyor http://localhost:${PORT}`);
});

