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

El visor genera vigas, columnas y uniones parametrizadas con Three.js. Incluye selección, vistas de cámara, transparencia, despiece y comprobación de separación entre barras longitudinales. La geometría es una idealización académica.

## Recursos externos

Para probar **Importar 3D**, selecciona el cubo de Cesium incluido en [public/models/external/](public/models/external/README.md). Para probar **Importar JSON**, usa la [unión de demostración](public/models/union-demostracion.json).

## Documentación

- [Arquitectura](docs/architecture.md)
- [Geometría](docs/geometry.md)
- [Correspondencia WebGL](docs/webgl-mapping.md)
- [Decisiones técnicas](docs/technical-decisions.md)
- [Guía Spector.js](docs/spector-guide.md)
- [Guion de demostración](docs/demo-script.md)
- [Resumen académico](docs/summary.md)
