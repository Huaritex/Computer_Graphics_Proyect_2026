# Fundamentos geométricos

## Unidades

Los parámetros y las dimensiones de la ficha están en milímetros. Las fábricas convierten a metros al construir las mallas. La longitud del concreto proviene de la dimensión del elemento, la de la barra se obtiene entre los extremos del cilindro y la del estribo sigue el perímetro de su eje.

## Distribución

Las barras de la viga se reparten uniformemente en las capas superior e inferior. Una barra única se centra en su capa. En la columna, cuatro barras ocupan los vértices del rectángulo interior definido por el recubrimiento, el diámetro del estribo y el radio de la barra. Las barras adicionales se asignan al lado que conserve la mayor distancia entre centros tras incorporarlas. En caso de empate se sigue el orden perimetral desde la esquina de coordenadas locales X y Z negativas, avanzando primero en X positivo. Cada lado se subdivide uniformemente y los vértices se cuentan una sola vez.

La distribución es una convención del modelo académico. El generador exige espacio físico para los diámetros y limita cada conteo a 1000. El análisis de la escena aplica por separado el umbral configurable de separación libre entre barras.

## JSON de demostración

[`union-demostracion.json`](../public/models/union-demostracion.json) contiene datos sintéticos basados en la unión inicial del visor. Cambia el ancho de viga a 320 mm y los conteos de viga y columna para demostrar la importación. El ejemplo usa milímetros y se proporciona como dato de demostración académica.
