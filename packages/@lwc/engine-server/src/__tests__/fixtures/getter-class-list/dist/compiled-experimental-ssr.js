import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

class GetterClassList extends LightningElement {
  connectedCallback() {
    const {classList} = this;
    classList.add("a", "b", "c", "d-e");
    classList.remove("b");
    expect(this.getAttribute("class")).toBe("a c d-e");
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new GetterClassList({
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
  yield* tmplFn(props, attrs, slotted, GetterClassList, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-getter-class-list';

export { GetterClassList as default, generateMarkup, tagName };
