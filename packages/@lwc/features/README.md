# Features

[RFC](https://github.com/salesforce/lwc-rfcs/blob/master/text/0111-feature-flags.md)

## Compile-time flags

## Runtime flags

Runtime flags can be enabled or disabled by setting a boolean value for that
flag in `globalThis.LWC_config.features`. If the flag is not explicitly
configured, the feature is disabled by default. This configuration object
must appear before the engine is initialized and should be defined at the
application layer.

### Limitations

#### Must be all uppercase

```
// Does not work
if (enableFoo) {
    ...
}

// Does work
if (ENABLE_FOO) {
    ...
}
```

#### Only works with if-statements

```
// Does not work
const foo = ENABLE_FOO ? 1 : 2;

// Does work
let foo;
if (ENABLE_FOO) {
    foo = 1;
} else {
    foo = 2;
}
```

#### Only works with identifiers

```
// Does not work
if (isTrue(ENABLE_AWESOME_FEATURE)) {
    // awesome feature
}

// Does work
if (ENABLE_AWESOME_FEATURE) {
    // awesome feature
}
```

#### Initialization code cannot be tested

Toggling the value of `ENABLE_FOO` during a test will not change the return
value of `getFooValue`.

```
import { ENABLE_FOO } from '@lwc/features';

let foo;
if (ENABLE_FOO) {
    foo = 1;
} else {
    foo = 2;
}

function getFooValue() {
    return foo;
}
```
