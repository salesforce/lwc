import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultStylesheets = undefined;

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, GetterClassList, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-getter-class-list';

export { GetterClassList as default, generateMarkup, tagName };
