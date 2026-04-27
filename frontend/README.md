# Frontend (React + Vite)

Environment Variables (ENTRA_)
-
- The frontend reads Entra settings from `ENTRA_*` variables (not `VITE_*`).
- For local dev (`npm run dev`), place values in `frontend/.env.local`.
- For Docker Compose, use `docker compose --env-file frontend/.env.local ...` so values are passed as build args.

Example `frontend/.env.local`:

```dotenv
ENTRA_CLIENT_ID=<frontend-client-id>
ENTRA_TENANT_ID=<tenant-id>
ENTRA_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
ENTRA_API_SCOPES=api://<backend-client-id>/access_as_user
ENTRA_API_REDIRECT_URI=http://localhost:5173
ENTRA_POPUP_REDIRECT_URI=http://localhost:5173/auth-popup.html
```

For Docker Compose mode (app served on port 8080), set:
- `ENTRA_API_REDIRECT_URI=http://localhost:8080`
- `ENTRA_POPUP_REDIRECT_URI=http://localhost:8080/auth-popup.html`

Dev:

```bash
cd frontend
npm install
npm run dev
```

Notes about Tailwind
-
- This frontend now uses Tailwind CSS for styling. Tailwind and PostCSS are included as devDependencies in `package.json`.
- After running `npm install`, the Vite dev server will process Tailwind directives in `src/index.css` automatically.

Build (for embedding into Spring Boot):

```bash
cd frontend
npm run build
cp -r dist/* ../src/main/resources/static/
```

Run with Docker Compose (recommended for full app):

```bash
docker compose --env-file frontend/.env.local up --build -d
```

Note: frontend env values are embedded at image build time. Rebuild the image after env changes.

Notes
-
- The SPA talks to the backend under `/api` via the Vite dev proxy. When running the dev server (`npm run dev`) the proxy forwards requests to the Spring Boot app (default localhost:8080).
- Demo accounts (seeded at backend startup): `admin`/`admin123`, `user`/`password`, `john`/`john123`, `alice`/`alice456`.
- If you configure Entra integration then can create users with the same username but the passwords will be different.
- The backend also seeds example payment methods and transactions on startup. If you don't see payments or transactions, restart the Spring Boot app so the in-memory H2 DB is reinitialized.
- Registration: the login form has a `Register` button which posts to `POST /api/users` and will auto-login the created user. The backend allows anonymous registration in this demo.

Security / Demo warnings
-
- This project intentionally contains insecure demo code (plain-text passwords, stored card PAN/CVV, weak JWT secret, SQL built from user input). Do NOT use any of this code in production.

Troubleshooting
-
- If the frontend cannot reach the backend during dev, ensure the Spring Boot app is running on port 8080 or update the proxy in `vite.config.js`.
- If `npm install` fails due to peer dependency issues, try running `npm install --legacy-peer-deps` or ensure your Node version matches the project's requirements (Node 18+ recommended).

