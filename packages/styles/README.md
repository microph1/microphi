# fx-scss

Welcome to the **fx-scss**, a flex first set of css classes to ease

## Motivations
While working on Microgamma we went through all available scss libraries. All lacked a flex first approach to layouting.
We believe in a flex first approach when it comes to layouting. This library is the result of our though process in term of layouting and utilities.


## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Modular Architecture:** A well-organized structure with reusable components and utilities.
- **Flex layout system:** Flex layout system for clear and powerful layouting.
- **Grid layout system:** Comprehensive CSS Grid utilities for modern layout solutions.
- **Utility Classes:** Commonly used utility classes for margin, padding, colors, typography, etc.
# - **Mixins and Functions:** Custom mixins and functions to reduce repetitive CSS and enhance your workflow.
# - **Theming Support:** Easy customization of themes through variables for colors, typography, and other design elements.
- **Compatibility:** Fully compatible with modern browsers and responsive across all device sizes.

## Installation

Install using your favorite package manager

```bash
@microphi/flexus
```

Alternatively, you can manually download the SCSS files and include them in your project.

## Getting Started

library_name is made of the following scss modules


```scss
@import 'path/to/scss-library/main.scss';
```

This will include the core styles and utilities in your project. You can then start building your styles on top of the provided components.

### Example Usage

Here's a basic example using the flex system and utility classes:

```html
<div class="fx-flex fx-justify-center fx-items-center">
  <div class="fx-w-full fx-h-50">
    <p class="text-primary">This is a flex container</p>
  </div>
</div>
```

### Grid System

The library also provides comprehensive CSS Grid utilities for modern layout solutions:

```html
<div class="fx-grid fx-grid-cols-3 fx-gap-4">
  <div class="fx-col-span-2">Main content</div>
  <div>Sidebar</div>
  <div class="fx-col-start-1 fx-col-end-4">Full width footer</div>
</div>
```

#### Grid Container Utilities

- `fx-grid` - Sets display: grid
- `fx-grid-cols-{n}` - Defines grid-template-columns (1-12, none, subgrid)
- `fx-grid-rows-{n}` - Defines grid-template-rows (1-6, none, subgrid)
- `fx-grid-flow-{dir}` - Controls grid-auto-flow (row, column, dense, etc.)
- `fx-gap-{size}` - Sets gap between grid items
- `fx-gap-col-{size}` - Sets column-gap
- `fx-gap-row-{size}` - Sets row-gap
- `fx-justify-content-{alignment}` - Justifies content along the inline axis
- `fx-content-{alignment}` - Aligns content along the block axis
- `fx-justify-items-{alignment}` - Justifies grid items along the inline axis
- `fx-items-{alignment}` - Aligns grid items along the block axis
- `fx-place-content-{position}` - Sets place-content shorthand
- `fx-place-items-{position}` - Sets place-items shorthand

#### Grid Item Utilities

- `fx-col-span-{n}` - Makes item span across n columns (1-12, auto, full)
- `fx-row-span-{n}` - Makes item span across n rows (1-6, auto, full)
- `fx-col-start-{n}` - Sets grid-column-start property
- `fx-col-end-{n}` - Sets grid-column-end property
- `fx-row-start-{n}` - Sets grid-row-start property
- `fx-row-end-{n}` - Sets grid-row-end property
- `fx-area-{value}` - Sets grid-area property
- `fx-place-self-{position}` - Sets place-self property

#### Responsive Grid

All grid utilities are responsive and support breakpoints:

```html
<div class="fx-grid fx-grid-cols-1 sm:fx-grid-cols-2 lg:fx-grid-cols-3 fx-gap-4">
  <div>Responsive grid item</div>
  <div>Responsive grid item</div>
  <div>Responsive grid item</div>
</div>
```

### Typography System

The library provides a flexible typography system that works with the Utopia scale generator. You can customize the typography scale using the Utopia package and map the generated CSS variables to the fx-scss classes.

#### Dynamic Font Size Classes

The system generates font size classes dynamically based on your Utopia configuration:

```html
<!-- Generate classes from --fx-typography--6 to --fx-typography-6 based on your scale -->
<p class="fx-text-3">Larger text using --fx-typography-3 variable</p>
<p class="fx-text-0">Base text using --fx-typography-0 variable</p>
<p class="fx-text--2">Smaller text using --fx-typography--2 variable</p>
```

#### Semantic Typography Classes

The library also provides semantic classes that map to specific scale steps:

```html
<h1 class="fx-headline-1">Headline 1 using --fx-typography-1</h1>
<h2 class="fx-headline-2">Headline 2 using --fx-typography-2</h2>
<p class="fx-title">Title using --fx-typography-1</p>
<p class="fx-subtitle">Subtitle using --fx-typography-0</p>
<p class="fx-body-1">Body 1 using --fx-typography--1</p>
<p class="fx-body-2">Body 2 using --fx-typography--2</p>
<p class="fx-caption">Caption using --fx-typography--3</p>
<p class="fx-overline">Overline using --fx-typography--4</p>
```

#### Customizing Typography Variables

To customize which CSS variables the classes use (e.g., if using a different prefix in Utopia), define a custom `$typography-vars` map before importing fx-scss:

```scss
// Define custom mapping to match your Utopia configuration
$typography-vars: (
  1: var(--step-typography-1),
  2: var(--step-typography-2),
  3: var(--step-typography-3),
  0: var(--step-typography-0),
  -1: var(--step-typography--1),
  -2: var(--step-typography--2),
  // ... etc for all steps in your scale
) !default;

// Now import fx-scss
@import 'path/to/fx-scss/main';
```

## Folder Structure

The SCSS library follows a clean, modular structure:

```
scss-library/
│
├── base/           # Base styles (normalize, resets, typography, etc.)
├── components/     # Reusable components (buttons, cards, forms, etc.)
├── layout/         # Layout helpers (grid, containers, spacing, etc.)
├── mixins/         # Utility mixins (media queries, typography helpers, etc.)
├── themes/         # Theming (color palettes, variables, dark/light modes)
└── utilities/      # Utility classes (margin, padding, display, etc.)
```

### Key Files

- `main.scss`: The primary file to import into your project.
- `variables.scss`: Defines default variables for colors, typography, spacing, etc.
- `mixins.scss`: Contains mixins to simplify responsive design, typography, and other features.

## Customization

The library is designed to be easily customizable. You can override the default variables by creating your own SCSS file and importing the library below your custom settings:

```scss
// Custom variables
$primary-color: #007bff;
$secondary-color: #6c757d;

// Import library after customizations
@import 'path/to/scss-library/main.scss';
```

### Theming

To create a custom theme, simply modify the variables in the `themes/` folder or define new ones in your project. You can switch between themes dynamically by overriding these variables.

## Contributing

We welcome contributions to improve the library! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure all SCSS is properly compiled.
4. Submit a pull request with a detailed explanation of your changes.

Please follow the [contribution guidelines](CONTRIBUTING.md) for more details.

## License

This SCSS library is open-source and available under the [MIT License](LICENSE).

---

Feel free to open an issue if you have any questions or run into any issues while using the library. Happy coding!
