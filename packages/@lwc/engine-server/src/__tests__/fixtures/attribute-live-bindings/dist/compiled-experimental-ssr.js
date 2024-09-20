import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-7cjmp20an6i";
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
  yield "<p";
  yield stylesheetScopeTokenClass;
  yield ">Checked: <input";
  {
    const prefix = '';
    yield ' ' + "type" + '="' + prefix + "checkbox" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.checked;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "checked";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></p><p";
  yield stylesheetScopeTokenClass;
  yield ">Unchecked: <input";
  {
    const prefix = '';
    yield ' ' + "type" + '="' + prefix + "checkbox" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.unchecked;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "checked";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></p><p";
  yield stylesheetScopeTokenClass;
  yield ">Undefined value: <input";
  {
    const prefix = '';
    yield ' ' + "type" + '="' + prefix + "text" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.undefinedValue;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "value";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></p><p";
  yield stylesheetScopeTokenClass;
  yield ">Null value: <input";
  {
    const prefix = '';
    yield ' ' + "type" + '="' + prefix + "text" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.nullValue;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "value";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></p><p";
  yield stylesheetScopeTokenClass;
  yield ">String value: <input";
  {
    const prefix = '';
    yield ' ' + "type" + '="' + prefix + "text" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.stringValue;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "value";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></p>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class AttributeLiveBindings extends LightningElement {
  checked = true;
  unchecked = false;
  nullValue = null;
  undefinedValue = null;
  stringValue = "test";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new AttributeLiveBindings({
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
  yield* tmplFn(props, attrs, slotted, AttributeLiveBindings, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-live-bindings';

export { AttributeLiveBindings as default, generateMarkup, tagName };
