# Asesoría y Servicio Notarial — sitio web

Sitio estático de **2abogado.online**: página principal y once cuestionarios en línea.

## Estructura
| Ruta | Qué es |
|---|---|
| `index.html` | Página principal (promoción del mes del testamento y catálogo de trámites) |
| `tramites/` | Menú de los cuestionarios |
| `testamento/`, `compraventa/`, `donacion/`, `sucesion/`, `constitutiva/`, `poder/`, `protocolizacion/`, `cancelacion-hipoteca/`, `ratificacion/`, `fe-de-hechos/`, `capitulaciones/` | Los once cuestionarios |
| `gracias/` | Página de confirmación |
| `assets/form.css`, `assets/form.js` | Estilos y motor común de los formularios |
| `assets/datos.js` | Autocompletado por CURP |
| `assets/expediente.js` | Manda cada envío al expediente del cliente en Google Drive |
| `assets/config.js` | Única configuración editable: liga del script de Drive y plataforma de hosting |
| `vercel.json` | Configuración para publicar en Vercel |

## Cómo se publica
- Hoy: Netlify (proyecto `2abogadoenlinea`), arrastrando la carpeta a Deploys.
- Con Vercel conectado a este repositorio: cada cambio que se guarde aquí se publica solo.

Al mudar el sitio a Vercel hay que poner `usarNetlifyForms: false` en `assets/config.js`.

## Qué NO va aquí
Machotes, escrituras y material notarial interno. El sitio sólo captura información.
