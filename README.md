# Asesoría y Servicio Notarial — sitio web

Sitio estático de **2abogado.online**: página informativa del despacho (inicio, servicios, abogados) y once cuestionarios en línea.

## Estructura
| Ruta | Qué es |
|---|---|
| `index.html` | Inicio: la firma, áreas de servicio, equipo, guías, preguntas y contacto |
| `servicios/` | Detalle de cada servicio con liga a su cuestionario |
| `abogados/` | Perfil de los abogados |
| `assets/sitio.css`, `assets/sitio.js`, `assets/img/` | Estilos, menú y fotos de las páginas informativas |
| `tramites/` | Menú de los cuestionarios |
| `testamento/`, `compraventa/`, `donacion/`, `sucesion/`, `constitutiva/`, `poder/`, `protocolizacion/`, `cancelacion-hipoteca/`, `ratificacion/`, `fe-de-hechos/`, `capitulaciones/` | Los once cuestionarios |
| `gracias/` | Página de confirmación |
| `assets/form.css`, `assets/form.js` | Estilos y motor común de los formularios |
| `assets/datos.js` | Autocompletado por CURP |
| `assets/expediente.js` | Manda cada envío al expediente del cliente en Google Drive |
| `assets/config.js` | Única configuración editable: liga del script de Drive y plataforma de hosting |
| `vercel.json` | Configuración de Vercel. Además reenvía `/notaria` (y `/api/generar`) a la plataforma de la notaría (app-notarias.vercel.app), que se abre en **2abogado.online/notaria**; cada notaría entra por su liga, p. ej. **2abogado.online/notaria54**. La ruta vieja `/usuario` redirige a `/notaria`. No crear carpetas `notaria/`, `usuario/` ni `api/` aquí. |

## Cómo se publica
Vercel (equipo `bodas-civiles-mty`, proyecto `2abogado-online`) está conectado a este repositorio: cada cambio que llega a `main` se publica solo, y cada rama tiene su liga de vista previa.

## Qué NO va aquí
Machotes, escrituras y material notarial interno. El sitio sólo captura información.
