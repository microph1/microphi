# @microphi/styles — notes for coding agents

Flex-first SCSS utility classes. Full docs: [README.md](README.md).

## Rules

- Load once: `@use '@microphi/styles/scss/main';` (requires `utopia-core-scss`).
- Classes are prefixed `fx-` (`fx-flex`, `fx-gap-4`, `fx-p-2`); responsive variants use `md:` style prefixes (`md:fx-flex-row`).
- Spacing and font sizes are fluid steps of a Utopia scale (`fx-text-{step}`), not pixel values: don't add fixed `px` overrides for them.
- Check `scss/` for the exact class before inventing one; prefer composing utilities over new CSS.
