# ObraTrack

Gestión de proyectos de construcción y BIM. React + Vite + Supabase.

- `supabase/migrations/` — esquema de la base de datos (se aplica con la integración GitHub ↔ Supabase).
- `.github/workflows/deploy.yml` — publica la app en GitHub Pages en cada push a `main`.
- `.env.example` — variables que necesita la app (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

Sin esas variables la app abre en modo demostración, con datos de ejemplo.

Desarrollo local: `cp .env.example .env`, completar los valores y ejecutar `npm install --legacy-peer-deps && npm run dev`.
