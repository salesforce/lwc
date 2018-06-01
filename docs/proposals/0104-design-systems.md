# RFC: Integration with Design Systems

## Status

- Start Date: 2018-06-01
- RFC PR: TBD

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

### 2. Slicing Plugin and Remap in compiler

This proposal requires a new configuration in the compiler to plug a method that can produce the slice of the design system that is required by a template. E.g.:

```js
function getSlicedStyles(template: string, extras: string[]): string {
    /**
     * - Parse template, which contains a single root <template> tag.
     * - Extra all static classnames used by the template.
     * - Dedupe the list of extracted classnames and extras.
     * - Expand the list of classnames with all friendly classes and associated utility.
     * - Generate styles for the list classes.
     * - Return the style to be remap and contextualized
     */
}
```

Then, the compiler must parse the results, remap styles, and apply contextualization rules before adding this style into the bundle. The compiler will invoke this plugin method per template, and will provide the `extras` from the class declaration (static or via decorator).

#### Pros:

* Easy.

#### Cons: 

* Considerable changes in compiler to do contextualization and remap.
* The plugin does too little, it is less powerful.
* Edge cases will have to be solved in compiler.

### 3. Slicing and Remap Plugin

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
     * - Extra all static classnames used by the template.
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
* Almost no change in compiler.

#### Cons: 

* TBD

## Resolution

TBD