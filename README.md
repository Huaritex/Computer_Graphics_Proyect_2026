# Visualizador Paramétrico 3D de Estructuras de Hormigón Armado

**Proyecto Integrador — Gráficos por Computador**  
**Implementación:** JavaScript, Three.js, WebGL, Vite y GSAP  
**Rama documentada:** [`fix/visor-parametrico`](https://github.com/Huaritex/Computer_Graphics_Proyect_2026/tree/fix/visor-parametrico)

> **Alcance académico:** este programa representa de forma ilustrativa vigas, columnas y una unión viga–columna a partir de parámetros geométricos. **No calcula cargas, esfuerzos, resistencias, deformaciones ni verifica normas de diseño estructural.** Sus avisos de proximidad son comprobaciones geométricas limitadas y no certifican la seguridad de una estructura.

## Índice

1. [Problema y objetivo](#1-problema-y-objetivo)
2. [Qué permite hacer la aplicación](#2-qué-permite-hacer-la-aplicación)
3. [Cómo ejecutarla](#3-cómo-ejecutarla)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Arquitectura y flujo de datos](#5-arquitectura-y-flujo-de-datos)
6. [Modelo de datos y JSON](#6-modelo-de-datos-y-json)
7. [Geometría procedural y fundamentos matemáticos](#7-geometría-procedural-y-fundamentos-matemáticos)
8. [Escena, cámara y transformaciones](#8-escena-cámara-y-transformaciones)
9. [Materiales, iluminación y renderizado](#9-materiales-iluminación-y-renderizado)
10. [Interacción gráfica](#10-interacción-gráfica)
11. [Análisis de proximidad geométrica](#11-análisis-de-proximidad-geométrica)
12. [Carga de modelos GLB/GLTF](#12-carga-de-modelos-glbgltf)
13. [Three.js frente a WebGL nativo](#13-threejs-frente-a-webgl-nativo)
14. [Auditoría gráfica con Spector.js](#14-auditoría-gráfica-con-spectorjs)
15. [Pruebas, evidencia y documentación](#15-pruebas-evidencia-y-documentación)
16. [Relación con los temas de la asignatura](#16-relación-con-los-temas-de-la-asignatura)
17. [Alcances, limitaciones y conclusiones](#17-alcances-limitaciones-y-conclusiones)
18. [Referencias y material de apoyo](#18-referencias-y-material-de-apoyo)

## 1. Problema y objetivo

Los planos estructurales bidimensionales representan las dimensiones del hormigón y la distribución de las armaduras mediante vistas, cortes y anotaciones. Interpretar su disposición espacial exige relacionar distintas proyecciones 2D. La investigación de campo con un profesional de Ingeniería Civil motivó el estudio de una **representación 3D paramétrica e interactiva** como complemento visual para explorar esos datos.

**Objetivo general:** desarrollar una aplicación de gráficos por computador que transforme parámetros geométricos de elementos de hormigón armado en mallas 3D y permita inspeccionar visualmente su composición y configuración.

El énfasis de la asignatura no es el cálculo estructural, sino la cadena:

```text
Información técnica y parámetros
            ↓
     Lectura / validación
            ↓
 Cálculo de posiciones y tamaños
            ↓
 Generación de geometría procedural
            ↓
  Escena 3D, materiales y cámara
            ↓
  Three.js → WebGL → GPU → píxeles
            ↑
 Selección, navegación y animación
```

### ¿Por qué es un proyecto de Gráficos por Computador?

Porque la aplicación resuelve problemas propios de la disciplina: representación geométrica en coordenadas tridimensionales; creación algorítmica de primitivas y mallas; aplicación de transformaciones; proyección de una escena a una imagen 2D; iluminación y sombreado; gestión de profundidad y transparencia; selección espacial mediante rayos; y actualización/animación de objetos renderizados por la GPU.

## 2. Qué permite hacer la aplicación

| Función | Comportamiento observable | Fundamento gráfico |
|---|---|---|
| Generar viga, columna o unión | Crea el hormigón y su armado a partir de medidas y cantidades | Geometría procedural, coordenadas 3D, jerarquía de escena |
| Modificar parámetros | El usuario cambia dimensiones y armado y pulsa **Generar modelo** | Regeneración de geometría; validación antes del render |
| Navegar por la escena | Rotación, zoom y vistas predeterminadas | Cámara en perspectiva, matriz de vista y de proyección |
| Seleccionar piezas | Clic sobre mallas o elementos de la jerarquía | `THREE.Raycaster` e intersección rayo–malla |
| Inspeccionar propiedades | Muestra identificadores, dimensiones y datos del componente | Metadatos asociados al grafo de escena |
| Sólido, X-Ray y malla | Cambia el modo de representación | Materiales, transparencia, profundidad y wireframe |
| Ocultar / mostrar | Controla la visibilidad de componentes | Estado y recorrido del grafo de escena |
| Despiece | Separa temporalmente piezas y las devuelve a su lugar | Transformaciones y animación interpolada con GSAP |
| Advertencias de separación | Señala pares de barras longitudinales demasiado cercanas | Distancias entre segmentos en espacio 3D |
| Importar / exportar JSON | Intercambia parámetros y preferencias del visor | Serialización de datos de entrada |
| Importar GLB/GLTF | Muestra un modelo 3D externo cargado por el usuario | Decodificación de assets y creación de mallas |

**Nota sobre el GLB importado:** la implementación actual sustituye la escena del modelo al importar un archivo externo. No se presenta como una superposición permanente del asset con la unión estructural.

## 3. Cómo ejecutarla

### Requisitos

- Node.js y npm compatibles con las dependencias declaradas en `package.json` (en particular, Vite 8).
- Navegador moderno con soporte WebGL y aceleración gráfica disponible.

```bash
git clone https://github.com/Huaritex/Computer_Graphics_Proyect_2026.git
cd Computer_Graphics_Proyect_2026
git checkout fix/visor-parametrico
npm install
npm run dev
```

Abrir la dirección local que muestra Vite en la terminal.

| Comando | Propósito |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Compilación para distribución |
| `npm run preview` | Previsualización del build |
| `npm test` | Suite unitaria con Vitest |
| `npm run check` | Ejecuta pruebas unitarias y compilación |
| `npm run test:e2e` | Suite de extremo a extremo con Playwright |
| `npm run test:e2e:ui` | Interfaz de Playwright para pruebas E2E |

Para ensayar entradas disponibles, puede importarse [`public/models/union-demostracion.json`](public/models/union-demostracion.json); para probar el importador 3D está [`public/models/external/Box.glb`](public/models/external/Box.glb). El segundo es un cubo de prueba, no una estructura real.

## 4. Estructura del repositorio

La organización separa *datos*, *cálculos*, *construcción de geometría*, *renderizado*, *interacciones*, *interfaz* y *pruebas*. Esta separación permite razonar sobre el pipeline gráfico y probar reglas geométricas de manera independiente del navegador.

```text
Computer_Graphics_Proyect_2026/
├── index.html                   # Documento HTML y punto de montaje
├── package.json                 # Dependencias y scripts
├── package-lock.json            # Versiones resueltas
├── vitest.config.js             # Configuración de pruebas unitarias
├── playwright.config.js         # Configuración de pruebas E2E
├── README.md                    # Documento principal del proyecto
├── plan.md                      # Plan y registro histórico de trabajo
├── public/
│   ├── models/
│   │   ├── union-demostracion.json
│   │   └── external/
│   │       ├── Box.glb
│   │       └── README.md        # Procedencia, licencia y hash del asset
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.js                  # Inicio de la aplicación
│   ├── index.js                 # Exportaciones de módulos reutilizables
│   ├── style.css                # Presentación y responsive
│   ├── app/
│   │   ├── App.js               # Orquestación general
│   │   └── AppState.js          # Estado observable del visor
│   ├── config/
│   │   ├── constants.js         # Constantes, colores y conversión mm→m
│   │   └── defaults.js          # Parámetros de ejemplo
│   ├── data/
│   │   ├── structuralSchema.js  # Esquema descriptivo de modelos
│   │   ├── viewerJSON.js        # Interpretación de JSON importado
│   │   ├── examples/             # Recursos de ejemplo
│   │   └── validators/           # Validación de modelos e inputs
│   ├── core/
│   │   ├── SceneManager.js      # Grafo de escena y grupos
│   │   ├── CameraManager.js     # Cámara, OrbitControls y presets
│   │   ├── RendererManager.js   # WebGLRenderer, sombras y salida de color
│   │   ├── LightingManager.js   # Luces y presets de iluminación
│   │   ├── ResourceManager.js   # Seguimiento de recursos
│   │   ├── CollisionDetector.js # Utilidad geométrica de segmentos
│   │   └── geometry.js          # Operaciones geométricas auxiliares
│   ├── geometry/
│   │   ├── BeamGenerator.js     # Ensamblaje paramétrico de una viga
│   │   ├── ColumnGenerator.js   # Ensamblaje paramétrico de una columna
│   │   ├── JointGenerator.js    # Composición viga–columna
│   │   ├── ConcreteFactory.js   # Geometría del volumen de hormigón
│   │   ├── RebarFactory.js      # Cilindros de armadura longitudinal
│   │   ├── StirrupFactory.js    # Estribos basados en trayectorias
│   │   └── GeometryUtils.js     # Escalas, alineación y metadatos
│   ├── structural/
│   │   ├── ParameterProcessor.js    # Valores por defecto y normalización
│   │   ├── columnBarLayout.js       # Distribución perimetral de barras
│   │   ├── ReinforcementLayout.js   # Utilidades de disposición geométrica
│   │   ├── CollisionDetector.js     # Distancias entre barras de la escena
│   │   └── ClearanceChecker.js      # Verificaciones auxiliares
│   ├── interactions/
│   │   ├── CameraInteraction.js # Transiciones de orientación y enfoque
│   │   ├── SelectionManager.js  # Picking con Raycaster y resaltado
│   │   ├── VisibilityManager.js # Ocultar/restaurar componentes
│   │   ├── XRayManager.js       # Materiales transparentes y wireframe
│   │   └── ExplodedViewManager.js # Despiece animado con GSAP
│   ├── loaders/
│   │   └── ModelLoader.js       # Lectura de GLB/GLTF con GLTFLoader
│   ├── ui/
│   │   ├── UIController.js      # Armado y eventos de interfaz
│   │   ├── ParameterPanel.js    # Formulario de parámetros y modos
│   │   ├── PropertiesPanel.js   # Jerarquía e inspección de piezas
│   │   ├── SceneToolbar.js      # Herramientas de escena/importación
│   │   └── ValidationPanel.js   # Estado y advertencias
│   ├── validators/
│   │   ├── inputValidator.js    # Validadores auxiliares
│   │   └── geometryValidator.js # Validación geométrica auxiliar
│   └── counter.js               # Archivo residual de plantilla
├── tests/
│   ├── unit/                    # Pruebas de cálculos, validadores, escena
│   └── e2e/                     # Flujos completos con Playwright
└── docs/
    ├── architecture.md          # Documento complementario de arquitectura
    ├── geometry.md              # Convenciones geométricas
    ├── webgl-mapping.md         # Correspondencias conceptuales WebGL
    ├── technical-decisions.md   # Decisiones y limitaciones
    ├── demo-script.md           # Guion preliminar de demostración
    ├── summary.md               # Resumen académico histórico
    ├── spector-guide.md         # Auditoría detallada de fotogramas
    ├── capture-spector.mjs      # Script de captura
    └── evidence/
        ├── viga-lienzo.png
        └── spector/
            ├── resumen.json
            ├── solido.json.gz
            └── xray.json.gz
```

**Aclaración:** algunos archivos auxiliares o documentos históricos reflejan etapas previas del desarrollo. Para explicar el comportamiento actual de la interfaz, la fuente principal es `src/app/App.js` junto con sus módulos importados. La presencia de un módulo auxiliar no implica que se utilice en todos los flujos.

### Responsabilidades principales

| Capa | Archivos clave | Pregunta que resuelve |
|---|---|---|
| Datos | `viewerJSON.js`, `defaults.js`, validadores | ¿Los parámetros son interpretables? |
| Geometría | `BeamGenerator`, `RebarFactory`, `StirrupFactory` | ¿Qué vértices, tamaños y posiciones representan esos datos? |
| Escena | `SceneManager`, `CameraManager` | ¿Cómo se organizan y observan los objetos? |
| Renderizado | `RendererManager`, `LightingManager` | ¿Cómo se dibujan con material, luz y profundidad? |
| Interacciones | `SelectionManager`, `XRayManager`, `ExplodedViewManager` | ¿Cómo explora el usuario la escena? |
| Análisis | `structural/CollisionDetector.js` | ¿Qué barras tienen separaciones libres bajo el umbral? |
| Presentación | `UIController`, paneles | ¿Cómo se introducen datos y se muestran resultados? |

## 5. Arquitectura y flujo de datos

### Arranque

`src/main.js` crea `new App(...)` y llama a `init()`. La aplicación inicializa los paneles, la escena, el `WebGLRenderer`, la cámara, las luces y los manejadores de interacción; después carga una unión de ejemplo y comienza el bucle de renderizado.

### Generación de un elemento

1. El usuario elige **Viga**, **Columna** o **Unión viga-columna** y modifica los campos del panel.
2. `ParameterPanel.js` recopila y convierte sus valores a números.
3. `App.generateModel()` valida la entrada mediante `src/data/validators/inputValidator.js`.
4. `SceneManager.buildStructural()` delega en `BeamGenerator`, `ColumnGenerator` o `JointGenerator`.
5. Los generadores crean y agrupan mallas de hormigón, barras y estribos.
6. `SceneManager` incorpora el conjunto al grafo de escena y ajusta su encuadre.
7. Se aplican materiales, estados de visualización y advertencias geométricas.
8. En cada fotograma `WebGLRenderer.render(scene, camera)` procesa el contenido visible.

**Cambio paramétrico:** la entrada modifica el modelo al pulsar **Generar modelo**. No se debe confundir con una simulación física continua.

### Bucle de renderizado

El método `App.animate()` solicita un nuevo fotograma con `requestAnimationFrame`, actualiza `OrbitControls` y llama al renderizador. Se reutiliza la escena retenida entre fotogramas; no se genera de nuevo toda la geometría en cada cuadro. Las geometrías se reconstruyen al generar un nuevo modelo.

## 6. Modelo de datos y JSON

Las dimensiones técnicas se expresan en **milímetros (mm)**; al crear las mallas se convierten a **metros (m)** para conservar una escala coherente en el entorno de Three.js.

| Parámetro | Significado | En la geometría |
|---|---|---|
| `width` | Ancho de sección, mm | Dimensión transversal |
| `depth` | Profundidad / peralte, mm | Dimensión de sección |
| `length` | Longitud de viga, mm | Extensión del eje longitudinal de viga |
| `height` | Altura de columna, mm | Extensión vertical de columna |
| `cover` | Recubrimiento nominal, mm | Desplazamiento interior del acero |
| `rebar.diameter` | Diámetro longitudinal, mm | Radio del cilindro de barra |
| `rebar.topCount`, `bottomCount` | Conteos por capa de viga | Distribución de barras superiores e inferiores |
| `rebar.longitudinalCount` | Conteo longitudinal en columna | Distribución perimetral |
| `stirrup.diameter` | Diámetro del estribo, mm | Grosor de su tubo |
| `stirrup.spacing` | Paso longitudinal de estribos, mm | Posición y cantidad de repeticiones |

Ejemplo **compatible con la importación directa de un elemento**:

```json
{
  "id": "V-01",
  "type": "beam",
  "units": "mm",
  "width": 300,
  "depth": 500,
  "length": 4000,
  "cover": 40,
  "rebar": {
    "diameter": 16,
    "topCount": 3,
    "bottomCount": 3
  },
  "stirrup": {
    "diameter": 10,
    "spacing": 150
  }
}
```

El importador también admite archivos exportados por el propio visor con propiedades de `state` y `model`. Los JSON pasan por comprobaciones de estructura y rango antes de sustituir la escena: por ejemplo, se rechazan valores numéricos no válidos y cantidades de barras que no caben geométricamente en la sección.

Para la unión, el objeto contiene una `beam` y una `column` (consultar [`union-demostracion.json`](public/models/union-demostracion.json)).

## 7. Geometría procedural y fundamentos matemáticos

### 7.1 Generación algorítmica

La idea central de los **métodos procedurales** consiste en definir reglas de construcción y unos pocos parámetros, en vez de almacenar manualmente todas las posiciones de cada pieza. Esto corresponde directamente al capítulo *Métodos procedurales* de la asignatura.

- **Hormigón:** `ConcreteFactory` utiliza `THREE.BoxGeometry` para formar prismas rectangulares, cambiando sus dimensiones según el elemento.
- **Barras longitudinales:** `RebarFactory.createBar()` usa `THREE.CylinderGeometry`. Los extremos determinan longitud, orientación y posición del cilindro.
- **Estribos:** `StirrupFactory` define una trayectoria rectangular cerrada con `THREE.CurvePath` y segmentos `THREE.LineCurve3`; `THREE.TubeGeometry` genera la superficie tubular a lo largo de ella.
- **Unión:** `JointGenerator` compone los subgrupos viga y columna y traslada la viga para situarla respecto de la columna. Es una **composición geométrica ilustrativa**, no un modelo de detalle constructivo completo del nudo.

Las primitivas de Three.js producen geometría con atributos de vértice (por ejemplo, posición y normal), caras trianguladas e índices cuando corresponda. El renderer transforma esa representación en buffers y llamadas gráficas subyacentes.

### 7.2 Conversión de unidades

La regla aplicada en el proyecto es:

\[
L_{\mathrm{escena}}=L_{\mathrm{mm}}\times 0.001
\]

Ejemplo: `4000 mm → 4 m` de longitud de una viga. Esta conversión se concentra en utilidades como `mmToScene()` y en las fábricas geométricas.

### 7.3 Vectores, extremos y cilindros

Si una barra tiene extremos `A` y `B`, su dirección es `d = B − A`, longitud `||d||` y centro `C = (A + B)/2`. La aplicación utiliza esos resultados para construir un cilindro de la longitud necesaria y alinearlo con la dirección de la barra (`alignCylinderAlong`, `GeometryUtils.js`).

Esta transformación aplica las matemáticas del curso: **puntos, vectores, resta de posiciones, norma, rotaciones y sistemas de coordenadas**.

### 7.4 Distribución de barras

En las vigas se distinguen capas superior e inferior. Para una capa de `n` barras, el parámetro de interpolación es `t = i/(n−1)` si `n > 1`; si hay una única barra, se utiliza `t = 0.5` para centrarla. Las posiciones se reparten en el ancho interior disponible, considerando recubrimiento y diámetros.

En columnas, `columnBarLayout.js` comienza con cuatro barras en las esquinas de un rectángulo interior y distribuye barras adicionales por sus lados. Es una **convención algorítmica educativa**, no una regla universal de detallado estructural.

### 7.5 Repetición de estribos

`StirrupFactory.js` calcula un conteo con el largo disponible, recubrimiento, diámetro y paso `s`:

\[
N=\max\left(1,\left\lfloor\frac{L-2c-d_e}{s}\right\rfloor+1\right)
\]

Aquí `L` es longitud de viga o altura de columna, `c` recubrimiento y `d_e` diámetro de estribo, todos en mm. Para cada `i` desde `0` hasta `N−1`, el estribo se coloca en la posición longitudinal calculada a partir del borde inicial y del paso. El código usa un paso **uniforme**, sin zonas de separación diferenciada.

### 7.6 Topología y reutilización

Las piezas se organizan en `THREE.Group`, separando concreto, barras y estribos. Así cada malla conserva su propia transformación y material y puede seleccionarse, ocultarse o animarse de forma individual. El despiece mueve objetos existentes; no requiere recalcular sus vértices.

## 8. Escena, cámara y transformaciones

### Grafo de escena

`SceneManager` crea `THREE.Scene`, un grupo raíz `modelRoot`, una cuadrícula y ejes de orientación. Los generadores incorporan subgrupos y mallas al modelo. Las transformaciones de un hijo se componen con las de su padre, como se estudia en las **transformaciones jerárquicas**.

### Coordenadas

En Three.js se utiliza el espacio tridimensional `X, Y, Z`. En el visor:

- La **viga** se extiende principalmente sobre `X`.
- La **columna** se extiende principalmente sobre `Y`.
- `Z` constituye el segundo eje transversal.

La posición de un vértice pasa por espacios local, mundial, cámara y recorte antes de convertirse en posición de pantalla.

### Cámara en perspectiva

`CameraManager` configura `THREE.PerspectiveCamera(38, aspect, 0.01, 1000)` y `OrbitControls`. Al redimensionarse el visor se actualiza `camera.aspect` y su matriz de proyección. Las vistas predefinidas incluyen perspectiva, superior, frontal y derecha.

En términos del pipeline:

\[
\mathbf{p}_{clip}=\mathbf{P}\,\mathbf{V}\,\mathbf{M}\,\mathbf{p}_{local}
\]

- **M**: transformación del objeto (model matrix).
- **V**: transformación del mundo al sistema de cámara (view matrix).
- **P**: proyección de cámara (projection matrix).

La división por la coordenada homogénea transforma las posiciones de clip al espacio normalizado; después se aplica la transformación de viewport. Three.js administra estas matrices internamente, pero sus efectos se observan al mover la cámara y los objetos.

## 9. Materiales, iluminación y renderizado

### Materiales de superficie

`ConcreteFactory`, `RebarFactory` y `StirrupFactory` crean materiales `THREE.MeshStandardMaterial`. Estos materiales tienen propiedades como color, `roughness` y, para el acero, `metalness`. Permiten diferenciar visualmente el hormigón y las armaduras por su respuesta a la luz.

`MeshStandardMaterial` utiliza el sistema de materiales estándar de Three.js; **no significa que el equipo haya programado manualmente los shaders**. Three.js genera/ensambla los programas GLSL que emplea el renderer, aspecto que se puede estudiar con Spector.js.

### Luces y sombras

`LightingManager` configura una luz hemisférica y dos luces direccionales. La principal proyecta sombras; sus valores cambian mediante los presets **Estudio**, **Exterior** y **Tenue**. Las fuentes permiten observar volumen, orientación de superficies y diferencias de material.

`RendererManager` configura:

```js
new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
```

El resultado pasa por operaciones de sombreado, profundidad, composición y transformación de color antes de mostrarse en pantalla.

### Profundidad, transparencia y wireframe

- En modo **sólido**, las superficies de hormigón y acero se visualizan con sus materiales habituales.
- En modo **X-Ray**, `XRayManager` clona el material del hormigón, ajusta `transparent`, `opacity` y `depthWrite`, y mantiene visibles las armaduras para explorar el interior.
- En modo **wireframe**, modifica `material.wireframe` para mostrar la estructura de aristas de las mallas.

La transparencia del visor es un **efecto de composición alfa**; no se está simulando refracción física del hormigón ni usando ray tracing. Asimismo, el renderizado observado utiliza el **pipeline rasterizado de WebGL**, no path tracing, iluminación global ni simulación física.

### Texturizado: relación con la asignatura

Las clases estudian texeles, coordenadas UV, buffers de textura y muestreo en fragment shaders. El visor puede cargar assets glTF que contengan materiales y recursos gráficos, pero la geometría estructural generada internamente usa principalmente **materiales por color y propiedades de superficie**, no un sistema propio de mapeo de imágenes UV. Es útil mencionar la diferencia para no atribuir al proyecto un texturizado avanzado que no implementa.

## 10. Interacción gráfica

### Selección por rayo (picking)

`SelectionManager` convierte la posición del puntero a coordenadas normalizadas del dispositivo (NDC):

\[
x_{ndc}=2\frac{x-x_0}{w}-1,\qquad
 y_{ndc}=1-2\frac{y-y_0}{h}
\]

Con ellas configura `THREE.Raycaster.setFromCamera()` y calcula intersecciones contra las mallas visibles del modelo. La primera intersección identifica la pieza seleccionada. La selección resalta temporalmente su material, registra la pieza y actualiza el inspector de propiedades.

**Importante:** el raycasting para seleccionar objetos **no equivale al algoritmo de ray tracing para renderizar reflejos y refracciones** explicado en Renderizado avanzado: ambos usan rayos, pero tienen objetivos distintos.

### Navegación, jerarquía y visibilidad

`OrbitControls` permite navegar alrededor de la escena. La jerarquía en el panel derecho refleja los grupos y mallas del modelo; `VisibilityManager` permite ocultar piezas y restablecer su visibilidad.

### Despiece (*Exploded View*)

`ExplodedViewManager` almacena las posiciones originales de las mallas y calcula una dirección de desplazamiento respecto del centro del conjunto. GSAP interpola las posiciones durante la animación (`power2.inOut`), y al desactivar el modo las piezas vuelven a su lugar. Es un ejemplo directo de **animación geométrica mediante transformaciones espaciales**.

No se simulan fuerzas, masa, gravedad ni mecánica del proceso constructivo: el despiece es una operación visual.

## 11. Análisis de proximidad geométrica

`App.updateWarnings()` reúne las mallas del modelo y utiliza `src/structural/CollisionDetector.js` para analizar pares de **barras longitudinales**. El algoritmo estima la distancia mínima entre sus segmentos centrales y descuenta los radios para obtener una separación libre aproximada:

\[
d_{libre}=d_{ejes}-r_1-r_2
\]

Según el resultado, el programa identifica **interferencia geométrica** (`d_libre < 0`) o una distancia menor/igual al umbral configurado. También coloca marcadores gráficos en puntos aproximados de conflicto y permite orientar la cámara hacia ellos.

Es una utilidad de **geometría computacional**; no contempla toda la geometría del armado ni sustituye revisión de anclajes, empalmes, tolerancias, requisitos normativos o ingeniería estructural.

## 12. Carga de modelos GLB/GLTF

`ModelLoader.js` utiliza `GLTFLoader` de Three.js para importar modelos externos seleccionados por el usuario. Se admite un `.glb` autocontenido o un `.gltf` acompañado de recursos como `.bin` o imágenes cuando correspondan. El modelo cargado se incorpora al grafo de escena y recibe propiedades para selección y representación.

**Demostración incluida:** [`Box.glb`](public/models/external/Box.glb), asset de muestra de Cesium recogido del repositorio de Khronos. Su procedencia, atribución y licencia CC BY 4.0 están documentadas en [`public/models/external/README.md`](public/models/external/README.md).

**Limitación actual:** cargar un GLB/GLTF reemplaza el modelo existente y no fusiona automáticamente un asset de contexto con la viga/columna paramétrica. No se interpreta un archivo glTF como si fueran automáticamente datos estructurales.

## 13. Three.js frente a WebGL nativo

El proyecto utiliza una biblioteca de alto nivel, pero el resultado se ejecuta sobre WebGL. La siguiente tabla explica **abstracciones equivalentes a nivel conceptual**, no fragmentos de código WebGL implementados manualmente en este repositorio.

| Código o concepto en Three.js | Concepto subyacente en WebGL nativo |
|---|---|
| `new THREE.WebGLRenderer()` | Contexto WebGL, estado del render y control del framebuffer |
| `new THREE.BoxGeometry(...)` | Atributos de vértices, índices y buffers GPU |
| `new THREE.CylinderGeometry(...)` | Triangulación y posiciones/normales cargadas como buffers |
| `new THREE.Mesh(geometry, material)` | Asociación entre buffers, programa de shaders y parámetros |
| `MeshStandardMaterial` | Shaders GLSL, uniformes, iluminación y estado gráfico |
| `PerspectiveCamera` y transformaciones de objetos | Matrices de modelo, vista y proyección enviadas como uniformes |
| `material.transparent / opacity` | Blending y control de escritura de profundidad (`gl.depthMask`) |
| `material.wireframe` | Representación de aristas de la geometría |
| `renderer.render(scene, camera)` | Secuencia de estado, selección de programa y `gl.drawElements` / `gl.drawArrays` |

### Ejemplo de translación: geometría

**Código de alto nivel utilizado por el proyecto:**

```js
const geometry = new THREE.BoxGeometry(length, depth, width);
const mesh = new THREE.Mesh(geometry, material);
```

**Conceptualmente, un programa WebGL nativo debe:**

```js
// Pseudocódigo ilustrativo, NO extraído del repositorio
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
// Configurar atributos; crear/enlazar índices si corresponde;
// activar shaders, pasar matrices y ejecutar el draw.
```

### Ejemplo de translación: transparencia

**Nivel Three.js (`XRayManager.js`):**

```js
material.transparent = true;
material.opacity = 0.35;
material.depthWrite = false;
```

**Estado análogo que se estudia en WebGL nativo:**

```js
// Equivalencia didáctica: no es código que ejecute la aplicación
 gl.enable(gl.BLEND);
 gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
 gl.depthMask(false);
 // El fragment shader suministra alfa = 0.35.
```

Para una translación formal completa se deben explicar también los buffers de índices, atributos, shader de vértices, shader de fragmentos, `modelViewMatrix`, `projectionMatrix` y el orden de renderizado. Este README contextualiza esa retroingeniería; el **Códice de Translación** solicitado en la Fase 3 debe desarrollarse como documento independiente de dos columnas.

## 14. Auditoría gráfica con Spector.js

Una parte importante de la Fase 3 es observar **qué ejecutó WebGL realmente**, no solo qué métodos se llamaron en Three.js.

Se incluyen archivos de captura en [`docs/evidence/spector/`](docs/evidence/spector/) y una explicación extensa en [`docs/spector-guide.md`](docs/spector-guide.md). La evidencia registra una unión inicial con 59 objetos y dos configuraciones: sólido y X-Ray con opacidad del 35 %.

| Métrica registrada | Sólido | X-Ray 35 % |
|---|---:|---:|
| Llamadas de dibujo | 120 | 120 |
| `drawElements` | 118 | 118 |
| `drawArrays` | 2 | 2 |
| Triángulos contabilizados | 147 408 | 147 408 |

Las capturas incluyen una pasada de sombras y otra de pantalla. En la llamada de pantalla de `V-01-concrete`, el comando usa `drawElements(TRIANGLES, 36, UNSIGNED_SHORT, 0)`. Al activar X-Ray, la evidencia muestra cambios de **blending, escritura de profundidad y opacidad**, aunque el número de draw calls registrados se conserva.

**Interpretación gráfica:** transparencia y geometría no son lo mismo. Es posible alterar la apariencia en el fragment shader y el estado de composición sin reconstruir la malla ni reducir la cantidad de draw calls. La captura también permite localizar GLSL y uniformes como `modelMatrix`, `modelViewMatrix`, `projectionMatrix` y `normalMatrix`.

La evidencia procede de la configuración documentada en `docs/spector-guide.md`; son valores de esa captura concreta, no un benchmark universal del programa. Además, las llamadas documentadas **no usan instanciación**, por lo que no debe afirmarse que el visor optimiza automáticamente todas las repeticiones con `InstancedMesh`.

## 15. Pruebas, evidencia y documentación

### Verificación automatizada

- **Vitest (`tests/unit/`)**: validación de parámetros, operaciones geométricas, distribución de armaduras, colisiones y cambios de material X-Ray.
- **Playwright (`tests/e2e/`)**: carga del visor, canvas y paneles, generación de elementos, cambios de vista, importación/exportación JSON, selección, X-Ray, despiece, importación GLB/GLTF y visualización en viewport móvil.

El repositorio contiene las **pruebas** y archivos de evidencia. Para afirmar que pasan en un equipo concreto deben ejecutarse los comandos de la sección 3; el contenido de este README no sustituye esa ejecución.

### Documentos complementarios

- [`docs/geometry.md`](docs/geometry.md): unidades y convenciones de distribución.
- [`docs/technical-decisions.md`](docs/technical-decisions.md): selección de tecnologías y límites.
- [`docs/webgl-mapping.md`](docs/webgl-mapping.md): relación conceptual Three.js/WebGL.
- [`docs/spector-guide.md`](docs/spector-guide.md): fotogramas auditados, shaders, estados y procedimiento de captura.
- [`docs/demo-script.md`](docs/demo-script.md): recorrido sugerido de demostración.
- [`docs/evidence/viga-lienzo.png`](docs/evidence/viga-lienzo.png): evidencia visual del visor.

## 16. Relación con los temas de la asignatura

Los siguientes vínculos utilizan el material de clase proporcionado para interpretar **qué principios están presentes en el código** y cuáles se estudian solo como contexto.

| Material de clase | Concepto | Aplicación o relación en el proyecto |
|---|---|---|
| **CAP 3 — Programación de gráficos** | Geometría, buffers, modelo retenido, pipeline programable | Mallas conservadas en el grafo de escena, actualizadas al cambiar datos; Three.js abstrae WebGL |
| **Tema 4 — Matemáticas en computación gráfica** | Puntos, vectores, coordenadas, distancias, matrices y transformaciones | Cálculo de barras, orientación de cilindros, cámara, proyección, despiece y jerarquía |
| **Tema 7 — Métodos procedurales** | Generación algorítmica a partir de reglas y parámetros | Construcción de vigas, columnas y series de estribos mediante fábricas de geometría |
| **Lección 6 — Iluminación y sombreado** | Fuentes de luz, normales, reflexión difusa y especular, sombreado | Luces hemisférica/direccionales, `MeshStandardMaterial`, sombras y presets |
| **Lección 6 — Texturizado** | Color/depth buffers, texeles, UV y muestreo | Profundidad y composición de la escena; texturas UV propias no son el eje de los modelos generados |
| **Tema 8 — Renderizado avanzado** | Render pipeline, límites de iluminación local, rayos y composición | Diferenciar rasterización, raycasting de selección y técnicas de ray tracing **no implementadas** |
| **T1 — Componentes modernos para gráficos** | CPU/GPU, ejecución paralela y pipeline gráfico | CPU calcula datos y geometría; Three.js/WebGL gestionan el envío y render de primitivas en GPU |

### Qué ejecuta la CPU y qué hace la GPU

**CPU (JavaScript):** valida JSON, determina posiciones, cuenta barras/estribos, crea grupos, gestiona eventos, calcula proximidades y actualiza transformaciones.  
**GPU (WebGL):** procesa atributos de vértice, transformaciones, rasterización de triángulos, cálculos de sombreado y composición en el framebuffer según el pipeline y los shaders activos.

Esta división no implica que la GPU ejecute los cálculos de ingeniería civil: los análisis de separación observados se realizan en la lógica JavaScript del proyecto.

## 17. Alcances, limitaciones y conclusiones

### Alcances confirmados en el código

- Representación paramétrica de **vigas, columnas y uniones ilustrativas**.
- Geometría procedural de concreto y acero longitudinal/transversal.
- Escena navegable, selección de mallas, inspector y control de visibilidad.
- Modos sólido, X-Ray y wireframe.
- Despiece animado con transformaciones GSAP.
- Importación/exportación de configuración JSON e importación de modelos GLB/GLTF.
- Comprobación aproximada de separación entre barras longitudinales y visualización de avisos.
- Evidencia de capturas WebGL/Spector.js y suites de pruebas incluidas en el repositorio.

### Límites importantes

1. **No es un sistema de cálculo estructural ni una certificación BIM normativa.** La representación es visual y académica.
2. **Los parámetros no describen todos los detalles constructivos:** los estribos siguen separación uniforme y no se generan todos los ganchos, anclajes y empalmes de un armado profesional.
3. **Las comprobaciones no cubren todos los tipos de colisión** ni sustituyen la validación del ingeniero civil.
4. **La importación de GLB/GLTF reemplaza la escena actual**, no incrusta automáticamente apoyos u otros assets junto al modelo paramétrico.
5. **El pipeline no utiliza ray tracing ni simulación física.** El picking usa raycaster y el modo X-Ray usa transparencia alfa.
6. **Los shaders GLSL y los draw calls los organiza Three.js/WebGL**: el código propio no contiene una implementación independiente del renderizador de bajo nivel.

### Conclusión académica

El proyecto demuestra la traducción de **información numérica y geométrica** en una **representación tridimensional interactiva**. Mediante métodos procedurales, jerarquías de escena, transformaciones, iluminación, materiales y técnicas de inspección, conecta una problemática de interpretación de planos de Ingeniería Civil con los principios del pipeline moderno de Gráficos por Computador. La auditoría de Spector.js permite recorrer el nivel de abstracción desde las APIs de Three.js hasta las llamadas y estados efectivos de WebGL.

## 18. Referencias y material de apoyo

**Repositorio y documentos del proyecto**

- [Rama `fix/visor-parametrico`](https://github.com/Huaritex/Computer_Graphics_Proyect_2026/tree/fix/visor-parametrico).
- [`docs/spector-guide.md`](docs/spector-guide.md) y capturas asociadas.
- [`docs/geometry.md`](docs/geometry.md) y [`docs/technical-decisions.md`](docs/technical-decisions.md).
- [Procedencia y licencia de `Box.glb`](public/models/external/README.md).

**Material de la asignatura consultado** (proporcionado por el curso)

- *CAP 3. Programación de gráficos*.
- *TEMA 4. Matemáticas en computación gráfica*.
- *T1. Componentes modernos para gráficos*.
- *Lección 6. Iluminación y Sombreado*.
- *LECCIÓN 6. Texturizado*.
- *Capítulo 7. Métodos procedurales*.
- *Capítulo 8. Renderizado avanzado*.

**Documentación de herramientas**

- [Three.js Documentation](https://threejs.org/docs/).
- [WebGL — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API).
- [glTF — Khronos Group](https://www.khronos.org/gltf/).
- [Spector.js](https://spector.babylonjs.com/).
- [GSAP](https://gsap.com/).

---

*Documento técnico del Proyecto Integrador de Gráficos por Computador. Basado en el código revisado de la rama `fix/visor-parametrico` y el material de clase suministrado. Las equivalencias de WebGL de la sección 13 son explicaciones académicas, no funciones implementadas explícitamente en WebGL nativo.*
