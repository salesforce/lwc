import { LightningElement, fallbackTmpl, renderAttrs } from '@lwc/ssr-runtime';

var defaultStylesheets = undefined;

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("." + token) : "";
  return "p" + shadowSelector + " {background-color: blue;}";
  /*LWC compiler v8.1.0*/
}
stylesheet.$scoped$ = true;
var defaultScopedStylesheets = [stylesheet];

const stylesheetScopeToken = "lwc-2it5vhebv0i";
const hasScopedStylesheets = defaultScopedStylesheets && defaultScopedStylesheets.length > 0;
const stylesheetScopeTokenClass = hasScopedStylesheets ? ` class="${stylesheetScopeToken}"` : '';
const stylesheetScopeTokenHostClass = hasScopedStylesheets ? ` class="${stylesheetScopeToken}-host"` : '';
async function* tmpl(props, attrs, slotted, Cmp, instance) {
  const stylesheets = [defaultStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<p";
  yield stylesheetScopeTokenClass;
  yield ">Hello</p>";
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class Basic extends LightningElement {
  static renderMode = "light";
  render() {
    return tmpl;
  }
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
  const tmplFn = instance.render() ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Basic, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-basic';
const features = [];

export { Basic as default, features, generateMarkup, tagName };
