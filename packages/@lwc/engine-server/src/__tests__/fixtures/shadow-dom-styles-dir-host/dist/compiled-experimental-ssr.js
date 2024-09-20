import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " {margin-left: 0;}" + ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "color: red;}";
  /*LWC compiler v8.1.0*/
}
var defaultStylesheets = [stylesheet];

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
  yield "<p>Hello</p>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Basic extends LightningElement {}
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
const features = [];

export { Basic as default, features, generateMarkup, tagName };
