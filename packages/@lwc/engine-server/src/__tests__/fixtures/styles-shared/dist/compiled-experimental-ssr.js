import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';

function stylesheet$2(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "div" + shadowSelector + " {border: 1px solid turquoise;}";
  /*LWC compiler v8.1.0*/
}
var stylesheet0 = [stylesheet$2];

function stylesheet$1(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "div" + shadowSelector + " {background: blue;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets$1 = [stylesheet0, stylesheet$1];

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "div" + shadowSelector + " {color: red;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets = [stylesheet0, stylesheet];

async function* tmpl$1(props, attrs, slotted, Cmp, instance, stylesheets) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  for (const stylesheet of stylesheets ?? []) {
    const token = null;
    const useActualHostSelector = true;
    const useNativeDirPseudoclass = null;
    yield '<style type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<div>Hello child</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

let DefaultComponentName$1 = class DefaultComponentName extends LightningElement {};
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new DefaultComponentName$1({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$1, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, DefaultComponentName$1, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

async function* tmpl(props, attrs, slotted, Cmp, instance, stylesheets) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  for (const stylesheet of stylesheets ?? []) {
    const token = null;
    const useActualHostSelector = true;
    const useNativeDirPseudoclass = null;
    yield '<style type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  {
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  yield "<div>Hello parent</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class DefaultComponentName extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new DefaultComponentName({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, DefaultComponentName, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

const tagName = 'x-parent';

export { DefaultComponentName as default, generateMarkup, tagName };
