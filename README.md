# Narela Jod Print Studio

Modern startup-style stationery and printing website for Bhopal, built with React, Vite, Tailwind CSS, framer-motion, lucide-react, and a Spring Boot + PostgreSQL backend.

## Folder structure

- `src/components` shared layout, theme, toast, and UI primitives
- `src/pages` route-level pages
- `src/lib` constants, helpers, SEO helper
- `backend/src/main/java` Spring Boot controllers, services, entities, and repositories
- `backend/src/main/resources/application.yml` Spring configuration
- `backend/uploads` local uploaded files and generated previews when the backend runs

## Run locally

1. Install frontend dependencies:
   - `npm install`
2. Make sure PostgreSQL is running and create a database named `narela_print`
3. Start the Spring Boot backend in one terminal:
   - `npm run backend`
4. Start the frontend in another terminal:
   - `npm run dev`
5. Open the Vite URL shown in the terminal, usually `http://localhost:5173`

## Backend environment variables

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `UPLOAD_DIR`
- `SOFFICE_PATH`

Default local values are already configured in `backend/src/main/resources/application.yml`.

## Production build

- Frontend: `npm run build`
- Backend jar: `cd backend && mvnw.cmd package`

## Notes

- The frontend proxies `/api` and `/uploads` to `http://localhost:8080` in development.
- Spring Boot uses PostgreSQL by default and stores uploads on local disk.
- If LibreOffice is installed and `soffice` is available in PATH, Office files can be converted to PDF preview from the print studio.
- Update the WhatsApp number in `src/lib/constants.js` before deployment.
