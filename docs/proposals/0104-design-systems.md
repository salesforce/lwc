# RFC: Integration with Design Systems

## Status

- Start Date: 2018-06-01
- RFC PR: https://github.com/salesforce/lwc/pull/366

## Summary

One of the primary use-cases for LWC is to allow Lightning Web Components inside the Salesforce's platform. This platform relies on a design system (SLDS) that provides most of the CSS needed for any Web Component. 

This proposal is about the usage of a design system in Lighting Web Components, and how the compiler produces the right bundle that can work with Shadow DOM, and with Synthetic Shadow DOM.

## The Problem

When the Web Component is relying on the Shadow DOM encapsulation mechanism, the styles of each component must be part of the component bundle, instead of being applied as a global style. Additionally, styling the host itself should not rely on classnames because those classes must be available in the outer Shadow Root, which implies the need for some interdependencies between components that is not supported by our compiler. Our compiler compiles one bundle at a time, and does not know about any other bundle.

## Proposals

### 1. Shared Style for all components 

Insert the entire design system global css on every component:

#### Pros:

* No much work do to in compiler.

#### Cons:

* Does not solve all problems related to applying styles to the HOST since the host element can only be styled with `:host` selector, and that must be individually defined per component, instead of a single host style.
* Potential perf penalty for a CSS blob that is sufficiently big to crash a browser.

RESOLUTION: This is a no-go since it is very limited, and has perf implications.

### 2. Slicing and Remap Plugin

This proposal requires a new configuration in the compiler to plug a method that can produce the sliced and remapped styles of the design system that is required by a template. E.g.:

```js
interface pluginConfig {
    remap: Record<selector, selector>;
    extras: classname[];
    normalize: enum(all, minimum, none);
}
function getSlicedStyles(template: string, config: pluginConfig): string {
    /**
     * - Parse template, which contains a single root <template> tag.
     * - Extract all static classnames used by the template.
     * - Dedupe the list of extracted classnames and config.extras and config.remap record fields.
     * - Expand the list of classnames with all friendly classes and associated utility.
     * - Generate styles for the list classes.
     * - Parse styles and carry on remap of styles
     * - Apply contextualization for :host rules
     * - Return the styles for shadow root
     */
}
```

The compiler will invoke this plugin method per template, and will provide the config extracted from the class declaration (static or via decorator).

#### Pros:

* Plugin is very powerful (we can have a plugin for different design systems or versions without touching the compiler).
* Edge cases can be solved in plugin.
* Contextualization and remap can evolve over time in the plugin.

#### Cons: 

* Our current architecure does not support contextualization of dependencies (a la rollup). This means there is no way to pass config from JS to the HTML to the CSS.
* The plugin system will have to be proprietary.

### 3. Slicing and Remap via Rollup Plugin

Rely on the already existing well defined Rollup API to provide a way to add design system styles into your component.

The challenge with this approach is how to pass information (metadata) from the JS file to the HTML file, augment that metadata with the Template source, and eventually get the rollup plugin for the design system to handle the creation of the style block that contains the fully sliced, remapped and contextualized rules.

Since rollup does not have an API to contextualize the import, which means that it doesn't offer a way to pass metadata from the JS file to the HTML import to the CSS import, we can rely on the query parameters for that. This is a technique popularized in the Rollup community that is good enough for our use-case.

Workflow:

1. During JS compilation, inspect the class declaration for metadata information about the design system (via statics or via a decorator).
2. If metadata is found about the design system, propagate all the metadata via a serialized query parameter called `config` for all HTML imports (whether they were added manually, or dynamically). E.g.: https://webpack.js.org/concepts/loaders/#inline
3. During HTML compilation, if the `config` query parameter is present, insert a new CSS import at the top of the template with a URL that is based on the design system information present in the query parameter, plus the `config` parameter itself, and a new parameter called `template` that contains a string representation of the current `<template>` tag.
4. Plug a rollup plugin that can identify the URL that represents the design system that the plugin can handle. Pick up the `config` and the `template` parameters, and create a synthetic file that contains the sliced, remapped and contextualized rules that correspond to them.

The rollup plugin is responsible for:

 * Parse `template` string passed as query parameter, which contains a single root <template> tag.
 * Extract all static classnames used by the template.
 * Dedupe the list of extracted classnames and `config.extras` and `config.remap` record fields.
 * Expand the list of classnames with all friendly classes and associated utility.
 * Generate styles for the list classes.
 * Parse styles and carry on remap of styles
 * Apply contextualization for `:host` rules
 * Return the styles for shadow root

#### Pros:

* Plugin is very powerful (we can have a plugin for different design systems or versions without touching the compiler).
* Edge cases can be solved in plugin.
* Contextualization and remap can evolve over time in the plugin.
* Little change in compiler.
* Design system config is extensible per design system, it is opaque for the compiler.

#### Cons: 

* Relies on a side-channel ad-hoc communication between the different files via query parameters.

## Resolution

TBD