# ShopStack

<div align="center">
  <img src="icon-512x512.png" alt="ShopStack" width="256" />
  <br/>
  <b>Modern e-ticaret uygulaması</b>
</div>

> API Dokümanı: [Postman Docs](https://documenter.getpostman.com/view/33385054/2sB3BHm9Va)

## Proje Açıklaması
ShopStack; ürün yönetimi, sepet ve sipariş süreçleri, kullanıcı yorumları ve güçlü bir admin paneli içeren tam kapsamlı bir e‑ticaret uygulamasıdır. Redis, MongoDB ve modern Next.js 15 tabanlı bir frontend ile gelir.

### Başlatma İpuçları
Gerekli bileşenleri (Node.js, Docker, MongoDB) kurduktan sonra hızlıca denemek için:
- Redis’i başlatın: `docker compose up -d redis`
- Backend bağımlılıkları: `cd backend && npm i`
- Örnek verileri yükleyin (seed): `node seed.js`
  - Alternatif: proje kökünden `node backend/seed.js`
- Backend’i çalıştırın: `npm run start` (backend klasöründe)
- Frontend bağımlılıkları ve çalışma: `cd ../frontend && npm i && npm run dev`
- Demo admin ile giriş: `admin@gmail.com` / `123456!`

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
REDIS_URL=redis://localhost:6379

# E-posta ayarları (Gmail önerilir)
# MAIL_FROM: Gönderici görünen adres (örn: ShopStack <noreply@shopstack.com>)
# EMAIL & PASSWORD: Gmail hesabınız ve uygulama şifresi
MAIL_FROM="ShopStack <noreply@shopstack.com>"
EMAIL=ornek@gmail.com
PASSWORD=uygulama_sifresi
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
| Ana Sayfa | <img width="1904" height="917" alt="image" src="https://github.com/user-attachments/assets/7f5c8c26-e60b-47e8-b71c-140798edb8c0" /> |
| Ürünler | <img width="1903" height="920" alt="image" src="https://github.com/user-attachments/assets/fa78d449-1f1e-48b6-b803-e44457ce281d" /> |
| Ürün Detayı | <img width="1797" height="916" alt="image" src="https://github.com/user-attachments/assets/c4bbd44c-b597-4a6c-a087-810a18465a01" /> |
| Sepet | <img width="1725" height="898" alt="image" src="https://github.com/user-attachments/assets/77511611-4c09-498c-961c-9c2830d35647" /> |
| Profil | <img width="1648" height="834" alt="image" src="https://github.com/user-attachments/assets/596eeba4-417f-4226-8804-7fdc649544c5" /> |
| Siparişler | <img width="1739" height="916" alt="image" src="https://github.com/user-attachments/assets/94c8a104-0804-4c72-aec7-af0a75c65b35" /> <img width="1721" height="918" alt="image" src="https://github.com/user-attachments/assets/e8bacf72-be9f-4faf-91bb-e01064292d0d" />|
| Giriş | <img width="1549" height="901" alt="image" src="https://github.com/user-attachments/assets/1711d44e-b0d9-45fd-9ac7-a2808657b71b" /> |
| Kayıt | <img width="1448" height="915" alt="image" src="https://github.com/user-attachments/assets/02577b5a-1c6a-45c6-bfa2-5f2080ea3e28" /> |

Admin

| Sayfa | Görsel |
|---|---|
| Dashboard | <img width="1919" height="917" alt="image" src="https://github.com/user-attachments/assets/bc4be12a-31c0-4b82-aacf-03eee8a7b597" /> |
| Ürünler | <img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/65ca440e-4b1b-4e7a-86d1-f4fc00091d61" /> <img width="1903" height="915" alt="image" src="https://github.com/user-attachments/assets/1280427a-4845-46ee-a687-ba68d1922854" /> |
| Kategoriler | <img width="1905" height="920" alt="image" src="https://github.com/user-attachments/assets/849059fd-e9b5-4158-9bc9-0bc771e153d4" /> |
| Siparişler | <img width="1919" height="856" alt="image" src="https://github.com/user-attachments/assets/85a87ca9-5a48-4515-8233-33072990d21f" /> |
| Yorumlar | <img width="1919" height="799" alt="Screenshot_14" src="https://github.com/user-attachments/assets/6711b1d2-ed6f-49b7-a1cc-c143ed4f4823" /> |
| Kullanıcılar | <img width="1919" height="773" alt="Screenshot_1" src="https://github.com/user-attachments/assets/1e4e1c84-54a5-4506-91ac-bdad51d177d8" /> |

## API (Özet)
Base URL: `http://localhost:8000`

Detaylı API dökümantasyonu için Postman sayfamı ziyaret edin: [Postman Docs](https://documenter.getpostman.com/view/33385054/2sB3BHm9Va)

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

### Gmail ile e-posta gönderimi nasıl aktif edilir?
1) Gmail hesabınızda iki adımlı doğrulamayı açın (Google Hesap > Güvenlik > İki adımlı doğrulama).
2) Aynı sayfadan “Uygulama şifreleri” oluşturun.
3) Uygulama olarak “Mail”, cihaz olarak “Diğer (Özel ad)” seçip bir uygulama şifresi üretin.
4) README’deki `.env` alanlarına:
   - `EMAIL` = Gmail adresiniz
   - `PASSWORD` = Ürettiğiniz uygulama şifresi (normal şifre değil)
   - `MAIL_FROM` = Gönderici görünen ad/adres (örn: `ShopStack <noreply@shopstack.com>`)
5) Sunucuyu yeniden başlatın.

Not: `EMAIL` ve `PASSWORD` belirtilmezse geliştirme modunda e‑postalar gerçek gönderilmez, konsola yazdırılır (backend/utils/mailer.js).

