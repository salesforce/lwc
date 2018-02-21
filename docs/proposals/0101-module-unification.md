# RFC: Module Unification

## Status

- Start Date: 2018-02-05
- RFC PR: https://github.com/salesforce/lwc/pull/63

## Summary

One of the primary use-cases for LWC is to allow Lightning Web Components inside the Salesforce's platform. This platform has some constrains around the folder structure and files names, and we will have to align with those constrains. Additionally, we will like to have a comprehensive structure that is easy to understand that easy to reasoning, and ideally, it can map to existing mechanism of resolution (e.g.: NPM).

This proposal is about the bundle interface, not about the internals of the bundle, which means that existing invariants about the bundle's internal behavior continue to be valid.

## Proposals

### 1. camelCase

#### Rules

* namespace can only contain lowercase characters, no dashes (e.g.: `lightning`, `foo`)
* a folder called after the namespace must be placed inside the `src/modules` folder.
* each bundle is represented by a folder inside the namespace folder, (e.g.: `src/modules/foo/list`), we call this bundle name.
* a bundle name must only use alfa-numeric characters, with no spaces or dashes.
* a bundle name must start with alphabetical character in lowercase.
* a bundle name can have uppercase characters in any position other than position 0.
* a bundle name must contain at least one `.js` file, and its name must matches the bundle name (bundle folder name). (eventually we can support `.html` bundles).

#### Examples

Folder structure:

```bash
└── src
    └── modules
        ├── foo
        │   ├── list
        │   │   ├── list.html
        │   │   └── list.js
        │   └── listItem
        │       ├── listItem.html
        │       └── listItem.js
        └── lightning
            ├── button
            │   ├── button.html
            │   └── button.js
            ├── keyboardNav
            │   └── keyboardNav.js
            └── buttonGroup
                ├── buttonGroup.html
                └── buttonGroup.js
```

HTML Files:

```html
<template>
    <lightning-button-group>
        <lightning-button></lightning-button>
    </lightning-button-group>
    <foo-list>
        <foo-list-item></foo-list-item>
    </foo-list>
</template>
```

JS Files:

```js
import { something } from "foo/keyboardNav";
```

Compiled HTML Code:

```js
import buttonGroup from "lightning/buttonGroup";
import button from "lightning/button";
import listItem from "foo/listItem";
import list from "foo/list";
function template() {
    // ...
}
export { template };
```

#### Ergonomics

* whenever a user needs to import from a bundle, the user must know the namespace and the bundle name.
  * the module specifier to import from must be constructed by `namespace/bundleName`, where each token is replaced by the same name used in the filesystem structure.
* whenever a user needs to use a component in a html template, the user must know the namespace and the bundle name.
  * the tag name to be used must be constructed by `<namespace-bundle-name>`, all in lowercase where camelCased bundle names should be deconstructed.
* the compilation step will rely on such simple mapping to automatically import any component used in an HTML template, by transforming `<namespace-bundle-name>` into `namespace/bundleName` to be used as the module specifier.
  * custom mapping between tag-name and module specifier should be possible via compiler options.

#### SFDX Compliance

Force.com namespaces [documentation](https://help.salesforce.com/articleView?id=register_namespace_prefix.htm) can:

1. Contain underscores
2. Are case preserving though case-insensitive (eg customer registers `Acme` and the namespace can be referenced as `acme` or `ACME` in the various languages/tech)

```HTML
<template>
    <mynamespace_foo-my-component_bar></mynamespace_foo-my-component_bar>
</template>
```

The compiler can analyze apply the heuristic, and produce the following import statement:

```js
import C1 from "mynamespace_foo/myComponent_bar";`
```

And the platform can readjust the module specifier to match the internal representation, (e.g.: `MyNamespace_Foo/myComponent_bar`) to match the canonical version for bundle in folder `MyNamespace_Foo/myComponent_bar/`. This does not affect the compiler in any way since force.com's namespaces are technically case-insensitive.

#### Pros:

* Complies with existing salesforce platform restrictions around file names per bundle.
* Maps well to existing knowledge around importing or requiring modules from NPM where each namespace is considered a package.
* Importing bundles as libraries (which is the most common case) is trivial (just need the namespace and the bundle name).
* Map nicely with scoped packages (and special packages that we offer today, e.g.: `@apex/`)

#### Cons

* Requires cognitive load to map `namespace` and `bundleName` to a tag-name.
  * compiler errors can help to correct mistakes and guide users.
* New comers who are used to use dashes in their files will have to adjust to their new life without such characters in their files (not an issue for existing Aura Developers since it is pretty much the same).
  * compiler errors can help to correct mistakes and guide users.
* Existing bundles will have to be changed to match the new rules.
  * mechanical process via transpilation and renaming should be possible since only statically analyzable code is subject to these new rules.
* Existing tools (e.g.: language Server, scaffolding, jest resolver, etc) will need to be updated.
* LWC naming scheme is a subset of the force.com scheme. This will require documentation, tooling with clear messages.

#### Edge Cases

1. Bundle name starting with UpperCase:

```HTML
<template>
    <foo--my-component></foo--my-component>
</template>
```

The compiler can analyze the double `-` in the name to apply the heuristic, and produce the following import statement:

```js
import C1 from "foo/MyComponent";`
```
