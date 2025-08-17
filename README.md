# ShopStack

<div align="center">
  <img src="icon-512x512.png" alt="ShopStack" width="120" />
  <br/>
  <b>Modern e-ticaret uygulaması</b>
</div>

> API Dokümanı: [Postman Docs](https://documenter.getpostman.com/view/33385054/2sB3BHm9Va)

## Proje Açıklaması
ShopStack; ürün yönetimi, sepet ve sipariş süreçleri, kullanıcı yorumları ve güçlü bir admin paneli içeren tam kapsamlı bir e‑ticaret uygulamasıdır. Redis, MongoDB ve modern Next.js 15 tabanlı bir frontend ile gelir.

## Teknoloji Yığını
| Katman | Teknolojiler |
|---|---|
| Backend | Node.js 18+, Express, Mongoose (MongoDB), JWT, Multer, Nodemailer, Winston |
| Frontend | Next.js 15, React 18, TypeScript, Ant Design 5, Tailwind yardımcı sınıfları, Chart.js |
| Altyapı | Redis (Docker), Docker Compose |

## Kurulum
1) Gereksinimler
- Node.js 18+ ve npm
- Docker + Docker Compose (Redis için)
- MongoDB (lokal 27017)

2) Servisleri başlat (Redis)
```bash
docker compose up -d redis
```

3) Backend kurulumu
```bash
cd backend
npm i
```

4) .env dosyası
Backend için örnek `.env` (backend klasöründe):
```env
PORT=8000
DB_URI=mongodb://localhost:27017/
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:8000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
REDIS_URL=redis://localhost:6379
```

5) Seed (örnek veri yükleme)
```bash
node backend/seed.js
```
Seed; 8 kategori, örnek ürünler, admin kullanıcı, örnek siparişler ve yorumları yükler.

6) Backend’i çalıştırma
```bash
cd backend
npm run start
```

7) Frontend kurulumu ve çalıştırma
```bash
cd frontend
npm i
npm run dev
```

## Demo Hesaplar
- Admin: `admin@gmail.com` / `123456!`
- Müşteri: İsterseniz kayıt formundan yeni kullanıcı oluşturabilirsiniz (seed yalnızca admin oluşturur).

## Sayfa Önizlemeleri
Müşteri

| Sayfa | Görsel |
|---|---|
| Ana Sayfa | `docs/screens/home.png` |
| Ürünler | `docs/screens/products.png` |
| Ürün Detayı | `docs/screens/product-detail.png` |
| Sepet | `docs/screens/cart.png` |
| Profil | `docs/screens/profile.png` |
| Siparişler | `docs/screens/orders.png` |

Admin

| Sayfa | Görsel |
|---|---|
| Dashboard | `docs/screens/admin-dashboard.png` |
| Ürünler | `docs/screens/admin-products.png` |
| Kategoriler | `docs/screens/admin-categories.png` |
| Yorumlar | `docs/screens/admin-reviews.png` |
| Kullanıcılar | `docs/screens/admin-users.png` |

## API (Özet)
Base URL: `http://localhost:8000`

Auth
- POST `/auth/register`
- POST `/auth/login`
- GET `/auth/logout`
- GET `/auth/me`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`

Ürünler
- GET `/product` (liste)
- GET `/product/find/:id`
- GET `/product/featured`
- POST `/product/admin/products` (form-data; images[])
- PUT `/product/admin/products/:id` (form-data; images[] + removeImages)
- DELETE `/product/admin/products/:id`

Kategoriler
- GET `/categories`
- POST `/categories` (admin)

Siparişler
- GET `/orders/find/:orderId`
- GET `/orders/find/:userId`
- POST `/orders`

Yorumlar
- GET `/reviews/:productId`
- POST `/reviews`
- PUT `/reviews/:id`
- DELETE `/reviews/:id`
- GET `/reviews/user/:productId` (kullanıcının yorum yapıp yapmadığı)

Detaylı API dökümantasyonu için Postman sayfamı ziyaret edin: [Postman Docs](https://documenter.getpostman.com/view/33385054/2sB3BHm9Va)

Örnek İstek (Ürün Güncelle – form-data)
```bash
curl -X PUT "http://localhost:8000/product/admin/products/PRODUCT_ID" \
  -H "Authorization: Bearer <JWT>" \
  -F "name=Yeni Ürün" \
  -F "removeImages=/uploads/eski1.jpg,/uploads/eski2.jpg" \
  -F "images=@/path/new1.jpg" -F "images=@/path/new2.png"
```

## Dağıtım (Kısa Rehber)
- Çevre değişkenlerini prod’a uygun doldurun.
- Reverse proxy (Nginx) ile `frontend` ve `backend` yönlendirmeleri.
- Redis ve Mongo servislerini yönetilen bir servis veya Docker ile çalıştırın.
- Next.js için `npm run build && npm start`, backend için `npm run start`.

## Özellikler
- Kimlik doğrulama (JWT, httpOnly cookie)
- Katalog ve arama, filtreleme
- Ürün detay, varyant ve özellik yönetimi
- Sepet, sipariş oluşturma ve sipariş takibi
- Yorum ekleme/inceleme (onay mekanizması)
- Admin panel (Ürün/Kategori/İnceleme/Kullanıcı yönetimi)
- Görsel yükleme (multer), form-data güncelleme ve görsel silme
- Redis, e-posta şablonları

## Notlar
- İlk çalıştırmadan önce `docker compose up -d redis` komutu ile Redis’in ayakta olduğundan emin olun.
- Seed script’inde admin kullanıcı: `admin@gmail.com` / `123456!`
- Görseller `backend/uploads` altında servis edilir; örnek seed görselleri `/uploads/...` olarak gelir.
