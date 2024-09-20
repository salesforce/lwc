import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

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
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class DefaultComponentName extends LightningElement {
  connectedCallback() {
    this.ariaBusy = "true";
    this.ariaActiveDescendant = "foo";
  }
}
const __REFLECTED_PROPS__ = ["ariaBusy", "ariaActiveDescendant"];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  attrs = {
    ...attrs,
    get "aria-busy"() {
      return props.ariaBusy;
    },
    get "aria-activedescendant"() {
      return props.ariaActiveDescendant;
    }
  };  const instance = new DefaultComponentName({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, DefaultComponentName, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-cmp';

export { DefaultComponentName as default, generateMarkup, tagName };
