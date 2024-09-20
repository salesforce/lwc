import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultStylesheets = undefined;

function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("." + token) : "";
  return "div" + shadowSelector + " {color: black;}div.kree" + shadowSelector + " {color: blue;}";
  /*LWC compiler v8.1.0*/
}
stylesheet.$scoped$ = true;
var defaultScopedStylesheets = [stylesheet];

const stylesheetScopeToken = "lwc-47oqt8q93b2";
const hasScopedStylesheets = defaultScopedStylesheets && defaultScopedStylesheets.length > 0;
const stylesheetScopeTokenClass = hasScopedStylesheets ? ` class="${stylesheetScopeToken}"` : '';
const stylesheetScopeTokenHostClass = hasScopedStylesheets ? ` class="${stylesheetScopeToken}-host"` : '';
const stylesheetScopeTokenClassPrefix = hasScopedStylesheets ? stylesheetScopeToken + ' ' : '';
async function* tmpl(props, attrs, slotted, Cmp, instance) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  const stylesheets = [defaultStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<div";
  {
    const prefix = stylesheetScopeTokenClassPrefix || '';
    const attrOrPropValue = instance.dynamicClass;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "class";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield ">In the middle of my backswing?!</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class AttributeDynamicWithScopedCss extends LightningElement {
  dynamicClass = "kree";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new AttributeDynamicWithScopedCss({
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
  yield* tmplFn(props, attrs, slotted, AttributeDynamicWithScopedCss, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-dynamic-with-scoped-css';

export { AttributeDynamicWithScopedCss as default, generateMarkup, tagName };
