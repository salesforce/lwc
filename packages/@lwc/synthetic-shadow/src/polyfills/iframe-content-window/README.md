# HTMLIframeElement.prototype.contentWindow patch

This patch enables the usage of `iframe.contentWindow` reference, in code compiled for compat-mode.

## Motivation

This is needed for compat mode to function because we don't use a real WeakMap,
instead compat will attempt to extract the proxy internal slot out of a cross
domain iframe, just to see if it is a proxy or not, and that will throw. To prevent
that from throwing, we just protect it by wrapping all iframes.

Specifically, this is a problem when in your code, you have something like this:

```js
class foo extends LightningElement {

    doSomethingWithIFrame() {
        var i = this.template.querySelector('iframe');
        i.contentWindow.postMessage(...);
    }

}
```

In code compiled with compat-mode, the code will attempt to detect if `i.contentWindow` is a proxy, before trying to access `postMessage`, but at that point, the transformed code will try to check if that object contains a particular property (the proxy identification token), in which case, a cross-origin iframe will throw an error. This patch prevents that error from happening.
