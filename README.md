# Taraf (ترف) — Luxury E-Commerce Backend

REST API for **Taraf**, an Arabic-first luxury e-commerce platform targeting GCC/Saudi Arabia.

## Stack

- **Node.js + Express 5 + TypeScript**
- **Prisma + PostgreSQL**
- **JWT** (access + refresh tokens)
- **Cloudinary** (product image uploads)
- **Joi** validation
- **OpenAPI/Swagger** at `/api/v1/docs`

## Money format

All prices are stored and returned as **whole SAR** (e.g. `4200` = 4,200 ر.س).  
VAT is calculated as `Math.round(subtotal * 0.15)` (15%).

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, and Cloudinary credentials.

### 3. Install & migrate

```bash
npm install
npm run db:push
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

API: `http://localhost:3000/api/v1`  
Swagger: `http://localhost:3000/api/v1/docs`

## Seed accounts

| Role     | Email              | Password       |
|----------|--------------------|----------------|
| Admin    | admin@taraf.sa     | Password123!   |
| Customer | customer@taraf.sa  | Password123!   |

## Frontend integration

Set in your Next.js app (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Guest cart: send `X-Session-Id` header (returned as `X-Session-Id` on first cart request).

Auth: `Authorization: Bearer <accessToken>`

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/api/v1/auth` |
| Products | `/api/v1/products` |
| Collections | `/api/v1/collections` |
| Home | `/api/v1/home` |
| Catalog filters | `/api/v1/catalog/filters` |
| Cart | `/api/v1/cart` |
| Checkout | `/api/v1/checkout` |
| Orders | `/api/v1/orders` |
| Account | `/api/v1/account` |
| Admin | `/api/v1/admin` |
| Newsletter | `/api/v1/newsletter/subscribe` |

## Error format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": {}
  }
}
```

## Pagination format

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 12, "total": 120, "totalPages": 10 }
}
```

## Admin product images

`POST /api/v1/admin/products` accepts `multipart/form-data` with field `images` (Cloudinary upload).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:push` | Push schema (dev) |

## Business rules

- **VAT:** 15% on subtotal
- **Shipping:** Free for Saudi Arabia (`country === "SA"`)
- **Guest cart:** Merged into user cart on login
- **Reviews:** Purchase required, one per product
- **Order IDs:** Customer-facing `TR-xxxxx` prefix
