import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

class MethodsNoop extends LightningElement {
  connectedCallback() {
    expect(() => this.addEventListener("click", () => {})).not.toThrow();
    expect(() => this.removeEventListener("click", () => {})).not.toThrow();
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new MethodsNoop({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  const tmplFn = fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, MethodsNoop, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-methods-noop';

export { MethodsNoop as default, generateMarkup, tagName };
