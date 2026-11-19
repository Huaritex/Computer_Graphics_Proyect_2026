# Visualizador parametrizado de estructuras 3D

Aplicación Vite + Three.js para visualizar y documentar una unión estructural parametrizada. Incluye validadores, distribución de barras, detección de proximidad y una interfaz preparada para carga de archivos GLB/GLTF mediante el navegador.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir la URL que indique Vite. Para verificar y construir:

```bash
npm test
npm run build
npm run preview
```

## Estado del proyecto

La escena principal actual es una plantilla Vite. Los módulos técnicos mínimos y las pruebas críticas están preparados, pero la integración completa de Three.js, GSAP, Raycaster y carga GLB aún no sustituye la plantilla ni constituye un modelo estructural certificado.

## Recursos externos

No se incluye ni se afirma la existencia de un GLB real. Coloque un recurso licenciado en `public/models/external/` o seleccione uno desde el cargador del futuro formulario. Véase [public/models/external/README.md](public/models/external/README.md).

## Documentación

- [Arquitectura](docs/architecture.md)
- [Geometría](docs/geometry.md)
- [Correspondencia WebGL](docs/webgl-mapping.md)
- [Decisiones técnicas](docs/technical-decisions.md)
- [Guía Spector.js](docs/spector-guide.md)
- [Guion de demostración](docs/demo-script.md)
- [Resumen académico](docs/summary.md)
