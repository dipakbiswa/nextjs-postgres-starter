# Next.js + PostgreSQL Starter Kit

A modern, production-ready starter kit for building scalable SaaS and web applications with Next.js 15 (App Router) and PostgreSQL. Features built-in authentication, email verification, role-based access control, and event management capabilities.

## ✨ Key Features

- **🔐 Authentication System** - JWT-based auth with secure cookie handling
- **📧 Email Integration** - Verification emails, QR codes, and account notifications via Nodemailer
- **👥 User Management** - Role-based access control with approval workflows
- **🎫 Event Management** - Registration system with QR code generation and check-in/out
- **🗄️ Raw SQL** - Direct PostgreSQL queries using `pg` package (no ORM overhead)
- **🚀 App Router** - Built on Next.js 15 App Router for optimal performance
- **🔒 Security First** - Environment-based secrets, token expiration, and input validation
- **📱 Email Templates** - Beautiful, responsive HTML email templates

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [PostgreSQL](https://www.postgresql.org/) via [`pg`](https://node-postgres.com/)
- **Authentication:** [jose](https://github.com/panva/jose) (JWT implementation)
- **Email:** [Nodemailer](https://nodemailer.com/)
- **Language:** JavaScript/Node.js

## 📁 Project Structure

```
├── lib/
│   ├── auth.js              # JWT token generation and verification
│   ├── getCurrentUser.js    # Server-side user session retrieval
│   └── logout.js            # Session cleanup utility
├── util/
│   ├── db.js                # PostgreSQL connection and query utilities
│   ├── email.js             # Email sending functions and templates
├── app/                     # Next.js App Router pages
├── public/                  # Static assets
└── .env.local              # Environment variables (create from .env.example)
```

### Key Modules

**`lib/auth.js`**

- `generateToken(user)` - Creates JWT with user data and 1-day expiration
- `verifyToken(token)` - Validates and decodes JWT tokens

**`lib/db.js`**

- `query(sql, params)` - Execute parameterized SQL queries safely
- `paginatedQuery(...)` - Built-in pagination support for large datasets
- `connection` - PostgreSQL connection pool instance

**`lib/email.js`**

- `sendVerificationEmail()` - Email verification with token links
- `sendQRCodeEmail()` - Event registration confirmations
- `sendAccountApprovalEmail()` - User onboarding notifications
- Plus rejection, question approval, and check-out emails

**`lib/getCurrentUser.js`**

- Retrieves authenticated user from HTTP-only cookies
- Returns `null` for unauthenticated requests

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **Gmail Account** (for email sending via SMTP)
- **npm** or **yarn** or **pnpm**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dipakbiswa/nextjs-postgres-starter.git
cd nextjs-postgres-starter
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_CONNECTION_STRING=postgresql://username:password@localhost:5432/database_name

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**🔑 Gmail Setup:**

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password in `EMAIL_PASS`

### 4. Database Setup

#### Create Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE your_database_name;
\c your_database_name
```

#### Run Migrations

Create your database schema based on your application needs. Example table structure:

```sql
-- Users table
create table public.users (
  id serial not null,
  email character varying(100) not null,
  name text not null,
  password character varying(255) not null,
  is_verified boolean null default false,
  verification_token character varying(64) null,
  token_expiry timestamp without time zone null,
  role character varying(5) null default 'user'::character varying,
  reset_token character varying(64) null,
  reset_token_expiry timestamp without time zone null,
  is_approved integer not null default 1,
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_role_check check (
    (
      (role)::text = any (
        array[
          ('user'::character varying)::text,
          ('admin'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

```

## 🏃 Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### Project Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## 🔒 Security Best Practices

- ✅ JWT secrets are environment-based and never committed
- ✅ Passwords should be hashed with bcrypt (implement in your auth routes)
- ✅ SQL queries use parameterized statements to prevent injection
- ✅ HTTP-only cookies prevent XSS attacks on tokens
- ✅ Email tokens expire after 24 hours
- ✅ JWT tokens expire after 1 day

## 🌐 Deployment

### Environment Variables

Ensure all environment variables are configured in your hosting platform:

- **Vercel:** Project Settings → Environment Variables
- **Railway:** Project → Variables
- **DigitalOcean:** App Platform → Settings → Environment

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm run start
```

### Database

Ensure your PostgreSQL database is accessible from your hosting environment. Popular options:

- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Supabase](https://supabase.com/) - PostgreSQL with additional features
- [Railway](https://railway.app/) - PostgreSQL with easy provisioning
- [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases)

## 📖 Usage Examples

### Query the Database

```javascript
import { query } from "@/lib/db";

// Fetch users
const users = await query("SELECT * FROM users WHERE role = $1", ["admin"]);

// Insert data
await query(
  "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)",
  ["user@example.com", "John Doe", hashedPassword]
);
```

### Get Current User in Server Components

```javascript
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Send Verification Email

```javascript
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

const token = generateVerificationToken();
await sendVerificationEmail(user.email, token);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [PostgreSQL](https://www.postgresql.org/)
- JWT implementation by [jose](https://github.com/panva/jose)

---

**Ready to build something amazing?** Star ⭐ this repo and get started today!

For questions or support, please [open an issue](https://github.com/dipakbiswa/nextjs-postgres-starter/issues).
