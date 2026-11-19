# Inspección con Spector.js

## Capturas del visor

Microsoft Edge 157 sin interfaz, WebGL 2 con SwiftShader. Ventana de 1440 × 900 y canvas de 920 × 756. Ambas capturas usan la unión inicial de 59 objetos, sin selección, con todas las piezas visibles, despiece desactivado e iluminación Estudio. La cámara conserva la posición `[4.32, 2.88, 4.92]` y el objetivo `[0, 0, 0]`.

| Modo | Llamadas de dibujo de Spector.js | Comando de V-01-concrete |
|---|---:|---:|
| [Sólido](evidence/spector/solido.json.gz) | 120 | 207 |
| [X-Ray al 35 %](evidence/spector/xray.json.gz) | 120 | 459 |

El contador `CommandsSummary.draw` de ambas capturas incluye 118 `drawElements` y 2 `drawArrays`. Al agrupar por framebuffer, se observan 59 dibujos en la pasada de sombras de 2048 × 2048 y 61 en el framebuffer de pantalla. Los datos de la escena y los contadores están en [resumen.json](evidence/spector/resumen.json).

## Llamada de dibujo del concreto de viga

En ambos fotogramas, el comando marcado `V-01-concrete` de la pasada de pantalla ejecuta `drawElements(TRIANGLES, 36, UNSIGNED_SHORT, 0)`. Spector registra el buffer de índices 206 (72 bytes), `position` en el buffer 75 y `normal` en el 76 (288 bytes por buffer, tres componentes `FLOAT`, stride de 12 bytes). Ambos divisores son cero. Las llamadas observadas usan `drawElements` y `drawArrays` sin instanciación.

| Estado en la llamada | Sólido | X-Ray al 35 % |
|---|---|---|
| Prueba de profundidad | `LEQUAL` | `LEQUAL` |
| Escritura de profundidad | Activada | Desactivada |
| Blending | Desactivado | `FUNC_ADD`, `SRC_ALPHA` y `ONE_MINUS_SRC_ALPHA` para RGB |
| Uniform `opacity` | `1` | `0.3499999940395355` |

En la captura, `commands[].DrawCall.shaders[].source` contiene el GLSL ES 3.00 real de vértices y fragmentos. `DrawCall.uniforms` contiene los valores de `modelMatrix`, `modelViewMatrix`, `projectionMatrix`, `normalMatrix` y `opacity`. El mismo comando conserva `DepthState` y `BlendState`, y `DrawCall` conserva `attributes` y `elementArray`.

## Repetir la captura

Con Edge instalado, inicia Vite en `127.0.0.1:5173` con `npm run dev -- --host 127.0.0.1`. Desde otra terminal, descarga Spector.js 0.9.30 a una carpeta temporal y ejecuta el script del repositorio. Ejemplo en PowerShell:

```powershell
npm pack spectorjs@0.9.30 --pack-destination "$env:TEMP"
tar -xf "$env:TEMP/spectorjs-0.9.30.tgz" -C "$env:TEMP" package/dist/spector.bundle.js
node docs/capture-spector.mjs "$env:TEMP/package/dist/spector.bundle.js"
```

El script marca las llamadas por pieza y guarda los fotogramas de Spector como JSON comprimido. Para inspeccionar uno con la extensión de Spector.js, descomprímelo y abre el JSON en la interfaz de resultados. También puedes extraer la llamada completa, incluidos los shaders y uniforms, con Node:

```sh
node -e "const f=require('node:fs'), z=require('node:zlib'), c=JSON.parse(z.gunzipSync(f.readFileSync(process.argv[1]))); console.log(JSON.stringify(c.commands.find(x=>x.id===Number(process.argv[2])),null,2))" docs/evidence/spector/xray.json.gz 459
```
