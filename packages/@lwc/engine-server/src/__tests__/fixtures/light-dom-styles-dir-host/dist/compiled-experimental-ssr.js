import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

function stylesheet$1(token, useActualHostSelector, useNativeDirPseudoclass) {
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " {margin-left: 0;}" + ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "color: red;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets = [stylesheet$1];

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var hostSelector = token ? ("." + token + "-host") : "";
  return (useNativeDirPseudoclass ? '' : '[dir="ltr"]') + " " + (useNativeDirPseudoclass ? ':dir(ltr)' : '') + " {margin-right: 0;}" + ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "color: blue;}";
  /*LWC compiler v8.1.0*/
}
stylesheet.$scoped$ = true;
var defaultScopedStylesheets = [stylesheet];

const stylesheetScopeToken = "lwc-1rssj1tib70";
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
  const tmplFn = tmpl ?? fallbackTmpl;
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
