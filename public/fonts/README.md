# Fonts · self-host

Esta carpeta es servida como estática por Vite en `/fonts/…`.

## Garet

Garet no está en Google Fonts ni en CDNs públicos — es una tipografía
comercial de Ariel Martín Pérez. Para usarla debes descargar los
archivos (versión free o licencia adquirida) y colocarlos aquí con
estos nombres **exactos**:

```
public/fonts/
├── garet-light.woff2        # 300
├── garet-book.woff2         # 400  ← el principal
├── garet-book-italic.woff2  # 400 italic
├── garet-medium.woff2       # 500
├── garet-heavy.woff2        # 700
└── garet-heavy-italic.woff2 # 700 italic
```

Sitio oficial: https://creativemarket.com/RMD/4369762-Garet-Typeface
(versión "Book" suele estar disponible free).

Una vez que pegues los `.woff2`, **refresca la página** — el
`@font-face` en `src/styles/fonts.css` los detecta y el sitio
empieza a usar Garet en vez de Jost.

## Fallback

Mientras no existan los archivos, el sitio usa **Jost** (Google Fonts),
que es geométrica y visualmente muy cercana a Garet.
