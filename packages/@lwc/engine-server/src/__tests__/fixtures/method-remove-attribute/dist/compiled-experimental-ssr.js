import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultStylesheets = undefined;

class MethodRemoveAttribute extends LightningElement {
  connectedCallback() {
    this.setAttribute("data-a", "");
    this.setAttribute("data-b", "");
    this.setAttribute("data-c", "");
    this.removeAttribute("data-b");
    this.removeAttribute("data-unknown");
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new MethodRemoveAttribute({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, MethodRemoveAttribute, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-method-remove-attribute';

export { MethodRemoveAttribute as default, generateMarkup, tagName };
