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
  yield "<ul>";
  for (let [__unused__, hook] of Object.entries(instance.hooks ?? ({}))) {
    yield "<li>";
    const a = hook;
    if (typeof a === 'string') {
      yield a === '' ? '\u200D' : htmlEscape(a);
    } else if (typeof a === 'number') {
      yield a.toString();
    } else {
      yield htmlEscape((a ?? '').toString());
    }
    yield "</li>";
  }
  for (let [__unused__, hook] of Object.entries(instance.hooks ?? ({}))) {
    yield "<li>static text</li>";
  }
  yield "</ul>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class LifecycleHooks extends LightningElement {
  hooks = [];
  constructor(propsAvailableAtConstruction) {
    super(propsAvailableAtConstruction);
    this.hooks.push("constructor");
  }
  connectedCallback() {
    this.hooks.push("connectedCallback");
  }
  render() {
    this.hooks.push("render");
    return tmpl;
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new LifecycleHooks({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = instance.render() ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, LifecycleHooks, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-lifecycle-hooks';

export { LifecycleHooks as default, generateMarkup, tagName };
