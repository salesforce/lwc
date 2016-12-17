# Raptor compiler

## IMPORTANT NOTE: This is a work in progress. 
## Syntax displayed will probably change. [Play around with it](http://raptor-compiler-repl.sfdc.es/) and give us feedback.

Raptor compiler transforms standard HTML and Javascript Classes in an optimized javascript bundle that can be consumed by the raptor engine.

**In**

##### Template
```html
<template>
  <section class="slds">{helloworld}</section>
</template>
```

##### Class
```js
export default class Test {
  constructor () {}
  helloworld = 'Hi!';
}
```

**Out**

```js
var _tmpl = function ({ i, f, e, h, v, s}) { 
  return h(
    "section",
    { "class" : "slds" },
    [s(this.helloworld)]
  );
};

class Test {
  constructor() {}

  render(p) {
    return _tmpl.call(this, p);
  }

}
Test.templateUsedProps = ["helloworld"];
Test.tagName = 'ns-test';
Test.publicProps = {
   helloworld: 'Hi!'
};

export default Test;
```

Try out our [REPL](http://raptor-compiler-repl.sfdc.es/) to play with the compiler.


# HTML, directives and syntactic sugar
Raptor is all-in with the standards, and strives to be fully compliant with HTML & Javascript specs, and only use constructs that are (or will be soon) part of the web platform.

## Template

In order to write a raptor template, your root should be a `<template>` tag:
```HTML
<template>
    ...
</template>
```
**Note:** For now only one root child will be allowed inside the template, we might relax this invariant later on.

## Directives (syntactic sugar)
Directives help bring some fundamental JS constructs to the declarative markup. Note that we use special symbol `:` to differenciate this special attributes (which is of course HTML compliant)

**If statement**
```HTML
<template>
    <section>
        <p eval:if="myProp"></p>
    </section>
</template>
```

**Else statement (or ternary operator)**
```HTML
<template>
    <section>
        <p eval:if="myProp"></p>
        <p eval:else></p>
    </section>
</template>
```

**For loops**
```HTML
<template>
    <ul>
        <li repeat:for="item of items">{item.foo}</li>
    </ul>
</template>
```

**Set (bind properties)**
```HTML
<template>
    <section set:class="myCustomClass">
    </section>
</template>
```
**Bind (bind functions to the intance)**
```HTML
<template>
    <a href="#" bind:onclick="handlerClick">Foo</a>
</template>
```
**Note:** The only difference between `set` and `bind` is that bind actually does the binding to the component instance.

# Javascript Classes
For building a component we export regular Javascript classes.

```js
export default class Foo {
  constructor () {}
}
```

## Public properties
Use public fields to make your props `public`

```js
export default class Foo {
  constructor () {}
  myPublicProp = 3;
}
```

## Public methods
```js
export default class Foo {
  constructor () {}

  @method
  myPublicMethod () { ... }
}
```
**Note:** This might change since decorators is still in Stage2, and we might not endup needing/using them.

# Development

## Prerequisists

Add this to your bash configuration:

```
export PATH="./node_modules/.bin:$PATH"
```

Or alternatively you can install globally `babel-cli` and `lerna` packages:

```
$ npm install -g babel-cli
$ npm install -g lerna
``` 
With all global binaries available you can either run `npm install` or: 

```
yarn install
``` 

Note that this repo contains several sub-packages and we use `lerna` to build them all `npm install` will them all.

## Running tests

`lerna run test`

## Test the compiler:

To run the compiler with an example:
```
cd packages/raptor-compiler-core
./bin/cli.js
```

# Feedback

This is a work in progress so please feel free to raise ans issue or give us feedback!
