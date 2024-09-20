import { LightningElement, fallbackTmpl, renderAttrs } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-18knqdmvncr";
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
  yield "<ul";
  yield stylesheetScopeTokenClass;
  yield ">";
  for (let [__unused__, hook] of Object.entries(instance.hooks ?? ({}))) {
    yield "<li";
    yield stylesheetScopeTokenClass;
    yield ">";
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
    yield "<li";
    yield stylesheetScopeTokenClass;
    yield ">static text</li>";
  }
  yield "</ul>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

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
  const tmplFn = instance.render() ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, LifecycleHooks, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-lifecycle-hooks';

export { LifecycleHooks as default, generateMarkup, tagName };
