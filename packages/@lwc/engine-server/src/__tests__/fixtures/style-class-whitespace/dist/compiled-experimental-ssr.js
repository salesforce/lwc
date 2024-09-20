import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultStylesheets = undefined;

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
  yield "<div style=\"color: red !important\"></div><div style=\"color: red !important\"></div><div style=\"color: red  !important\"></div><div style=\"color: red  !important\"></div><div style=\"color: red ! important\"></div><div style=\"color: red ! important\"></div><div style=\"color: red !IMPORTANT\"></div><div style=\"color: red !IMPORTANT\"></div><div style=\"color: red  !IMPORTANT\"></div><div style=\"color: red  !IMPORTANT\"></div><div style=\"color: red ! IMPORTANT\"></div><div style=\"color: red ! IMPORTANT\"></div><div style=\"color  :  red  !  IMPORTANT  ;\"></div><div style=\"color  :  red  !  IMPORTAnt  ;\"></div><div style=\"color  :  red    ;\"></div><div style=\"color: red; background-color: aqua\"></div><div style=\"color: red ; background-color: aqua;\"></div><div style=\"--its-a-tab:\tred    ;\"></div><div style=\"--its-a-tab-and-a-space:\t red    ;\"></div><div class=\" boo \"></div><div class=\"\tboo\"></div><div class=\" foo bar   \"></div><div class=\" foo  bar  baz \"></div><div class=\"foo   bar\"></div><div class=\"\tfoo  bar \"></div><div class=\" foo\tbar \"></div><div class=\" foo bar\t\"></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Foo extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Foo({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Foo, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-foo';

export { Foo as default, generateMarkup, tagName };
