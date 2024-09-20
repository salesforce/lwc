import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

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
  const tmplFn = fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, GetterClassListNoop, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-getter-class-list-noop';

export { GetterClassListNoop as default, generateMarkup, tagName };
