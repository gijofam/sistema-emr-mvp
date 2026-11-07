# EMR — experiencia web

Frontend mobile-first de la experiencia oculta en las prendas ELMACHORENACE.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/c/A81KX9`. Configura `VITE_API_URL` a partir de
`.env.example` cuando la API no se ejecute en `http://localhost:3000`.

## Compartir desde un celular en la red local

El menú nativo para compartir requiere un contexto seguro. `http://localhost`
solo cuenta como seguro en el propio dispositivo; la IP de la laptop por HTTP
no sirve para esta función.

Con el backend en el puerto 3000, genera un certificado para la IP actual de la
laptop (requiere OpenSSL o Git for Windows) y arranca el frontend:

```powershell
.\scripts\create-dev-certs.ps1 -LanIp 192.168.1.14
npm run dev:https
```

Cierra antes cualquier Vite que esté usando el puerto 5173. En el celular,
instala `dev-certs/rootCA.crt` como certificado CA de usuario y abre
`https://192.168.1.14:5173/c/A81KX9`. Transfiere solo el archivo `.crt` al
celular; `rootCA-key.pem` es privado y nunca debe compartirse. La API se
consulta a través del proxy HTTPS `/api` del mismo servidor Vite. Si cambia la
IP o regeneras el certificado, vuelve a instalar el nuevo `.crt` en el celular.
Los certificados locales están excluidos de Git.

El logo y las URLs oficiales de redes se reemplazan de forma centralizada en
`src/config/brand.js`.

## Dominio público

La compilación de producción genera invitaciones como
`https://elmachorenace.com/r/EMR-A71F93C2`. En desarrollo sigue usando el
origen local para que los enlaces de prueba funcionen antes del despliegue.
Las rutas de las prendas tienen el formato
`https://elmachorenace.com/c/A81KX9`.

Para publicar, conecta `elmachorenace.com` al frontend en el hosting, configura
`VITE_API_URL` con la URL HTTPS pública del backend seguida de `/api/v1`, y
añade `https://elmachorenace.com` a `ALLOWED_ORIGINS` en el backend. El sitio
debe servir `index.html` para `/c/*` y `/r/*` al abrir una URL directamente.
Los QR ya impresos con la IP local deben generarse nuevamente con el dominio.
