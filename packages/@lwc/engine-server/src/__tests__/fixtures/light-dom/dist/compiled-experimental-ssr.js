import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {color: red;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets = [stylesheet];

async function* tmpl(props, attrs, slotted, Cmp, instance, stylesheets) {
  for (const stylesheet of stylesheets ?? []) {
    const token = null;
    const useActualHostSelector = true;
    const useNativeDirPseudoclass = null;
    yield '<style type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<p>Hello</p>";
}

class Basic extends LightningElement {
  static renderMode = "light";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Basic({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Basic, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-basic';

export { Basic as default, generateMarkup, tagName };
