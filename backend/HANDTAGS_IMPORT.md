# Importar códigos de Handtags a EMR

Ejecuta este comando **desde tu laptop**, después de generar los códigos en Handtags y de preparar la base EMR con sus migraciones y frases. Handtags no necesita estar alojado en el servidor. El importador solo inserta códigos faltantes en `prenda`; no modifica prendas, mensajes, contactos ni referidos existentes.

En `backend`, la vista previa es:

```powershell
npm run handtags:import
```

Si quieres limitar la operación a un lote, añade `-- --batch-id=ID_DEL_LOTE` (o varios `--batch-id`). Sin esa opción revisa todos los códigos de Handtags. La vista previa muestra el total, el desglose por prefijo, los existentes y los pendientes. Rechaza códigos sin producto, anulados (`VOID`), cuyos prefijos no coincidan con el producto, o cuya URL QR no sea exactamente `https://elmachorenace.com/c/CODIGO`. Los códigos `GENERATED`, `PRINTED` y `USED` son importables, lo que también permite repetir el comando si su estado cambió después de una importación anterior.

Para importar, repite el comando con los valores exactos mostrados por la vista previa:

```powershell
npm run handtags:import -- --apply --confirm-target=localhost:5432/emr_sistema_mvp --confirm-count=300
```

El destino anterior es **solo un ejemplo**: usa siempre el destino y el total de tu vista previa. El comando no fija 300 ni ningún tamaño de lote. Cada prenda nueva se crea con el prefijo anterior al guion como `tipoPrenda`, `RENACER` como etapa y `GENERADA` como estado. Si repites la importación, conserva las prendas existentes sin reiniciar su progreso.

Por defecto usa `DATABASE_URL` de `backend/.env` como destino y deriva la base local `emr_handtag_generator` como origen. Para importar directamente a la base alojada, define `EMR_IMPORT_DATABASE_URL` con la conexión de EMR en el entorno de esta terminal; `DATABASE_URL` puede seguir siendo la de EMR local para derivar Handtags. Si tus conexiones locales son distintas, define también `HANDTAGS_DATABASE_URL`. No pongas estas URL en Git ni las imprimas en capturas.

Al verificar el comando, Handtags estaba vacío y no se importó ningún código. Genera los lotes reales antes de ejecutar la vista previa. Cualquier URL antigua de `emr.pe` hará que la validación cancele la operación.
