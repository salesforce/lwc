import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-14rotbo8rb";
const stylesheetScopeTokenClass = '';
const stylesheetScopeTokenHostClass = '';
async function* tmpl(props, attrs, slotted, Cmp, instance) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  const stylesheets = [defaultScopedStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

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
  const tmplFn = tmpl ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, DefaultComponentName, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-cmp';

export { DefaultComponentName as default, generateMarkup, tagName };
