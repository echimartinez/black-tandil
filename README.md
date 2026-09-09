# SomosBlack — E-commerce

Full-stack e-commerce built from scratch for a clothing brand based in Argentina. Live at [somosblack.ar](https://somosblack.ar).

---

## 🛍️ About

SomosBlack is an Argentine clothing brand that sells nationwide. This project is a complete e-commerce solution built with Next.js, including product catalog, shopping cart, checkout with MercadoPago, order management and an admin panel.

---

## ✨ Features

- Product catalog with categories and filters
- Shopping cart with localStorage persistence
- Checkout integrated with MercadoPago (production)
- User authentication with NextAuth
- Order tracking and management
- Admin panel for products, orders and users
- Email notifications via Resend
- Dynamic SEO metadata and sitemap via MongoDB
- Google Analytics integration
- Cloudinary image uploads

---

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MercadoPago](https://img.shields.io/badge/MercadoPago-00B1EA?style=for-the-badge&logo=mercadopago&logoColor=white)

---

## ⚙️ Setup

1. Clone the repo
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. Run the development server:
```bash
npm run dev
```

---

## 👤 Author

**Ezequiel Martinez** — Data Analyst & Automation Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ezequiel-martinez-421bb91b0)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/echimartinez)
