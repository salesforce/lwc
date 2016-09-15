# Reactive Programming in Aura

* The reality is that nearly zero data in SFDC is immutable.
 * Record data, including record type, is mutable.
 * Metadata, like DescribeLayout, DescribeSObject(s), DescribeGlobal, is mutable. Even a custom object's devname is mutable.
 * A user's id is immutable. Same with an org id (except when an org is migrated).
 * User's locale and timezone are mutable.
* We need to update our paradigm from a static _fetch and display_ to a _subscribe, display, and react to change_. Aka we need to move to a _reactive paradigm_.
* This is becoming a standard or best practice is many UI frameworks. Like React's Relay/Flux/Redux. Like Vue. Like Om.next. Like Backbone.js.
 * Immutable structures are often coupled with this though it isn't a prerequisite. Immutable data does provide many benefits but imposes additional constraints.

## Best Practices

* Attribute values must (?) not be changed by the class itself.
 * Attributes are provided by the container component.
 * When the values change they will be _re-set_ overwriting any local change (assuming the attribute set was even mutable).
 * `Q: How to specify initial/default values when the container doesn't provide them?`


* To use a value derived from an attribute define a getter
 ```js
   export default class {
     @attribute
     var a;
     constructor(attrs) {
     }
     get b() {
       return this.a + 1;
     }
  }
 ```


* To use a mutable value derived from an attribute define a new class property
```js
  export default class {
     @attribute
     var a;
     constructor(attrs) {
       this.b = expensiveFunction(attrs.a)
     }
   }
 ```



## Immutability
