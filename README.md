# ELMACHORENACE — MVP

Experiencia digital mobile-first asociada al token único de cada prenda EMR.

## Puesta en marcha

Backend:

```bash
cd backend
npm install
npm run contract:emit
npm run migration:apply
npm run seed
npm run dev
```

Frontend, en otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Experiencia de desarrollo: `http://localhost:5173/c/A81KX9`.

Las variables disponibles están documentadas en los archivos `.env.example`.
`DATABASE_URL` sólo debe existir en el backend. El intervalo real es 24 horas;
`UNLOCK_DELAY_MS` existe para pruebas controladas.

## Permisos PostgreSQL

El rol configurado en `DATABASE_URL` necesita permiso para crear objetos en la
base y en el esquema `public`. Un administrador de PostgreSQL puede otorgarlo:

```sql
GRANT CREATE ON DATABASE emr_sistema_mvp TO "Aldair";
GRANT USAGE, CREATE ON SCHEMA public TO "Aldair";
```

Después se aplica la migración con `npm run migration:apply` y se carga el seed
con `npm run seed`.
