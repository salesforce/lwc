import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

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
  const tmplFn = fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, MethodSetAttribute, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-method-set-attribute';

export { MethodSetAttribute as default, generateMarkup, tagName };
