# Guía de inspección con Spector.js

Spector.js permite observar llamadas WebGL y recursos usados por el renderizador.

## Preparación

1. Instalar la extensión oficial Spector.js para el navegador usado.
2. Ejecutar `npm run dev`.
3. Abrir la herramienta de desarrollador y activar Spector.js.
4. Presionar **Capture** antes de cambiar cámara, visibilidad o X-Ray.
5. Recargar o regenerar la geometría si se desea registrar la creación de buffers.

## Qué observar

- Dibujos principales y cantidad de llamadas `drawArrays`/`drawElements`.
- Buffers de vértices, índices y atributos.
- Matrices, modos de profundidad y blending.
- Texturas y materiales asociados.
- Cambios de estado al activar wireframe o transparencias.

## Evidencia sugerida

Capturar una escena base, una selección y una vista transparente. Registrar resolución, navegador y número aproximado de draw calls sin atribuirlos a métricas no medibles.
