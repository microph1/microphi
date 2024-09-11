# Microphi Styles

Welcome to the **Microphi Styles**, a powerful and flexible set of SCSS utilities designed to help you build modern, scalable, and maintainable stylesheets for your web projects.

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

Here's a basic example using the grid system and utility classes:

```html
<div class="container">
  <div class="row">
    <div class="col-6">
      <p class="text-primary">This is a column</p>
    </div>
    <div class="col-6">
      <p class="text-secondary">This is another column</p>
    </div>
  </div>
</div>
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
