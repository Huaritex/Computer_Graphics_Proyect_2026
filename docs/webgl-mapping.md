# Correspondencia WebGL y Three.js

- **WebGL canvas:** recurso de salida administrado por `THREE.WebGLRenderer`.
- **Escena:** contenedor de objetos, luces y cámaras.
- **Camara:** muestra la escena; OrbitControls modifica su posición sin cambiar geometría.
- **Geometría:** parámetros se convierten a dimensiones de `BoxGeometry`, `CylinderGeometry` o tubos según el componente.
- **Materiales:** superficies opacas para hormigón y metálicos diferenciados para acero.
- **Buffers GPU:** Three.js carga vértices, normales e índices en buffers administrados por WebGL.
- **Transformaciones:** posición, rotación y escala se representan mediante matrices locales y mundiales.
- **Profundidad y transparencia:** X-Ray puede usar materiales transparentes y control de profundidad.
- **Raycasting:** el rayo de pantalla se proyecta sobre mallas con metadatos académicos.
