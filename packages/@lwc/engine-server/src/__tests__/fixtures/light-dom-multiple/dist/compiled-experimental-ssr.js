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

function stylesheet$1(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {color: saddlebrown;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets$1 = [stylesheet$1];

async function* tmpl$2(props, attrs, slotted, Cmp, instance, stylesheets) {
  for (const stylesheet of stylesheets ?? []) {
    const token = null;
    const useActualHostSelector = true;
    const useNativeDirPseudoclass = null;
    yield '<style type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<p>one</p>";
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$2 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, One, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "p" + shadowSelector + " {color: goldenrod;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets = [stylesheet];

async function* tmpl$1(props, attrs, slotted, Cmp, instance, stylesheets) {
  for (const stylesheet of stylesheets ?? []) {
    const token = null;
    const useActualHostSelector = true;
    const useNativeDirPseudoclass = null;
    yield '<style type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<p>two</p>";
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Two, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Parent, instance, defaultStylesheets$2);
  yield `</${tagName}>`;
}

const tagName = 'x-parent';

export { Parent as default, generateMarkup, tagName };
