import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultStylesheets = undefined;

class MethodSetAttribute extends LightningElement {
  connectedCallback() {
    this.setAttribute("data-null", null);
    this.setAttribute("data-boolean", true);
    this.setAttribute("data-number", 1);
    this.setAttribute("data-string", "test");
    this.setAttribute("data-empty-string", "");
    this.setAttribute("data-override", "original");
    this.setAttribute("data-override", "override");
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new MethodSetAttribute({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, MethodSetAttribute, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-method-set-attribute';

export { MethodSetAttribute as default, generateMarkup, tagName };
