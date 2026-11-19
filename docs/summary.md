# Resumen académico

Este proyecto plantea un visualizador de una unión estructural parametrizada usando Vite, Three.js y Vitest. Su objetivo académico es comprender la transformación de datos estructurales a recursos gráficos, validar entradas geométricas y detectar proximidades ilustrativas entre segmentos.

La implementación disponible incluye validadores defensivos, conversión de milímetros a unidades de escena, distribución de barras longitudinales y un detector de distancia entre segmentos. La escena base todavía proviene de la plantilla Vite y no representa una unión real completa.

Las decisiones separan cálculo puro de presentación para facilitar pruebas. WebGL administra el renderizado y Three.js traduce escena, geometría y materiales a estados del pipeline. Spector.js permite inspeccionar buffers y llamadas de dibujo.

Las limitaciones principales son la ausencia de un GLB licenciado, integración visual completa, controles GSAP/Raycaster y validación normativa profesional. Los resultados no deben usarse para diseño, construcción, inspección ni certificación estructural.
