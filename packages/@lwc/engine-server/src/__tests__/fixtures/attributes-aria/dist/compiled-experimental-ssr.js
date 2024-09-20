import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-50n0bc2kaf";
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
  yield "<span";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "id" + '="' + prefix + "label-id" + '"';
  }
  yield ">This is a section</span><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "aria-describedby" + '="' + prefix + "label-id" + '"';
  }
  yield ">I am section</div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "role" + '="' + prefix + "progressbar" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuemin" + '="' + prefix + "0" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuemax" + '="' + prefix + "100" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuenow" + '="' + prefix + "20" + '"';
  }
  yield ">I am a progress bar</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class AttributesAria extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new AttributesAria({
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
  yield* tmplFn(props, attrs, slotted, AttributesAria, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attributes-aria';

export { AttributesAria as default, generateMarkup, tagName };
