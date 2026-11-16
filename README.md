# SIGIL FORGE

Me gustan los diagramas que parecen estar a medio camino entre un grimorio y una placa madre. Sigil Forge salió de esa mezcla: una pequeña app para convertir palabras en sigilos y quedarse un rato probando formas.

La idea es trabajar con referencias reales y dejar espacio para la libertad artística. Algunas construcciones siguen tablas históricas; otras mezclan esas bases con geometría propia. Las fuentes están en [SOURCES.md](SOURCES.md), por si quieres seguir tirando del hilo.

Visualmente es parte de **ALCHEMICAL FIRMWARE**. Hay fósforo ámbar, rojo y bastante carga CRT en los márgenes. Si te distrae, puedes apagar la atmósfera y seguir trabajando con el sigilo.

## Qué hay por ahora

- **Cuadrados planetarios:** las siete matrices, de Saturno a la Luna. Escribes algo y puedes ver el recorrido sobre la cuadrícula.
- **Fusión de letras:** un alfabeto de trazos que se combina en una figura.
- **Ligadura bicolor:** una ruta planetaria y un glifo ligado, cada uno con su tinta. Para poder distinguirlos sin terminar con un nudo de líneas.
- **Escudo geomántico:** cuatro madres que puedes editar punto por punto. De ellas salen las hijas, las sobrinas, los testigos y el juez.

Puedes ajustar el grosor, girar la pieza, espejarla y descargarla como SVG o PNG transparente. El JSON guarda la receta para volver a abrirla y continuar desde ahí.

Todo ocurre en el navegador. El motor también se puede usar por separado, que era parte de la gracia: poder llevarlo después a mi web o a otros proyectos.

## Echarlo a andar

Necesitas Node.js 22 o posterior.

```sh
git clone https://github.com/SebMunz/sigil-forge.git
cd sigil-forge
npm start
```

Abre [localhost:4317](http://127.0.0.1:4317/). La app no tiene dependencias que instalar para arrancar. En PowerShell puedes usar `npm.cmd start` si la política de scripts molesta.

Para comprobar el código:

```sh
npm test
npm run check
```

## Usarlo en otra web

Puedes instalarlo directamente desde este repo:

```sh
npm install github:SebMunz/sigil-forge
```

El motor funciona sin montar la interfaz:

```js
import {
  generate,
  toSVG,
  exportRecipe,
  importRecipe,
} from '@floure/sigil-forge';

const sigilo = generate({
  text: 'Floure',
  method: 'hybrid',
  planet: 'mars',
  ink: '#e29930',
  accentInk: '#b8d0be',
});

const svg = toSVG(sigilo);
const receta = exportRecipe(sigilo);
const recuperado = importRecipe(receta);
```

Los métodos son `planetary`, `letters`, `hybrid` y `geomantic`. En geomancia puedes pasar las dieciséis líneas de las madres mediante `mothers`, usando `1` o `2` para cada línea; si lo dejas vacío, las deriva del texto.

Para llevarte el taller completo, importa `@floure/sigil-forge/element` desde el código del navegador y añade `<sigil-forge></sigil-forge>`. El componente expone `.recipe`, `.artifact` y el evento `sigil-change`. Su CSS vive en `src/workshop.css`; tu bundler tiene que conservar ese archivo. En Astro u otro entorno con SSR, carga el componente del lado del cliente.

Si lo vas a dejar instalado en un proyecto, fija la dependencia a un commit o una etiqueta para elegir cuándo actualizarlo.

## Publicar en Cloudflare

`npm run build` deja la página y sus módulos en `dist/`. Esa carpeta es todo lo que necesita Pages.

GitHub Actions comprueba el código, ejecuta las pruebas y guarda ese mismo build para publicarlo. En **Actions → Validate and deploy → Run workflow** puedes elegir `preview` o `production`; con `none` solo valida. Los pushes a `main` validan sin publicar, salvo que actives la variable del repositorio `DEPLOY_ENABLED=true`.

Cada entorno de GitHub necesita las variables `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_PAGES_PROJECT`, junto al secreto `CLOUDFLARE_API_TOKEN` con permiso de edición de Pages. El proyecto de Cloudflare debe existir y usar `main` como rama de producción; los entornos de GitHub también se restringen a esa rama.

## Lo que viene

Primero, seguir ampliando los métodos. Después vendrá el editor de trazos para mover nodos y terminar las piezas a mano.

Por ahora hay bastante espacio para jugar con lo que ya tiene. Y para encontrar cosas que todavía necesitan una vuelta.

## Licencia

[GPLv3](LICENSE).

---

ALCHEMICAL FIRMWARE // HOME OF THE CRT COVEN
