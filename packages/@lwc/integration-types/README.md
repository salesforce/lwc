# @lwc/integration-types

Contains sample usage of LWC exports, in order to validate the exported types.

## Playground

The `/playground/` directory contains a fork of the root [playground](../../../playground/), which can be used for components that are complex enough that you'd want to see them running to validate their correctness. Note that for the purposes of type checking, only TypeScript files are required; the rest of the files are just there to help with the manual validation.

## Assertions

In most cases, simply using the exposed interfaces is sufficient to make positive assertions about the types. You can also use the [`satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) to validate that a type, well, satisfies an expectation. For example, you could write `MyComponent.renderMode satisfies 'light' | 'shadow'` to ensure that the render mode is correctly set.

To make a negative assertion, write invalid code and prefix it with `// @ts-expect-error [description]`. This will cause TypeScript to ignore any errors that occur and _cause_ an error if it doesn't encounter any.
