import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultStylesheets = undefined;

class MethodsUnsupported extends LightningElement {
  connectedCallback() {
    expect(() => this.dispatchEvent(new CustomEvent("foo"))).toThrowError("\"dispatchEvent\" is not supported in this environment");
    expect(() => this.getBoundingClientRect()).toThrowError("\"getBoundingClientRect\" is not supported in this environment");
    expect(() => this.querySelector(".foo")).toThrowError("\"querySelector\" is not supported in this environment");
    expect(() => this.querySelectorAll(".foo")).toThrowError("\"querySelectorAll\" is not supported in this environment");
    expect(() => this.getElementsByTagName("x-foo")).toThrowError("\"getElementsByTagName\" is not supported in this environment");
    expect(() => this.getElementsByClassName("foo")).toThrowError("\"getElementsByClassName\" is not supported in this environment");
    expect(() => this.style).toThrowError("\"style\" is not supported in this environment");
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new MethodsUnsupported({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, MethodsUnsupported, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-methods-unsupported';

export { MethodsUnsupported as default, generateMarkup, tagName };
