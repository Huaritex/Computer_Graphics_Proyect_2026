# Arquitectura

## Objetivo

Separar entrada, validación, transformación geométrica, detección de proximidad y presentación. La aplicación usa Vite para empaquetado y Three.js para renderizado WebGL.

## Capas

1. **Entrada y configuración:** parámetros en milímetros validados antes de crear geometría.
2. **Validadores:** `src/validators/inputValidator.js` y `geometryValidator.js`.
3. **Geometría:** funciones puras en `src/core/geometry.js`; convierten milímetros a unidades de escena.
4. **Análisis:** `src/core/CollisionDetector.js` compara pares de segmentos.
5. **Presentación:** `src/main.js` permanece desacoplado de los módulos puros por ahora.
6. **Carga externa:** el recurso pendiente se incorporará mediante `GLTFLoader`, sin descargar datos implícitos.

## Flujo

`entrada JSON → validación → distribución en mm → conversión a unidades Three.js → construcción de mallas → raycast/interacción → análisis de proximidad`.

## Responsabilidades futuras

La capa de interacción deberá gestionar OrbitControls, selección, X-Ray y despiece GSAP. La UI deberá consumir resultados sin permitir que estados inválidos lleguen a la escena.
