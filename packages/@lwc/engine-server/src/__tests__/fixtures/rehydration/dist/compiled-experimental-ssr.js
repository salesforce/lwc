import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

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
  const a = instance.reactive;
  if (typeof a === 'string') {
    yield a === '' ? '\u200D' : htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Rehydration extends LightningElement {
  reactive = 0;
  connectedCallback() {
    Promise.resolve().then(() => {
      this.reactive = 1;
    });
  }
  render() {
    if (!this.rendered) {
      this.rendered = true;
    } else {
      throw new Error("Reactivity should be disabled on SSR.");
    }
    return tmpl;
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Rehydration({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = instance.render() ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Rehydration, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-rehydration';

export { Rehydration as default, generateMarkup, tagName };
