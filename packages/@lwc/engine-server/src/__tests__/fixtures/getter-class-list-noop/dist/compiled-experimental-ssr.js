import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultStylesheets = undefined;

class GetterClassListNoop extends LightningElement {
  connectedCallback() {
    const {classList} = this;
    expect(classList).not.toBeUndefined();
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new GetterClassListNoop({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, GetterClassListNoop, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-getter-class-list-noop';

export { GetterClassListNoop as default, generateMarkup, tagName };
