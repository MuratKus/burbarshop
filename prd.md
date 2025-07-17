# 🖼️ Burbar Shop – Product Requirements Document (PRD)

## 1. Overview

**Product name:** Burbar Shop  
**Description:** A minimalistic, playful e‑commerce site showcasing and selling Burçin’s physical art prints (Turkish/Greek historic women, dancers, god figures).  
**Target audience:** Art lovers—especially women—interested in culturally-inspired prints, postcards, and riso art.  
**Primary goals:**
- Showcase Burçin’s brand and story  
- Simplify browsing, filtering, and purchasing of prints  
- Enable easy admin control (products, shipping, promotions)  
- Offer a smooth checkout (including guest) with automated email confirmation  

---

## 2. Objectives & Success Metrics

| Objective                                            | Success Metric                                 |
| -----------------------------------------------------| ---------------------------------------------- |
| Launch MVP with shop, checkout, admin features       | Completed staging system on Vercel + custom domain |
| Drive initial sales                                  | ≥ 10 orders in first month                     |
| Deliver smooth user experience                       | Cart drop-off rate < 30%                       |
| Reduce admin workload                                | Admin panel adoption rate > 90%                |
| Improve SEO visibility                               | Page 1 placement for “Burbar prints” in 2 months |

---

## 3. User Roles & Flows

### A. Visitor
- Home → Shop (filter by type/size) → View product → Add to cart → Checkout (guest or register)  
- Receives email receipt; optional account created  

### B. Registered Customer
- Same as Visitor, plus:
  - View order history and manage account  

### C. Admin (Burçin)
- Login → Admin dashboard:
  - Create/update/delete products (title, images, variants)  
  - Manage shipping zones and rates  
  - Create/manage promo codes and bundles  
  
  - View orders and change status (Pending → Shipped)  
  - Monitor inventory levels  

---

## 4. Features

### 4.1 Core Pages
- **Home:** Hero section with featured prints slider; artist intro banner  
- **Shop:** Grid layout of products; filters by type (Postcard, Fine Print, Riso Print) and size (A4, A5, Square)  
- **Product Detail:** Multiple images; description; variant selector; stock count; “Add to Cart”  
- **Cart:** Review items; apply promo codes; select shipping country; view estimated shipping cost  
- **Checkout:** Guest or login; shipping form; payment via Stripe/PayPal  
- **Confirmation:** On-screen summary; email trigger for customer + admin  

### 4.2 Admin Panel
- **Products:** CRUD interface; upload images; manage variants & stock  
- **Shipping Zones:** Define zones & rates  
- **Promotions:** Create discount codes & bundles  
- **Orders:** List & detail view; change status  
- **Notifications:** Email on new order & status updates  

### 4.3 Authentication
- Email/password (NextAuth)  
- Guest checkout  
- Password reset via email link  

### 4.4 Inventory & Shipping
- Track inventory per variant  
- Auto-calc shipping based on zone  
- Editable rates in admin  

### 4.5 Analytics & SEO
- Vercel Analytics or Google Analytics  
- SEO metadata, sitemap, `robots.txt`  
- Social sharing meta tags (Open Graph)  

### 4.6 Email Notifications
- Use SendGrid or Resend  
- Order confirmation (customer & admin)  
- Shipping/shipped notification (optional)  

---

## 5. Technical Requirements

### 5.1 Tech Stack
- **Framework:** Next.js (app router) + TypeScript  
- **Styling:** Tailwind CSS  
- **Database:** SQLite (dev) → PostgreSQL (prod) via Prisma  
- **Auth:** NextAuth (email)  
- **Payments:** Stripe & PayPal  
- **Emails:** SendGrid/Resend API  
- **Hosting:** Vercel (GitHub integration)  

### 5.2 Architecture
- SSR/ISR for product pages  
- API routes for payments, webhooks, orders  
- Prisma-managed schema (Product, Variant, Order, etc.)  

### 5.3 Environment
- `.env.local` for secrets (DB, Stripe, NextAuth, Email)  
- Migrations via `prisma migrate`  
- Lint/format: ESLint + Prettier  

### 5.4 Security
- HTTPS enforced (TLS by Vercel)  
- Input validation (Zod)  
- SPF/DKIM for email  
- GDPR compliance placeholders (privacy page)  

---

## 6. Roadmap & Timeline

| Phase                              | Description                                          | Duration     |
| ---------------------------------- | ---------------------------------------------------- | ------------ |
| **1. Setup & Scaffolding**         | Init Next.js + Prisma + Tailwind; basic pages/models | 1 week       |
| **2. Shop & Filters**              | Build shop page, filters, detail, cart flow          | 1–2 weeks    |
| **3. Checkout & Payments**         | Integrate Stripe/PayPal; email triggers              | 1 week       |
| **4. Admin Panel**                 | Product/variant CRUD; shipping & promo management    | 1–2 weeks    |
| **5. SEO & Analytics**             | Metadata, analytics setup                            | 1 week       |
| **6. Testing & Launch Prep**       | QA, domain & SSL, finalize policies                  | 1 week       |
| **7. Launch & Iteration**          | Deploy; monitor; refine based on feedback            | Ongoing      |

---

## 7. Risks & Mitigation
- **Payment flow complexity:** Start with Stripe, then add PayPal  
- **Email deliverability:** Configure SPF/DKIM early & test  
- **Admin scaling:** MVP features first; refine later  
- **Shipping logic:** Begin with flat rates per zone, iterate  

---

## 8. Glossary
- **SKU:** Stock Keeping Unit  
- **Variant:** Size/type combination of a product  
- **ISR:** Incremental Static Regeneration  
- **SSR/SSG:** Server-Side/Static Site Generation  

---

*End of PRD*

