# Tailor Management System - Backend API

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Edit the `.env` file and update:
- DATABASE_URL (Supabase PostgreSQL connection)
- JWT_SECRET (change to a secure random string)
- SMTP credentials (for email)
- AWS S3 credentials (for PDF storage)

### 3. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 4. Seed Sample Data (Optional)
```bash
npm run seed
```

**Login Credentials:**
- Admin: `admin@tailor.com` / `admin123`
- Staff: `staff@tailor.com` / `staff123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/stats` - Get statistics

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order (sends email)
- `PATCH /api/orders/:id/status` - Update status (sends email)
- `PATCH /api/orders/:id/payment` - Update payment (sends email)
- `DELETE /api/orders/:id` - Delete order

### Measurements
- `GET /api/measurements` - List measurements
- `POST /api/measurements` - Create measurement
- `PUT /api/measurements/:id` - Update measurement
- `DELETE /api/measurements/:id` - Delete measurement

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/:id/generate-pdf` - Generate PDF
- `POST /api/invoices/:id/send-email` - Send via email
- `PATCH /api/invoices/:id/status` - Update status
- `DELETE /api/invoices/:id` - Delete invoice

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/top-products` - Top products
- `GET /api/analytics/customer-insights` - Customer insights
- `GET /api/analytics/order-trends` - Order trends

## Features

- JWT Authentication
- Automatic email notifications
- PDF invoice generation with Puppeteer
- AWS S3 file storage
- Comprehensive analytics
- Database seeding

## Technology Stack

- Node.js + TypeScript
- Express.js
- Sequelize + Sequelize-TypeScript
- PostgreSQL (Supabase)
- JWT
- Nodemailer
- Puppeteer
- AWS S3

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error handling
│   ├── services/        # Email, PDF, S3 services
│   ├── utils/           # JWT utilities
│   ├── seeders/         # Database seeders
│   └── server.ts        # Main server file
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## Production Deployment

1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Update environment variables for production
4. Enable CORS for your frontend domain
