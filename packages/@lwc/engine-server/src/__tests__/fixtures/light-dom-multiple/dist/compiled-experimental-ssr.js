import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';

function stylesheet$3(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {background-color: blue;}";
  /*LWC compiler v8.1.0*/
}
var stylesheet0 = [stylesheet$3];

function stylesheet$2(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {color: red;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets$2 = [stylesheet0, stylesheet$2];

var defaultScopedStylesheets = undefined;

function stylesheet$1(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {color: saddlebrown;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets$1 = [stylesheet$1];

const stylesheetScopeToken$2 = "lwc-2c15n1201lc";
const stylesheetScopeTokenClass$2 = '';
const stylesheetScopeTokenHostClass$2 = '';
async function* tmpl$2(props, attrs, slotted, Cmp, instance) {
  const stylesheets = [defaultStylesheets$1, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken$2 : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass$2 + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<p";
  yield stylesheetScopeTokenClass$2;
  yield ">one</p>";
}
tmpl$2.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$2;

class One extends LightningElement {
  static renderMode = "light";
}
const __REFLECTED_PROPS__$2 = [];
async function* generateMarkup$2(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new One({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$2, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  const tmplFn = tmpl$2 ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, One, instance);
  yield `</${tagName}>`;
}

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {color: goldenrod;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets = [stylesheet];

const stylesheetScopeToken$1 = "lwc-7r2h5lcc";
const stylesheetScopeTokenClass$1 = '';
const stylesheetScopeTokenHostClass$1 = '';
async function* tmpl$1(props, attrs, slotted, Cmp, instance) {
  const stylesheets = [defaultStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken$1 : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass$1 + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<p";
  yield stylesheetScopeTokenClass$1;
  yield ">two</p>";
}
tmpl$1.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$1;

class Two extends LightningElement {
  static renderMode = "light";
}
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Two({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$1, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Two, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken = "lwc-ts1rr7v761";
const stylesheetScopeTokenClass = '';
const stylesheetScopeTokenHostClass = '';
async function* tmpl(props, attrs, slotted, Cmp, instance) {
  const stylesheets = [defaultStylesheets$2, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
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
  {
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$2("x-one", childProps, childAttrs, childSlottedContentGenerators);
  }
  {
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-two", childProps, childAttrs, childSlottedContentGenerators);
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class Parent extends LightningElement {
  static renderMode = "light";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Parent({
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
  yield* tmplFn(props, attrs, slotted, Parent, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-parent';

export { Parent as default, generateMarkup, tagName };
