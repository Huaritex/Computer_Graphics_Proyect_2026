# Plan maestro - Visualizador Parametrico 3D

## Fase 0 - Base
- Inicializar Vite y dependencias: Three.js, GSAP, Vitest.
- Separar core, datos, geometria, estructuras, interacciones, UI y carga externa.
- Crear escena base con renderer, camara y OrbitControls.

## Fase 1 - Geometria
- Definir esquema JSON y validadores centralizados.
- Generar vigas, columnas, hormigon, barras longitudinales y estribos.
- Aplicar unidades milimetricas con conversion explicita a unidades Three.js.
- Crear escena de union ilustrativa.

## Fase 2 - Interaccion
- Implementar Raycaster y seleccion por metadatos.
- Implementar X-Ray, wireframe, visibilidad y despiece GSAP reversible.
- Agregar paneles de parametros, propiedades y advertencias.

## Fase 3 - Importacion
- Integrar GLTFLoader y carga local GLB/GLTF.
- Preparar recursos externos reales y documentar su procedencia.

## Fase 4 - Analisis
- Medir distancias minimas entre segmentos de barras.
- Detectar interferencias y separaciones inferiores al umbral.
- Mostrar pares conflictivos y permitir enfocar su ubicacion.

## Fase 5 - Validacion
- Probar validadores, distribuciones, distancias y colisiones con Vitest.
- Ejecutar build y servir la aplicacion.
- Revisar consola, regeneracion y comportamiento responsive.

## Fase 6 - Documentacion
- README, arquitectura, geometria, WebGL, decisiones, Spector.js y guion.
- Registrar limitaciones y que el analisis no certifica diseno estructural.

## Estado registrado
- [completado] Vitest instalado y scripts de prueba/build añadidos.
- [completado] Pruebas críticas de validadores, geometría y colisiones.
- [completado] Documentación académica y guion de demostración.
- [pendiente] Integración visual completa de escena, UI, GSAP y Raycaster.
- [pendiente] Recurso GLB/GLTF real licenciado.
- [pendiente] Validación numérica por un profesional estructural y contra software especializado.
