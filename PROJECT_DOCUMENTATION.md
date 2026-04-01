# Narela Jod Print Studio

Comprehensive project documentation for the stationery and printing shop platform built for Bhopal, India.

## 1. Project overview

This project is a modern startup-style web platform for a stationery and printing shop. It combines:

- a customer-facing marketing website
- a multi-document print studio
- a Spring Boot backend
- PostgreSQL persistence
- local file upload and preview handling
- an admin-facing order review flow

The product goal is to let customers:

- upload one or more files
- configure print settings for each file
- preview supported files before ordering
- receive live pricing
- place an order online

The long-term direction is a production-ready printing SaaS-like experience with:

- payment integration
- admin authentication
- cloud file storage
- office-document conversion
- richer design/editing tools

## 2. Current tech stack

### Frontend

- React
- Vite
- Tailwind CSS
- framer-motion
- lucide-react
- react-router-dom
- react-pdf
- pdfjs-dist

### Backend

- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Spring Validation
- PostgreSQL
- Lombok

### Development environment

- Node.js for frontend tooling
- Java 21+ runtime
- PostgreSQL local instance
- LibreOffice optional for DOCX/PPTX preview conversion

## 3. Current project structure

```text
D:\NARELA JOD
  backend/
    .mvn/
    mvnw
    mvnw.cmd
    pom.xml
    src/main/java/com/narelaprint/backend/
      BackendApplication.java
      config/
        JacksonConfig.java
        SecurityConfig.java
        WebConfig.java
      controller/
        PrintStudioController.java
      dto/
        OrderItemResponse.java
        OrderResponse.java
        OrdersResponse.java
        PreviewConversionResponse.java
        QuoteItemRequest.java
        QuoteItemResponse.java
        QuoteRequest.java
        QuoteResponse.java
      entity/
        OrderItem.java
        PrintOrder.java
      repository/
        PrintOrderRepository.java
      service/
        OrderService.java
        PreviewConversionService.java
        PricingService.java
        StorageService.java
    src/main/resources/
      application.yml
  dist/
  node_modules/
  public/
    favicon.svg
  src/
    components/
      app-shell.jsx
      maps-embed.jsx
      section-heading.jsx
      theme-provider.jsx
      toast-provider.jsx
      ui/
        button.jsx
        card.jsx
        input.jsx
        select.jsx
        skeleton.jsx
        textarea.jsx
    lib/
      constants.js
      print-studio.js
      seo.js
      utils.js
    pages/
      admin-page.jsx
      contact-page.jsx
      home-page.jsx
      services-page.jsx
      upload-page.jsx
    App.jsx
    main.jsx
    styles.css
  index.html
  package.json
  package-lock.json
  README.md
  vite.config.js
  PROJECT_DOCUMENTATION.md
```

## 4. Frontend application details

### 4.1 App shell and routing

Frontend entry files:

- [src/main.jsx](D:\NARELA JOD\src\main.jsx)
- [src/App.jsx](D:\NARELA JOD\src\App.jsx)

The app uses `BrowserRouter` and renders routes inside a shared shell.

Routes currently available:

- `/` homepage
- `/services` services page
- `/upload` print studio / upload page
- `/contact` contact page
- `/admin` admin dashboard

### 4.2 Shared layout

Layout and global wrappers:

- [src/components/app-shell.jsx](D:\NARELA JOD\src\components\app-shell.jsx)
- [src/components/theme-provider.jsx](D:\NARELA JOD\src\components\theme-provider.jsx)
- [src/components/toast-provider.jsx](D:\NARELA JOD\src\components\toast-provider.jsx)

Implemented features:

- sticky navbar
- responsive mobile navigation
- dark/light mode toggle
- shared footer
- toast notifications

### 4.3 Styling system

Global theme and visual design:

- [src/styles.css](D:\NARELA JOD\src\styles.css)

Current design characteristics:

- premium gradient background
- glassmorphism panels and buttons
- high-contrast typography
- modern rounded corners
- light and dark mode support

### 4.4 Shared UI primitives

Reusable UI components:

- [src/components/ui/button.jsx](D:\NARELA JOD\src\components\ui\button.jsx)
- [src/components/ui/card.jsx](D:\NARELA JOD\src\components\ui\card.jsx)
- [src/components/ui/input.jsx](D:\NARELA JOD\src\components\ui\input.jsx)
- [src/components/ui/select.jsx](D:\NARELA JOD\src\components\ui\select.jsx)
- [src/components/ui/textarea.jsx](D:\NARELA JOD\src\components\ui\textarea.jsx)
- [src/components/ui/skeleton.jsx](D:\NARELA JOD\src\components\ui\skeleton.jsx)

These components give:

- consistent styling
- reusable glass look
- consistent spacing and rounding
- easier future refactoring

## 5. Pages and feature breakdown

### 5.1 Homepage

File:

- [src/pages/home-page.jsx](D:\NARELA JOD\src\pages\home-page.jsx)

Features:

- hero section
- CTA buttons
- services highlights
- how-it-works section
- testimonials
- map embed
- animated sections

### 5.2 Services page

File:

- [src/pages/services-page.jsx](D:\NARELA JOD\src\pages\services-page.jsx)

Features:

- service cards
- pricing display
- visual service categories

### 5.3 Contact page

File:

- [src/pages/contact-page.jsx](D:\NARELA JOD\src\pages\contact-page.jsx)

Features:

- contact form UI
- address and timings
- WhatsApp CTA
- map embed

### 5.4 Admin page

File:

- [src/pages/admin-page.jsx](D:\NARELA JOD\src\pages\admin-page.jsx)

Features:

- fetches orders from backend
- displays customer details
- displays multi-document order items
- shows total amounts
- download links for files
- loading skeletons

Current limitation:

- no admin authentication yet
- admin route is not protected

### 5.5 Print Studio page

File:

- [src/pages/upload-page.jsx](D:\NARELA JOD\src\pages\upload-page.jsx)

This is the core feature of the project.

Implemented features:

- multi-file upload
- drag and drop upload area
- explicit file picker button
- document list sidebar
- per-document settings
- customer details collection
- live pricing via backend quote API
- PDF preview
- image preview
- PDF page thumbnails
- PDF page selection
- page range updates
- WhatsApp deep link for order summary
- order submission to backend

Current per-document settings:

- color mode
- paper size
- orientation
- page count
- copies
- print side
- binding
- page range
- scaling
- lamination
- notes

Preview behavior:

- `PDF` renders in preview area using `react-pdf`
- `JPG/PNG` renders as image preview
- `DOC/DOCX/PPT/PPTX` can be converted to PDF if LibreOffice is installed

Current limitations:

- no true content editing inside PDF/DOCX/PPTX
- no crop/rotate/image editing tools yet
- no persistent draft save

## 6. Frontend utility files

### 6.1 Constants

File:

- [src/lib/constants.js](D:\NARELA JOD\src\lib\constants.js)

Contains:

- nav links
- services list
- testimonials
- highlights
- WhatsApp number

### 6.2 Print studio helpers

File:

- [src/lib/print-studio.js](D:\NARELA JOD\src\lib\print-studio.js)

Contains:

- file type mappings
- preview mode logic
- default document settings
- document item creation
- quote payload generation
- WhatsApp message builder

### 6.3 Shared utils

File:

- [src/lib/utils.js](D:\NARELA JOD\src\lib\utils.js)

Contains:

- class name combiner
- currency formatting
- date formatting
- file type formatting

### 6.4 SEO helper

File:

- [src/lib/seo.js](D:\NARELA JOD\src\lib\seo.js)

Updates:

- page title
- meta description

## 7. Backend architecture

The backend is now a Spring Boot application and is the primary backend for the system.

Entry file:

- [BackendApplication.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\BackendApplication.java)

### 7.1 Configuration

Files:

- [application.yml](D:\NARELA JOD\backend\src\main\resources\application.yml)
- [SecurityConfig.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\config\SecurityConfig.java)
- [WebConfig.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\config\WebConfig.java)
- [JacksonConfig.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\config\JacksonConfig.java)

Current configuration:

- backend runs on port `8080`
- frontend dev origin `http://localhost:5173` is allowed
- security is currently permissive for development
- uploads are served under `/uploads/**`
- PostgreSQL is configured through env variables with local defaults

Current default DB config:

- database: `narela_print`
- username: `postgres`
- password: `postgres`

These are only safe for local development.

### 7.2 Entities

Files:

- [PrintOrder.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\entity\PrintOrder.java)
- [OrderItem.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\entity\OrderItem.java)

#### PrintOrder fields

- `id`
- `publicId`
- `name`
- `phone`
- `address`
- `notes`
- `itemCount`
- `totalAmount`
- `createdAt`
- `items`

#### OrderItem fields

- `id`
- `order`
- `tempId`
- `displayName`
- `fileType`
- `colorMode`
- `paperSize`
- `orientation`
- `printSide`
- `pages`
- `printablePages`
- `copies`
- `pageRange`
- `bindingType`
- `lamination`
- `scaleType`
- `notes`
- `unitPrice`
- `totalPrice`
- `fileName`
- `fileUrl`

### 7.3 Repository

File:

- [PrintOrderRepository.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\repository\PrintOrderRepository.java)

Current responsibility:

- basic JPA persistence for orders

### 7.4 DTOs

Files in:

- [backend/src/main/java/com/narelaprint/backend/dto](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\dto)

These DTOs define request/response shapes for:

- quote requests
- quote responses
- orders
- order items
- preview conversion

### 7.5 Services

#### PricingService

File:

- [PricingService.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\service\PricingService.java)

Responsibility:

- calculates per-item and order pricing

Pricing logic currently considers:

- page count
- copies
- color mode
- paper size
- single/double side
- lamination
- binding type
- selected page range

#### StorageService

File:

- [StorageService.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\service\StorageService.java)

Responsibility:

- stores uploaded files on local disk
- exposes upload paths
- creates upload/previews folders

Current storage mode:

- local filesystem only

#### PreviewConversionService

File:

- [PreviewConversionService.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\service\PreviewConversionService.java)

Responsibility:

- converts Office files to PDF previews using LibreOffice

Important dependency:

- requires `soffice` to be installed and available in PATH, or `SOFFICE_PATH` to be configured

Current limitation:

- if LibreOffice is not installed, conversion will fail with a clear error

#### OrderService

File:

- [OrderService.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\service\OrderService.java)

Responsibility:

- parses item payload JSON
- stores uploaded files
- calculates final item pricing
- creates orders and order items
- fetches order list

### 7.6 Controller

File:

- [PrintStudioController.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\controller\PrintStudioController.java)

Current API endpoints:

- `POST /api/quote`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/preview/convert`

## 8. API details

### 8.1 Quote API

Endpoint:

- `POST /api/quote`

Purpose:

- returns live item pricing and total amount

Frontend usage:

- called automatically when document settings change

### 8.2 Orders API

Endpoints:

- `GET /api/orders`
- `POST /api/orders`

Purpose:

- fetch admin order list
- create a new customer order

### 8.3 Preview conversion API

Endpoint:

- `POST /api/preview/convert`

Purpose:

- upload an Office document
- convert it to PDF preview
- return preview URL

Supported conversion targets:

- `DOC`
- `DOCX`
- `PPT`
- `PPTX`

## 9. Database details

Current DB:

- PostgreSQL

Expected local database:

- `narela_print`

Current persistence behavior:

- JPA/Hibernate
- schema auto-update through `ddl-auto: update`

Important note:

This is acceptable for development but not production.

For production, this should be replaced with:

- Flyway migrations
- explicit schema management

## 10. Build and run instructions

### 10.1 Frontend

Install dependencies:

```powershell
npm install
```

Run frontend:

```powershell
npm run dev
```

Build frontend:

```powershell
npm run build
```

### 10.2 Backend

Run backend:

```powershell
npm run backend
```

Build backend:

```powershell
cd backend
mvnw.cmd -DskipTests package
```

### 10.3 Required environment variables for local backend

In PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/narela_print"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:SOFFICE_PATH="C:\Program Files\LibreOffice\program\soffice.exe"
```

Then run:

```powershell
npm run backend
```

## 11. Current setup status

### Working now

- React frontend builds
- Spring Boot backend builds
- PostgreSQL connectivity works when credentials are correct
- quote API exists
- order creation API exists
- admin fetch API exists
- file upload path exists
- PDF preview exists
- image preview exists
- PDF thumbnails and page selection exist

### Partially complete

- DOCX/PPTX preview conversion

The code is present, but actual conversion requires LibreOffice installation.

### Not yet complete

- payment gateway
- admin authentication
- customer login
- cloud file storage
- production migrations
- audit logging
- email/WhatsApp notifications from backend
- true document editing
- full design studio

## 12. Feature inventory

### Already implemented

- marketing website
- responsive layout
- dark/light mode
- multi-document upload
- print settings per document
- live pricing
- admin order listing
- PDF/image preview
- PDF page selection
- WhatsApp order link

### Planned / recommended next features

- payment gateway integration
- admin auth
- order status workflow
- database migrations
- cloud storage
- template editor for posters/cards/resumes
- invoice generation
- customer order tracking

## 13. Known limitations and technical debt

### Frontend

- upload page is currently a large component and should be split into smaller reusable components
- PDF preview increases bundle size significantly
- no dedicated frontend API abstraction layer yet

### Backend

- security currently permits all requests
- no Flyway
- no DTO validation annotations yet
- no central exception handler
- local disk storage only
- no tests

### Infrastructure

- no deployment config included
- no Docker setup
- no monitoring
- no secrets management strategy

## 14. Production readiness gaps

To make this project production ready, the following should be done:

### Backend hardening

- add Flyway
- add authentication and authorization
- add DTO validation
- add global exception handling
- add logging and tracing
- add actuator health endpoint

### Infrastructure

- move uploads to S3 or Cloudinary
- move secrets to env vars only
- deploy PostgreSQL on managed infra
- add backups
- add HTTPS and domain setup

### Business features

- add Razorpay
- add order status updates
- add invoice/receipt support
- add admin actions

## 15. Recommended production stack

- frontend: Vercel
- backend: Render, Railway, AWS, or VPS
- database: Neon, Supabase, Railway Postgres, or AWS RDS
- file storage: Cloudinary or AWS S3
- payment: Razorpay
- document conversion: LibreOffice-enabled server or conversion worker

## 16. Suggested roadmap

### Phase 1

- stabilize current Spring Boot runtime
- install LibreOffice
- verify Office conversion
- split upload page into smaller components

### Phase 2

- add Flyway
- add Spring Security admin auth
- add order status fields

### Phase 3

- integrate Razorpay
- protect admin pages
- add payment status handling

### Phase 4

- migrate uploads to cloud storage
- add better conversion pipeline
- add admin workflow improvements

### Phase 5

- add custom template design editor
- add customer order tracking
- production deployment

## 17. Current commands reference

Frontend install:

```powershell
npm install
```

Frontend dev:

```powershell
npm run dev
```

Backend dev:

```powershell
npm run backend
```

Backend build:

```powershell
cd backend
mvnw.cmd -DskipTests package
```

Create database:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "CREATE DATABASE narela_print;"
```

## 18. Important local dependencies

You need these installed locally for full functionality:

- PostgreSQL
- Java
- Node.js
- LibreOffice for Office preview conversion

## 19. Important files to know first

If someone new joins this project, the first files to read should be:

- [PROJECT_DOCUMENTATION.md](D:\NARELA JOD\PROJECT_DOCUMENTATION.md)
- [README.md](D:\NARELA JOD\README.md)
- [src/pages/upload-page.jsx](D:\NARELA JOD\src\pages\upload-page.jsx)
- [backend/src/main/java/com/narelaprint/backend/controller/PrintStudioController.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\controller\PrintStudioController.java)
- [backend/src/main/java/com/narelaprint/backend/service/OrderService.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\service\OrderService.java)
- [backend/src/main/java/com/narelaprint/backend/service/PricingService.java](D:\NARELA JOD\backend\src\main\java\com\narelaprint\backend\service\PricingService.java)
- [backend/src/main/resources/application.yml](D:\NARELA JOD\backend\src\main\resources\application.yml)

## 20. Summary

This project is now a serious foundation rather than a throwaway prototype.

It already has:

- a real frontend
- a real backend
- a real database path
- upload and quote workflows
- preview support
- admin listing

What remains is mostly product hardening and advanced features, not basic setup.
