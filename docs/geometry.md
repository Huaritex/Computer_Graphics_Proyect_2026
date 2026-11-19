# Fundamentos geométricos

## Convención de unidades

Los parámetros académicos se expresan en milímetros. Three.js usa unidades de escena adimensionales; la conversión predeterminada utiliza `1 m = 1000 mm`, con factor configurable `0.001`.

## Sección y barras

La sección se representa como un rectángulo centrado en el origen. Los puntos longitudinales son simétricos respecto a los ejes horizontal y vertical. El recubrimiento y el diámetro deben reducir el espacio disponible para evitar barras fuera de la sección.

## Distribución

Para cuatro barras se usan las esquinas interiores. Para otras cantidades se genera una cuadrícula acotada por el centro de sección. Es una distribución ilustrativa, no una disposición normativa.

## Distancia

La detección calcula la menor distancia entre segmentos representados por dos extremos. Intersección exacta se traduce a distancia cero. El umbral mínimo es configurable.
