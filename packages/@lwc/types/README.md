# @lwc/types

This package provides type definitions for LWC projects written in TypeScript.

## Usage

> [!IMPORTANT]
> If you use the `lwc` package in your project, then HTML and CSS imports will work without any configuration required.

To enable importing [templates](https://lwc.dev/guide/html_templates) or [stylesheets](https://lwc.dev/guide/css), simply import this package once, from anywhere in your project.

```ts
// ./types/global.d.ts
import '@lwc/types';

// my-component.ts
import stylesheet from './my-component.css';
import template from './my-component.html';
```

## Module Definitions

This package provides module definitions for HTML and CSS files, so that they can be imported in LWC component script files.
