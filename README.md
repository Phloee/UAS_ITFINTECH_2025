# ScentFix E-Commerce Platform - Quick Start Guide

## ✅ What's Ready

### Backend (100% Complete)
- **Express API Server** with all endpoints
- **Authentication** for customers and admins
- **Product Management** with image upload
- **Shopping Cart** functionality
- **Order Processing** with Midtrans payment
- **WhatsApp Notifications** via Fonnte
- **Admin Reports** with financial analytics
- **JSON Database** system

### Frontend (40% Complete)
- **Design System** with ScentFix branding
- **Homepage** with hero and products
- **Login & Registration** pages
- **Navbar & Footer** components
- **API Integration** ready to use

---

## 🚀 Running the Project

### Step 1: Initialize Database
```bash
npm run init-db
```

This creates:
- Admin account: **username:** `admin` / **password:** `admin123`
- 3 sample products (Classic, Sport, Premium)

### Step 2: Add Midtrans Credentials

Edit `.env.local` and replace:
```
MIDTRANS_SERVER_KEY=your-actual-server-key-here
MIDTRANS_CLIENT_KEY=your-actual-client-key-here
```

### Step 3: Start Backend Server
```bash
npm run server
```
Backend runs on: **http://localhost:3001**

### Step 4: Start Frontend (New Terminal)
```bash
npm run dev
```
Frontend runs on: **http://localhost:3000**

---

## 📁 Project Structure

```
scentfix/
├── backend/
│   ├── server.js                 # Express server
│   ├── routes/                   # API endpoints
│   │   ├── auth.js              # Login, register
│   │   ├── products.js          # Product CRUD
│   │   ├── cart.js              # Shopping cart
│   │   ├── orders.js            # Orders & payment
│   │   └── reports.js           # Analytics
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── utils/
│   │   ├── db.js                # JSON database
│   │   ├── whatsapp.js          # Fonnte integration
│   │   └── payment.js           # Midtrans integration
│   └── data/                    # JSON database files
│
├── app/
│   ├── page.js                  # Homepage
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── ProductCard.js
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── utils/
│   │   └── api.js               # API client
│   └── contexts/
│       └── AuthContext.js       # Auth state
│
└── public/
    └── assets/
        ├── logo/                # ScentFix logo
        └── products/            # Product images
```

---

## 🎨 Brand Guidelines

**Colors:**
- Primary Yellow: `#E8D56D`
- Primary Teal: `#5FB3A3`
- Gradient: `linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%)`

**Font:**
- Poppins (Google Fonts)

---

## 🔑 Test Accounts

**Admin Login:**
- URL: http://localhost:3000/admin/login
- Username: `admin`
- Password: `admin123`

**Customer Account:**
- Register at: http://localhost:3000/auth/register
- Fill in all required fields (name, birthdate, gender, email, phone, password)

---

## 📋 Remaining Pages to Build

### Customer Pages (60%)
1. ❌ Product Listing (`/products`)
2. ❌ Product Detail (`/products/[id]`)
3. ❌ Shopping Cart (`/cart`)
4. ❌ Checkout (`/checkout`)
5. ❌ Customer Profile (`/profile`)
6. ❌ Order History & Details (`/orders/[id]`)

### Admin Pages (100%)
1. ❌ Admin Login (`/admin/login`)
2. ❌ Dashboard (`/admin/dashboard`)
3. ❌ Product Management (`/admin/products`)
4. ❌ Order Management (`/admin/orders`)
5. ❌ Reports & Analytics (`/admin/reports`)

---

## 🧪 Testing the Backend

### Test Authentication
```bash
# Register a customer
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "birthdate": "1990-01-01",
    "gender": "male",
    "phone": "08123456789"
  }'
```

### Test Products
```bash
# Get all products
curl http://localhost:3001/api/products
```

### Test Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 📦 NPM Scripts

- `npm run dev` - Start Next.js frontend (port 3000)
- `npm run server` - Start Express backend (port 3001)
- `npm run init-db` - Initialize database with sample data
- `npm run build` - Build Next.js for production
- `npm start` - Start Next.js production server

---

## ⚙️ Environment Variables

File: `.env.local`

```
# JWT Authentication
JWT_SECRET=scentfix_secret_key_2024_production_change_this

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# Fonnte WhatsApp API
FONNTE_TOKEN=T7R67yWzudEYTBC9FTmU

# Server Configuration
PORT=3001
NEXT_URL=http://localhost:3000
```

---

## ⚠️ Important Notes

1. **Product Images**: Currently using placeholders. Add real images to:
   - `public/assets/products/scentfix-classic/main.jpg`
   - `public/assets/products/scentfix-sport/main.jpg`
   - `public/assets/products/scentfix-premium/main.jpg`

2. **Midtrans**: Get sandbox credentials from https://dashboard.midtrans.com
   - Use test card: `4811 1111 1111 1114` for testing payments

3. **WhatsApp**: Fonnte token is configured. Messages will be sent when:
   - Customer completes payment (order confirmation)
   - Admin updates order status (status update)

4. **JSON Database**: Stored in `/backend/data/*.json`
   - Not suitable for production at scale
   - Consider PostgreSQL/MongoDB for production

---

## 📖 Next Steps

Refer to walkthrough.md for:
- Complete feature list
- Detailed API documentation
- Implementation priorities
- Architecture overview
