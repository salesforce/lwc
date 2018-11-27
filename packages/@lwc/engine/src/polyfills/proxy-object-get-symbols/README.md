# Object.getOwnPropertySymbols polyfill

This polyfill filters out internal symbols when user executes Object.getOwnPropertySymbols(). Allowing user to access the internal symbols will give them access to internal information that can be vulnerable if exposed.

Repro:
```js
class Foo extends LightningElement {
    renderedCallback() {
        const vm = Object.getOwnPropertySymbols(this)[0];
        console.log(this[vm].elm.__proto__.toString());
    }
}
```