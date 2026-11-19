# Buzz Loft — website

Astro 6 build of the **Direction-02** page from the Buzzloft Figma file.

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

Requires Node >= 22.12 (Astro 7 needs >= 22.23.4; upgrade Node to move to Astro 7).

## Structure

- `src/pages/index.astro` – page composition
- `src/components/*` – one component per Figma section (Nav, Hero, Statement, Work, PointOfView + Services, Process, Fresh, Pretty + testimonials, Cta, Footer)
- `src/scripts/motion.ts` – all motion (GSAP ScrollTrigger + Lenis smooth scroll), driven by `data-*` attributes in markup
- `src/styles/global.css` – tokens; on desktop `1rem = 10px` at a 1920px viewport, so Figma px values are written as `px / 10` rem and scale fluidly
- `src/assets/` – raster images (auto-optimized to WebP by `astro:assets`)
- `public/assets/` – SVG icons/shapes exported from Figma

## Fonts

- **Instrument Sans** – bundled via `@fontsource-variable/instrument-sans`
- **Delight** – licensed; add `Delight-Regular.woff2`, `Delight-Medium.woff2`, `Delight-Bold.woff2` to `public/fonts/`. Until then, Figtree is used as fallback.

Motion respects `prefers-reduced-motion`.
