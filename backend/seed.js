import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Modeller
import Category from './models/categorymodel.js';
import Product from './models/productmodel.js';
import User from './models/usermodel.js';
import Review from './models/reviewmodel.js';
import Order from './models/ordermodel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'Seed_Shopstack_db';



const categories = [
  { _id: new mongoose.Types.ObjectId('689f534879b915165ba857c1'), name: 'Clothing', slug: 'clothing', active: true },
  { _id: new mongoose.Types.ObjectId('689f578c947b6b53fbc0af14'), name: 'Home and Garden', slug: 'home-and-garden', active: true },
  { _id: new mongoose.Types.ObjectId('689f5797947b6b53fbc0af21'), name: 'Sports', slug: 'sports', active: true },
  { _id: new mongoose.Types.ObjectId('689f57a5947b6b53fbc0af2b'), name: 'Books', slug: 'books', active: true },
  { _id: new mongoose.Types.ObjectId('689f57ae947b6b53fbc0af3d'), name: 'Electronics', slug: 'electronics', active: true },
  { _id: new mongoose.Types.ObjectId('689f57b8947b6b53fbc0af47'), name: 'Health and Beauty', slug: 'beauty', active: true },
  { _id: new mongoose.Types.ObjectId('689f57bc947b6b53fbc0af51'), name: 'Toys', slug: 'toys', active: true },
  { _id: new mongoose.Types.ObjectId('689f57c0947b6b53fbc0af5b'), name: 'Food', slug: 'food', active: true },
];

const products = [
  {
    _id: new mongoose.Types.ObjectId('68a0c8ef4f12b3109d39ce07'),
    name: 'Kralların Çarpışması - George R.R. Martin',
    description: "George R. R. Martin'in klasikleşen serisi Buz ve Ateşin Şarkısı’nın ikinci kitabı...",
    images: ['/uploads/Screenshot_1-1755367663851-732919669.png'],
    category: new mongoose.Types.ObjectId('689f57a5947b6b53fbc0af2b'),
    price: 654,
    stock: 50,
    specifications: {},
    tags: ['book', 'fantasy'],
    featured: true,
    variants: [],
  },
  {
    _id: new mongoose.Types.ObjectId('68a1cfc29241c8f5bed83233'),
    name: 'Kahve Dünyası Mini Gofrik Sütlü 12,5g * 10 adet',
    description: 'Kahve Dünyasından yine bir ilk, gofret değil Gofrik!...',
    images: ['/uploads/Screenshot_13-1755434946855-450686093.png'],
    category: new mongoose.Types.ObjectId('689f57c0947b6b53fbc0af5b'),
    price: 135,
    stock: 50,
    specifications: { Adet: '10' },
    tags: ['food'],
    featured: true,
    variants: [],
  },
  {
    _id: new mongoose.Types.ObjectId('68a1cf409241c8f5bed8320f'),
    name: 'Apple iPhone 16 256GB Deniz Mavisi',
    description: 'KAMERA DENETİMİ İLE KONTROL SİZDE — ...',
    images: [
      '/uploads/Screenshot_10-1755444017860-826324402.png',
      '/uploads/Screenshot_11-1755444017861-362697041.png',
      '/uploads/Screenshot_12-1755444017862-180398897.png',
    ],
    category: new mongoose.Types.ObjectId('689f57ae947b6b53fbc0af3d'),
    price: 64799,
    stock: 49,
    specifications: { Depolama: '256GB' },
    tags: ['apple', 'ios', 'phone'],
    featured: true,
    variants: [],
  },
  {
    _id: new mongoose.Types.ObjectId('68a1cecc9241c8f5bed831e9'),
    name: 'Apple iPhone 16 Pro 128GB Natürel Titanyum',
    description: 'BÜYÜLEYİCİ TİTANYUM TASARIM — ...',
    images: [
      '/uploads/Screenshot_9-1755434700728-969734425.png',
      '/uploads/Screenshot_8-1755443964746-757824740.png',
    ],
    category: new mongoose.Types.ObjectId('689f57ae947b6b53fbc0af3d'),
    price: 76799,
    stock: 97,
    specifications: { Depolama: '128GB' },
    tags: ['apple', 'ios', 'phone'],
    featured: true,
    variants: [{ size: '128GB', color: 'Çöl Titanyumu', additionalPrice: 2000 }],
    averageRating: 5,
  },
  {
    _id: new mongoose.Types.ObjectId('68a1ce1f9241c8f5bed831a3'),
    name: 'Grimelange Holger Erkek Regular Fit Kalın Kaşe Kumaş Astarlı Tüylenmez Düğmeli Grimelanj Ceket',
    description: 'Grimelange Holger Erkek Regular Fit... ',
    images: [
      '/uploads/Screenshot_5-1755444078517-445063831.png',
      '/uploads/Screenshot_6-1755444078518-364798070.png',
      '/uploads/Screenshot_7-1755444078518-771472682.png',
    ],
    category: new mongoose.Types.ObjectId('689f534879b915165ba857c1'),
    price: 610,
    stock: 49,
    specifications: { Polyester: '%40', Pamuk: '%25', Akrilik: '%30', Yün: '%5' },
    tags: ['clothing'],
    featured: true,
    variants: [],
    averageRating: 2,
  },
  {
    _id: new mongoose.Types.ObjectId('68a0c9344f12b3109d39ce22'),
    name: 'Yedi Krallık Şövalyesi (Ciltli) - George R.R. Martin',
    description: 'Gezgin şövalye ve yaverinin maceraları...',
    images: ['/uploads/Screenshot_2-1755367732288-387727365.png'],
    category: new mongoose.Types.ObjectId('689f57a5947b6b53fbc0af2b'),
    price: 398,
    stock: 100,
    specifications: {},
    tags: ['book'],
    featured: true,
    variants: [],
  },
  {
    _id: new mongoose.Types.ObjectId('68a0ca724f12b3109d39ce6c'),
    name: 'Grimelange Brice Erkek %100 Keten Kumaşlı Dökümlü Beyaz Gömlek',
    description: 'Yaz ayları için nefes alan keten kumaş...',
    images: ['/uploads/Screenshot_3-1755368050332-141826986.png', '/uploads/Screenshot_4-1755444162689-444650640.png'],
    category: new mongoose.Types.ObjectId('689f534879b915165ba857c1'),
    price: 768,
    stock: 100,
    specifications: {},
    tags: ['clothing'],
    featured: true,
    variants: [],
  },
];

const adminUser = {
  _id: new mongoose.Types.ObjectId('689e0221cfede8946bab64e9'),
  firstName: 'admin',
  lastName: 'admin',
  email: 'admin@gmail.com',
  password: '123456!',
  role: 'admin',
  phoneNumber: '905551112233',
  addresses: [
    {
      _id: new mongoose.Types.ObjectId(),
      street: 'Merkez Mah. 1. Cad. No:10',
      city: 'İzmir',
      state: 'Bornova',
      zipCode: '35000',
      country: 'Türkiye',
      isDefault: true,
    },
  ],
  favoriteCategories: [
    new mongoose.Types.ObjectId('689f57a5947b6b53fbc0af2b'),
    new mongoose.Types.ObjectId('689f57ae947b6b53fbc0af3d'),
  ],
  emailVerified: true,
  emailVerifiedAt: new Date(),
};

async function run() {
  try {
    await mongoose.connect(DB_URI, { dbName: DB_NAME });
    console.log('MongoDB bağlandı');


    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({ email: adminUser.email }),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ]);


    await Category.insertMany(categories.map(c => ({ ...c })));
    console.log('Kategoriler eklendi');


    await Product.insertMany(products.map(p => ({ ...p })));
    console.log('Ürünler eklendi');

    const existingAdmin = await User.findOne({ email: adminUser.email });
    let admin = existingAdmin;
    if (!existingAdmin) {
      admin = await User.create(adminUser);
      console.log('Admin kullanıcı eklendi');
    } else {
      console.log('Admin kullanıcı zaten mevcut');
    }

  
    const reviews = [
      {
        _id: new mongoose.Types.ObjectId('68a1e003eea7d9d05f9c8db4'),
        product: new mongoose.Types.ObjectId('68a1cecc9241c8f5bed831e9'),
        user: admin._id,
        rating: 5,
        comment: 'Harika Bir Ürün Tavsiye Ederim!',
        approved: true,
      },
      {
        _id: new mongoose.Types.ObjectId('68a1e017eea7d9d05f9c8dc7'),
        product: new mongoose.Types.ObjectId('68a1ce1f9241c8f5bed831a3'),
        user: admin._id,
        rating: 2,
        comment: 'İstediğim gibi gelmedi maalesef iade edeceğim.',
        approved: true,
      },
    ];
    await Review.insertMany(reviews);
    console.log('Reviews eklendi');


    const orders = [
      {
        _id: new mongoose.Types.ObjectId('689f5baad2ebc99b6da5bdc6'),
        user: admin._id,
        orderItems: [
          { product: new mongoose.Types.ObjectId('68a1cf409241c8f5bed8320f'), quantity: 2, price: 12999, variant: { size: '128GB', color: 'black' } },
          { product: new mongoose.Types.ObjectId('68a1ce1f9241c8f5bed831a3'), quantity: 1 },
        ],
        shippingAddress: { street: 'Deneme Cad. 1', city: 'Istanbul', state: 'TR', zipCode: '34000', country: 'TR' },
        paymentInfo: { method: 'card', status: 'paid', transactionId: 'fake_tx_123' },
        totalAmount: 88498,
        status: 'delivered',
      },
      {
        _id: new mongoose.Types.ObjectId('68a1d9f6797dcaf65eb50c8b'),
        user: admin._id,
        orderItems: [
          { product: new mongoose.Types.ObjectId('68a1cf409241c8f5bed8320f'), quantity: 1, price: 64799 },
          { product: new mongoose.Types.ObjectId('68a1cecc9241c8f5bed831e9'), quantity: 2, price: 76799, variant: { size: '128GB', color: 'Çöl Titanyumu' } },
        ],
        shippingAddress: { street: 'Deneme Cad.2', city: 'İzmir', state: 'İzmir', zipCode: '35000', country: 'TR' },
        paymentInfo: { method: 'card', status: 'paid', transactionId: 'tx_1755437558823_di9dvdadj' },
        totalAmount: 218397,
        status: 'cancelled',
      },
      {
        _id: new mongoose.Types.ObjectId('68a1dfdfeea7d9d05f9c8c30'),
        user: admin._id,
        orderItems: [
          { product: new mongoose.Types.ObjectId('68a1cecc9241c8f5bed831e9'), quantity: 1, price: 76799, variant: { size: '128GB', color: 'Çöl Titanyumu' } },
          { product: new mongoose.Types.ObjectId('68a1ce1f9241c8f5bed831a3'), quantity: 1, price: 610 },
        ],
        shippingAddress: { street: 'Deneme Cad.1', city: 'İzmir', state: 'TR', zipCode: '35000', country: 'TR' },
        paymentInfo: { method: 'card', status: 'paid', transactionId: 'tx_1755439071401_5cfic1l6z' },
        totalAmount: 77409,
        status: 'delivered',
      },
    ];
    await Order.insertMany(orders);
    console.log('Orders eklendi');

    console.log('Seed tamamlandı');
  } catch (err) {
    console.error('Seed hatası:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();


