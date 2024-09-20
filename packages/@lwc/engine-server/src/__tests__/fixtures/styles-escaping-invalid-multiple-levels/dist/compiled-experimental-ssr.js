import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  return "[data-foo=\"<style>yolo</style><style>haha</style>\"]" + shadowSelector + " {color: red;}";
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
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Styles extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Styles({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Styles, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-styles';

export { Styles as default, generateMarkup, tagName };
