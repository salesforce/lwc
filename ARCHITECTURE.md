# Architecture

## Introduction

This document describes the overall code architecture of the open-source Lightning Web Components (LWC) framework, i.e. the repository you are looking at right now.

The idea behind an `ARCHITECTURE.md` file can be found in [this post](https://matklad.github.io//2021/02/06/ARCHITECTURE.md.html).

## Overview

The LWC codebase is a TypeScript/JavaScript monorepo. The convention for naming packages is `packages/@lwc/*`.

For example, the template compiler is located at `packages/@lwc/template-compiler` and will be published to npm as `@lwc/template-compiler`.

The one exception is the `lwc` package, which is located at `packages/lwc`. This is a "barrel package" that merely re-exports other packages.[^lwc-import]

Also note that some private packages are included in `packages/@lwc/*`. This is not for publishing to npm under the `@lwc` namespace, but instead to avoid [dependency confusion attacks](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610).

## High-level architecture

The LWC codebase is broadly split into two categories:

1. **Compiler:** This runs in Node.js at component compilation time.
2. **Runtime:** This runs in the browser at component runtime (or on the server in Node.js in the case of SSR).

Besides these two categories, there are also some shared packages and polyfills, but let's start with these two groups.

### Compiler

At a high level, the `@lwc/compiler` calls into three other packages to process HTML, CSS, and JS[^js] files respectively:

```mermaid
graph TD
     compiler[@lwc/compiler];
     templatecompiler[@lwc/template-compiler];
     babelplugincomponent[@lwc/babel-plugin-component];
     stylecompiler[@lwc/style-compiler];
     compiler-->|HTML|templatecompiler;
     compiler-->|CSS|stylecompiler;
     compiler-->|JS|babelplugincomponent;
```

A typical LWC component is composed of `*.html`, `*.css`, and `*.js` files, so one compiler package handles each type of file. In all three cases, the output is JavaScript.

The following core parsers are used for each file type:

- `HTML`: [`parse5`](https://github.com/inikulin/parse5)
- `CSS`: [PostCSS](https://postcss.org/)
- `JS`: [Babel](https://babeljs.io/)

We can complicate the diagram a bit more by including `@lwc/rollup-plugin`[^rollup], which manages the Rollup integration:

```mermaid
graph TD
     rollupplugin[@lwc/rollup-plugin];
     compiler[@lwc/compiler];
     templatecompiler[@lwc/template-compiler];
     babelplugincomponent[@lwc/babel-plugin-component];
     stylecompiler[@lwc/style-compiler];
     rollupplugin-->compiler;
     compiler-->|HTML|templatecompiler;
     compiler-->|CSS|stylecompiler;
     compiler-->|JS|babelplugincomponent;
```

This also gets more complex once we include the SSR compiler:

```mermaid
graph TD
     rollupplugin[@lwc/rollup-plugin];
     compiler[@lwc/compiler];
     templatecompiler[@lwc/template-compiler];
     babelplugincomponent[@lwc/babel-plugin-component];
     stylecompiler[@lwc/style-compiler];
     ssrcompiler[@lwc/ssr-compiler];
     rollupplugin-->compiler;
     compiler-->|HTML|templatecompiler;
     compiler-->|CSS|stylecompiler;
     compiler-->|JS|babelplugincomponent;
     compiler-->|HTML/JS|ssrcompiler;
```

The SSR compiler handles HTML and JS files, but not CSS files – these are handled by `@lwc/style-compiler` for both the SSR and CSR use case.

The decision of whether to compile an HTML/JS file for CSR or SSR is made by a compiler flag (`targetSSR`). A file compiled with `@lwc/ssr-compiler` is intended to only be used with `@lwc/ssr-runtime`.

### Runtime

At runtime, the core logic of the client-side LWC engine is in `@lwc/engine-core`. Today, though, this engine is split into `@lwc/engine-dom` and `@lwc/engine-server` to allow for both SSR and CSR:

```mermaid
graph TD
     enginedom[@lwc/engine-dom];
     enginecore[@lwc/engine-core];
     engineserver[@lwc/engine-server];
     enginedom-->enginecore;
     engineserver-->enginecore;
```

This architecture was created at the genesis of LWC SSR to facilitate development of the SSR system, and to ensure that it remains as close as possible to the CSR system.

`@lwc/engine-dom` represents the bare minimum API surface needed to communicate with the browser's DOM APIs, whereas `@lwc/engine-server` represents a kind of shim for those APIs which constructs a pseudo-DOM, which can then be serialized to an HTML string.

Since this architecture is not particularly performant compared to a dedicated SSR compiler/runtime, in the long term, `@lwc/engine-server` is intended to be deprecated and removed in favor of `@lwc/ssr-compiler`/`@lwc/ssr-runtime`. At this point, there would be no reason to split up `@lwc/engine-dom` and `@lwc/engine-core`, and they could be merged back together.

On this same note, `@lwc/ssr-runtime` can be considered a sibling of `@lwc/engine-dom` and `@lwc/engine-server`. All three should export roughly the same API surface, (e.g. `LightningElement` is exported by each of them).

### Shared packages

There are a small number of packages that are shared between the compiler and runtime:

- `@lwc/errors`
- `@lwc/features`
- `@lwc/shared`

`@lwc/errors` contains common error messages, `@lwc/features` handles global feature flags, and `@lwc/shared` is a grab-bag of utilities and types not represented elsewhere.

### Helper packages

Some helper packages are not shared between client and server, but still perform small functions:

- `@lwc/module-resolver`: LWC's custom module resolution logic
- `@lwc/signals`: client-side signals implementation
- `@lwc/types`: TypeScript helper for HTML/CSS imports
- `@lwc/wire-service`: Implementation of the `@wire` service

These projects are typically "done" when implemented and rarely need to be touched.

[`observable-membrane`](https://github.com/salesforce/observable-membrane) is also conceptually in this same group, even though it technically lives outside the LWC monorepo.

### Polyfills

A separate category of helper packages is our polyfills:

- `@lwc/aria-reflection`: implementation of [ARIA string reflection](https://wicg.github.io/aom/spec/aria-reflection.html)
- `@lwc/synthetic-shadow`: implementation of [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) with some LWC-specific hooks

In an ideal world, neither of these packages would exist. For historical reasons and for reasons of backwards compatibility, these packages are still maintained as of this writing.

Some other polyfills are not separate packages but instead part of LWC's core logic. For instance, [synthetic custom element lifecycle](https://github.com/salesforce/lwc-rfcs/pull/89) is small enough to be inlined in `@lwc/engine-dom`.

### Private packages

There are several private internal packages for tests and performance benchmarking:

- `@lwc/integration-karma`: primary client-side LWC test suite, using Karma
- `@lwc/integration-tests`: WebDriverIO tests, used for anything Karma can't do, such as user agent gestures such as changing focus
- `@lwc/integration-types`: TypeScript tests, i.e. tests for the types themselves
- `@lwc/perf-benchmarks`: Performance micro-benchmarks for either Best or Tachometer
- `@lwc/perf-benchmarks-components`: Collection of components used by the above (split into a separate package due to Tachometer restrictions)

## External integrations

In terms of external integrations and dependencies, the LWC open-source monorepo purely depends on open-source projects, including those authored at Salesforce. Today this includes:

- [`observable-membrane`](https://github.com/salesforce/observable-membrane): core reactivity logic
- [`@locker/babel-plugin-transform-unforgeables`](https://github.com/salesforce/locker-oss): special Babel transform for Lightning Web Security

LWC also has several tight integrations with Salesforce-internal projects:

- `lwc-platform-public`: core integration logic between Salesforce core and the LWC open-source project
- Locker/Lightning Web Security: security layer with several integration points with LWC (e.g. `enableLightningWebSecurityTransforms`, `addLegacySanitizationHook`, `setHooks`, etc.). Many core LWC design decisions (such as shadow DOM) are tightly integrated with design decisions in Locker/LWS.
- Lightning Web Runtime: meta-framework which can be thought of as "the [Next.js](https://nextjs.org/)" of LWC.

Some open-source projects live in the same "cinematic universe" but are less tightly coupled to LWC, including:

- [`lwc-test`](https://github.com/salesforce/lwc-test): LWC Jest testing utilities
- [`eslint-plugin-lwc`](https://github.com/salesforce/eslint-plugin-lwc): LWC ESLint linting utilities

## Framework design

### 2016-2019 design and virtual DOM

At its core, LWC is a framework heavily influenced by other popular frameworks of the late 2010's, notably [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/), and [React](https://react.dev/). Of the three, it owes the most to Vue's influence.

Like Vue, the original LWC framework design has a few core building blocks:

- **Virtual DOM.** Like Vue, LWC uses virtual DOM even in cases where a component is authored in HTML. Unlike Vue, LWC does not have a mode where you can author VDOM directly (i.e. [`render()`](https://doc.vueframework.com/guide/render-function.html)).
- **VDOM diffing.** Like Vue, LWC was originally authored with [`snabbdom`](https://github.com/snabbdom/snabbdom) but has since forked into its own implementation.
- **Proxies.** Like Vue v3, LWC uses the JavaScript [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for reactivity.

A big design difference between LWC and Vue (and React and Svelte, for that matter) is its use of shadow DOM and custom elements. You might think that LWC would share a lot with [Lit](https://lit.dev/), since they both rely on web components, but in fact Lit v1 was released [in 2019](https://www.npmjs.com/package/lit-html/v/1.0.0), the [same year as LWC](https://developer.salesforce.com/blogs/2019/05/introducing-lightning-web-components-open-source), so they were largely developed in parallel. (Furthermore, LWC's [first commit](http://github.com/salesforce/lwc/commits/2a97a2834353201dbb52865a03011784c9b52a7d) was in 2016.)

Unlike Lit, LWC's core engine is not based on VDOM-less HTML templating, and unlike Lit, it does not take a "custom-elements-agnostic" approach where child components are treated as generic web components authored in any JavaScript framework. (Instead, LWC defaults to treating all components as LWC components, with `lwc:external` as an opt-out.)

### 2022-2024 design and the static content optimization

Another piece of history that LWC shares with Vue is that it has been slowly moving away from raw VDOM for [performance reasons](https://svelte.dev/blog/virtual-dom-is-pure-overhead). As such, LWC has adopted several performance optimizations that look more similar to Lit's approach (or [Solid's and Svelte's](https://nolanlawson.com/2023/12/02/lets-learn-how-modern-javascript-frameworks-work-by-building-one/), for that matter). Vue calls this [compiler-informed VDOM](https://vuejs.org/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom), Marko calls it [compile-time optimization of static sub-trees](https://markojs.com/docs/why-is-marko-fast/#compile-time-optimization-of-static-sub-trees), and Million calls it [Block VDOM](https://dev.to/aidenybai/exploring-blockdom-fastest-virtual-dom-ever-28nl), but the concepts are very similar regardless.

In LWC, this is either called [the "static content optimization"](https://github.com/salesforce/lwc/pull/2781) or ["fine-grained reactivity"](https://github.com/salesforce/lwc/issues/3624) (although true fine-grained reactivity is, of this writing, still a work in progress). In either case, the core technique is:

- Identify blocks of templated HTML that are static.
- Use a simple string-based `<template>` / `innerHTML` / `cloneNode` approach rather than expensive VDOM diffing for such blocks.

Over time, this optimization has been expanded to non-static blocks of templated HTML, yielding performance gains at each step, while diverging further and further from the Virtual DOM model. That said, there are still plenty of cases where virtual DOM is used (i.e. de-opts), so the LWC engine largely has two parallel code paths to handle each. (For this reason, CI tests run both with and without the static content optimization enabled.)

### Unique design decisions in LWC

If you squint, LWC looks a lot like other frameworks. So in some ways, it's more interesting to talk about where LWC diverges from those frameworks. At a high level, there are a few features where LWC largely "goes its own way".

#### Component-level API versioning

This is an LWC-specific concept driven by the strong need for backwards compatibility on the Salesforce Lightning platform. This is a whole topic on its own, but is largely covered by [the official Salesforce post](https://developer.salesforce.com/blogs/2024/01/introducing-component-level-api-versioning-for-lwc) on the topic.

Suffice it to say: if a breaking change can be contained to the internals of a given component (i.e. one component cannot observe the state of another one), then this breaking change should be done through component-level API versioning. [Several such breaking changes](https://lwc.dev/guide/versioning#breaking-changes) have already been made.

#### Shadow DOM and custom elements

The decision to use shadow DOM, custom elements, and the other building blocks of web components was largely made 1) to integrate well with Locker/LWS, and 2) to hew more closely to web standards. As previously mentioned, this does not bring LWC much closer to Lit, but instead gives LWC its own flavor.

LWC is also unique in that it offers a "light DOM" mode which works much more closely to non-web component frameworks such as Vue or Svelte. In this mode, style scoping is still supported, along with `<slot>`s, but this works almost identically to Vue and Svelte's implementations of the same concepts, rather than the browser shadow DOM standard.

This is another point of differentiation with Lit, which has resisted implementing such "non-standard" features. In LWC's case the choice was made for pragmatism. (Some use cases prefer light DOM to shadow DOM for its ease of styling and better integration with third-party tools and extensions.) This choice is also similar to [Stencil's decision](https://stenciljs.com/docs/styling#shadow-dom-in-stencil) to make shadow DOM optional, or [Enhance](https://enhance.dev/docs/elements/html/slots) and [Astro](https://docs.astro.build/en/basics/astro-components/#slots) making `<slot>`s a purely compile-time (i.e. light DOM) concern.

[^lwc-import]: Note that this is only tangentially related to the `import { LightningElement } from 'lwc'` idiom, because in this case `'lwc'` is more of a compile-time concern than a runtime concern. The LWC compiler is responsible for transforming this `'lwc'` import into something else (e.g. `@lwc/engine-dom`, `@lwc/ssr-runtime`), so it's not a "true" import of the `lwc` package.

[^js]: Whenever JS files are mentioned in the context of the compiler, you can assume that TS (TypeScript) files are also included here.

[^rollup]: External tools like [`lwc-webpack-plugin`](https://github.com/salesforce/lwc-webpack-plugin) or [`vite-plugin-lwc`](https://github.com/cardoso/vite-plugin-lwc), which use other bundlers than Rollup, would likely also call directly into `@lwc/compiler`.
