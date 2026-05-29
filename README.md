# React CMS - Full Stack Website

A complete CMS website built with React.js (frontend), Node.js/Express (backend), and MySQL (database).

## Features

### Frontend (Public Website)
- Homepage with hero slider, featured services, projects, partner logos
- Services page with category filtering and detail pages
- Projects portfolio with image galleries and captions
- Contact form with department selection and multi-option fields
- FAQ page with accordion and category tabs
- Quotation request form
- Cookie consent bar with category-based choices
- Fully responsive design (mobile-first)
- Dynamic theming (colors, fonts loaded from admin settings)
- SEO meta tags, OG cards, structured data

### Admin Panel (/admin)
- Dashboard with stats and recent activity
- Theme Management (colors, fonts, logo, header/footer styles)
- Page Manager (rich text editor, SEO fields)
- Service Manager (categories, multi-image upload, pricing)
- Product Manager (categories, images, pricing)
- Project Manager (categories, multi-image with captions, delete from storage)
- Quotation System (create, PDF generation, email, payment links)
- Payment Settings (Stripe + MultiSafePay for iDEAL/WERO/card)
- Partner Manager (logos with URLs)
- Contact Manager (departments, form options, submissions)
- FAQ Manager (categories, reorder)
- Slider Manager (images, show/hide toggle)
- Cookie Bar Settings (text, categories)
- SEO Settings (GA, OG, Twitter cards, robots.txt, ads.txt, sitemap)
- SMTP Settings (with test email)
- Media Manager (upload, browse, delete files)

---

## Requirements

- Node.js 18+ (recommended: 20 LTS)
- MySQL 8.0+
- npm or yarn

---

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd react-cms
```

### Step 2: Set Up the Database

1. Log into MySQL:
```bash
mysql -u root -p
```

2. Run the schema file to create the database and all tables:
```bash
mysql -u root -p < backend/models/schema.sql
```

This creates the `cms_db` database with all 22 tables and default settings.

### Step 3: Configure the Backend

1. Copy the environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` with your settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=cms_db
DB_PORT=3306
JWT_SECRET=generate-a-random-secret-here
PORT=5000
UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:3000
```

3. Install dependencies:
```bash
npm install
```

4. Start the backend:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be running at `http://localhost:5000`

### Step 4: Configure the Frontend

1. Open a new terminal, go to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The website will be running at `http://localhost:3000`

### Step 5: Create Your Admin Account

Open your browser and go to `http://localhost:3000/admin/login`

Click "Register" or use the API directly:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"yourpassword"}'
```

Then log in at `/admin/login` with your credentials.

---

## Production Deployment

### Build the Frontend

```bash
cd frontend
npm run build
```

This creates a `dist/` folder with optimized static files.

### Serve with Nginx (recommended)

Example Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (static files)
    location / {
        root /var/www/react-cms/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
    }

    # SEO files
    location = /robots.txt { proxy_pass http://localhost:5000/robots.txt; }
    location = /ads.txt { proxy_pass http://localhost:5000/ads.txt; }
    location = /sitemap.xml { proxy_pass http://localhost:5000/sitemap.xml; }
}
```

### Run Backend with PM2

```bash
npm install -g pm2
cd backend
pm2 start server.js --name "cms-backend"
pm2 save
pm2 startup
```

---

## Payment Gateway Setup

### Stripe
1. Go to Admin > Payments
2. Enter your Stripe Publishable Key and Secret Key
3. Set webhook URL in Stripe Dashboard: `https://yourdomain.com/api/payments/stripe/webhook`

### MultiSafePay
1. Go to Admin > Payments
2. Enter your MultiSafePay API Key
3. Set webhook/notification URL: `https://yourdomain.com/api/payments/multisafepay/webhook`
4. Supports: iDEAL, WERO, Credit Card payments

---

## SMTP Setup

Go to Admin > SMTP Settings and configure:
- Host (e.g., smtp.gmail.com)
- Port (587 for TLS, 465 for SSL)
- Username and Password
- From Email and Name
- Encryption type (TLS recommended)

Use "Send Test Email" button to verify your settings.

---

## Folder Structure

```
react-cms/
├── backend/
│   ├── config/          # Database & mail configuration
│   ├── controllers/     # Route handlers (16 controllers)
│   ├── middleware/       # Auth, upload, validation
│   ├── models/          # SQL schema
│   ├── routes/          # API route definitions
│   ├── utils/           # PDF, email, sitemap helpers
│   ├── uploads/         # Uploaded files (auto-created)
│   ├── server.js        # Express app entry point
│   ├── .env.example     # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios config & API functions
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth, Theme, Cookie contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Public + Admin pages
│   │   ├── styles/      # CSS files
│   │   └── utils/       # Helper functions
│   ├── vite.config.js   # Vite configuration
│   └── package.json
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register admin account |
| POST | /api/auth/login | Login |
| GET/PUT | /api/theme | Theme settings |
| CRUD | /api/pages | Content pages |
| CRUD | /api/services | Services + categories |
| CRUD | /api/products | Products + categories |
| CRUD | /api/projects | Projects + categories + images |
| CRUD | /api/quotations | Quotations + items + PDF |
| GET/PUT | /api/payments | Payment gateway settings |
| CRUD | /api/partners | Partner logos |
| CRUD | /api/contact | Departments, options, submissions |
| CRUD | /api/faq | FAQ items + categories |
| CRUD | /api/slider | Slider items |
| GET/PUT | /api/cookiebar | Cookie bar settings |
| GET/PUT | /api/seo | SEO settings |
| GET/PUT | /api/settings/smtp | SMTP configuration |
| POST | /api/media/upload | File upload |
| GET | /sitemap.xml | Auto-generated sitemap |
| GET | /robots.txt | Robots file |

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, React Slick, React Quill, Formik + Yup
- **Backend**: Node.js, Express.js, MySQL2, JWT, Multer, PDFKit, Nodemailer, Sharp
- **Database**: MySQL 8.0+ with InnoDB tables
- **Payments**: Stripe.js, MultiSafePay REST API

---

## License

Private - All rights reserved.
