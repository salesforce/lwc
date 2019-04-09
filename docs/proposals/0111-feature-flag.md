# RFC: Feature Flag

## Status

- Start Date: 2019-03-01
- RFC PR: TBD

## Summary

This RFC defines the infrastructure pieces to support feature flag to enable experimentation and progressive development inside LWC core packages.

## Motivation

* It is becoming more difficult to add new features to engine and compiler due to the potential breaking hazard.
* Some features need to period of adaptation and testing before we can allow users-of-LWC to consume them, but today the only option is to keep them in a separate branch forever.
* Performance implications of a change is sometimes difficult to assess without hitting production servers, but at that point, it is too late since everyone has access to the same set of features today.
* Branching code logic for certain features (e.g.: slotchange event) is becoming more complicated over time, and having that in the actual code makes the code less readable.

## Goals of this proposal

* Define strategy to support incremental development of features without compromising the stability of the platform and breakages for users-of-LWC.
* Define ways to keep experimental and unstable code-branches out of production artifacts.
* Define ways to turn certain features on and off at runtime.
* Define ways to turn certain features on permanently on production artifacts without unnecessary branching logic.
* Polyfilling new shadow dom semantics is almost impossible considering that we know is going to break users-of-LWC at some point.

## Prior Art

EmberJS is probably the framework with more success when it comes to backward compatible changes. We can take a page from their book when it comes to introducing new features via Feature Flags:

* https://guides.emberjs.com/release/configuring-ember/feature-flags/

## Proposal

New features are added within conditional statements.

Code behind these flags can be conditionally enabled (or completely removed) based on your project's configuration. This allows newly developed features to be selectively released when the LWC platform considers them ready for production use.

### Flagging Details

The flag status in the generated build is controlled by the `@lwc/config` package. This package exports a list of all available features and their current status.

A feature can have one of a three flags:

* `true` - The feature is present and enabled: the code behind the flag is always enabled in the generated build.
* `null` - The feature is present but disabled in the build output. It must be enabled at runtime.
* `false` - The feature is entirely disabled: the code behind the flag is not present in the generated build.

The process of removing the feature flags from the resulting build output is handled by the LWC's build step.

### When you need to use a feature flag?

If you intend to make "substantial" changes to LWC or any other package inside this repository or their documentation. What constitutes a "substantial" change is evolving based on community norms, but may include the following:

* A new feature that creates new API surface area, and would require a feature flag if introduced.
* The removal of features that already shipped without a flag.
* The introduction of new idiomatic usage or conventions, even if they do not include code changes to LWC itself.
* Polyfill or patch of browsers APIs to implement shadow dom semantics in our synthetic shadow DOM polyfill.

Some changes do not require an RFC:

* Rephrasing, reorganizing or refactoring
* Addition or removal of warnings
* Additions that strictly improve objective, numerical quality criteria (speedup, better browser support)
* Additions only likely to be noticed by other platforms implementing LWC, invisible to component authors.
* Polyfilling new language and browser features after they get standardized.

## Detailed Design

### Using features in Code

In your code, you must import the `feature` method from the config package to branch your code. We have two options:

#### If/Then/Else Branching

```js
import { feature } from "@lwc/config";
if (feature('foo')) {
    runExtra();
}
```

which gets compiled to one of the following options:

```js
import { feature } from "@lwc/config";
{   // foo feature is configured as `true`
    runExtra();
}
```

Note: the block is needed in case the if condition declares some binding.

or,

```js
import { feature } from "@lwc/config";
// foo feature is configured as `false`
```

or preserves the original code if `"foo"` feature is configured as `null` which means it is a runtime decision.

This option is very straight forward, but it is error prompt since static analysis is more complicated. Also, transformation is more complicated as well in the compiler since there are many ways the expression can be used.

#### Arrow Function Branching

```js
import { feature } from "@lwc/config";
feature('foo', _ => {
    // do something...
});
```

The output is the exact same as the previous option, but overall, this feature has one main benefit, it is a lot easier to identify, since the syntax is always the same.

### Enabling At Build Time

TBD

### Enabling At Runtime

This could be achieve via the global LWC configuration, e.g.:

```js
// client side configuration
LWC_config = {
    features: {
        foo: true,
        bar: false, // false is always the default value
    },
};
```

It is important to notice that this configuration is a global variable, and must be evaluated before the LWC runs.

It is also important to notice that only features that are configured as `null` on the LWC multi-package repository can be enabled or disabled on the client side. If the feature is marked as `true`, it will be always present independently of the `LWC_config` value, while those marked as `false` are just not present at runtime, which means attempting to configure those via `LWC_config` will do nothing.

#### Testing

During test phase, all features will be compiled out as runtime optional (equivalent to setting them to `null` value). This guarantees that we can have different tests for the different branching logic. With that in mind, you can use a test helper function to enable certain features per test, e.g.:

```js
import { enableFeature } from '@salesforce/lwc-test-support'; // bikeshed required here

enableFeature('foo'); // enabling feature foo for this test (we don't need a way to disable them)

describe('foo', () => {
    test('should ...', () => {
        // ...
    });
});
```

### Extensibility

It is possible that `@lwc/config` can be used beyond this package, so other parts of the platform can implement a similar solution for their own features. This might include components, which means that the LWC compiler will have to understand the transformation as well.

## Alternatives

TBD

## How we teach this ?

TBD