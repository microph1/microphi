# @microphi/styles [![npm](https://img.shields.io/npm/v/@microphi/styles)](https://www.npmjs.com/package/@microphi/styles)

> Flex-first SCSS utilities

Utility classes (prefixed `fx-`) built flex-first: while working on [microgamma](https://github.com/microph1) none of the available libraries treated flex layout as the default, so this is ours. Spacing and font sizes are fluid, driven by a [Utopia](https://utopia.fyi) scale.

## Install

```sh
npm i @microphi/styles utopia-core-scss
```

```scss
@use '@microphi/styles/scss/main';
```

(Point Sass's load path at `node_modules`, or use the full relative path.)

## Example

```html
<div class="fx-flex fx-flex-col md:fx-flex-row fx-justify-between fx-items-center fx-gap-4">
  <div class="fx-w-50">Half width</div>
  <div class="fx-grow-1">The rest</div>
</div>
```

## What's included

| Area | Examples |
|---|---|
| Display | `fx-flex`, `fx-grid`, `fx-block`, `fx-hidden` |
| Flex | `fx-flex-row`, `fx-flex-col`, `fx-flex-wrap`, `fx-grow-1`, `fx-shrink-0`, `fx-justify-between`, `fx-items-center`, `fx-fill-row` |
| Grid | `fx-grid-cols-3`, `fx-grid-rows-2`, `fx-col-span-2`, `fx-col-start-1`, `fx-row-span-2`, `fx-place-self-center` |
| Spacing | `fx-p-4`, `fx-px-2`, `fx-mt-1`, `fx-m-a` (auto), `fx-gap-4`, `fx-gap-row-2` |
| Sizing | `fx-w-50`, `fx-w-full`, `fx-h-full`, `fx-vh-50`, `fx-min-w-*`, `fx-max-h-*` |
| Position | `fx-relative`, `fx-absolute`, `fx-sticky`, `fx-inset-0`, `fx-top-0`, `fx-z-10` |
| Typography | `fx-text-{step}`, `fx-headline-1`, `fx-title`, `fx-body-1`, `fx-caption`, `fx-uppercase`, `fx-tracking-wide`, `text-ellipsis` |
| Misc | `fx-rounded-*`, `fx-opacity-50`, `fx-cursor-pointer` |

### Responsive variants

Layout utilities have breakpoint-prefixed variants that apply from that width up:

| Prefix | Min width |
|---|---|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `xxl:` | 1536px |

```html
<div class="fx-grid fx-grid-cols-1 sm:fx-grid-cols-2 lg:fx-grid-cols-3 fx-gap-4">...</div>
```

Breakpoints come from the `$breakpoints` map in `_variables.scss` (`!default`, so it can be overridden).

## Spacing and typography scale

Spacing classes resolve to Utopia space variables (`--fx-3xs` … `--fx-2xl`), and `fx-text-{step}` to type-scale variables (`--fx-typography--4` … `--fx-typography-6`). Generate both with Utopia, using the `fx` prefix.

Semantic typography classes map to fixed steps:

| Class | Step |
|---|---|
| `fx-headline-1` / `fx-title` | 1 |
| `fx-headline-2` | 2 |
| `fx-subtitle` | 0 |
| `fx-body-1` | -1 |
| `fx-body-2` | -2 |
| `fx-caption` | -3 |
| `fx-overline` | -4 |

If your Utopia variables use a different name, override the mapping when loading the library:

```scss
@use '@microphi/styles/scss/main' with (
  $typography-vars: (
    0: var(--step-0),
    1: var(--step-1),
    -1: var(--step--1),
    // ... every step in your scale
  )
);
```
