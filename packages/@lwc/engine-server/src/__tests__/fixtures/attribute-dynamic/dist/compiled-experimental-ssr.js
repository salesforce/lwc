import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-4i3erlgj01d";
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
  yield "<div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    const attrOrPropValue = instance.dataAttribute;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-foo";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  {
    const prefix = '';
    const attrOrPropValue = instance.classAttribute;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "class";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    const attrOrPropValue = instance.styleAttribute;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  {
    const prefix = '';
    const attrOrPropValue = instance.classAttribute;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "class";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.styleAttribute;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.dataAttribute;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-foo";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class AttributeDynamic extends LightningElement {
  classAttribute = "foo";
  dataAttribute = "foo";
  styleAttribute = "color: red;";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new AttributeDynamic({
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
  yield* tmplFn(props, attrs, slotted, AttributeDynamic, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-dynamic';

export { AttributeDynamic as default, generateMarkup, tagName };
