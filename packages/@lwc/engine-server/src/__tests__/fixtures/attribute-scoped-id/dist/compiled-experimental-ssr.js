import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-7km2jut57f";
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
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "sanjo" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.attrValue;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  yield "><a";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "anchor-fragment-url" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield ">fragment url</a><a";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "anchor-relative-url" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield ">relative url</a><a";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "anchor-absolute-url" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield ">absolute url</a></div><div";
  yield stylesheetScopeTokenClass;
  yield "><map";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "name" + '="' + prefix + "blackdot" + '"';
  }
  yield "><area";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "area-fragment-url" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    yield ' ' + "shape" + '="' + prefix + "circle" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "coords" + '="' + prefix + "75,75,75" + '"';
  }
  yield "><area";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "area-relative-url" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    yield ' ' + "shape" + '="' + prefix + "circle" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "coords" + '="' + prefix + "75,75,75" + '"';
  }
  yield "><area";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "area-absolute-url" + '"';
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  {
    const prefix = '';
    yield ' ' + "shape" + '="' + prefix + "circle" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "coords" + '="' + prefix + "75,75,75" + '"';
  }
  yield "></map></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class HrefDynamic extends LightningElement {
  get attrValue() {
    return "sanjo";
  }
  get fragmentUrl() {
    return "#sanjo";
  }
  get relativeUrl() {
    return "/shijo#kawaramachi";
  }
  get absoluteUrl() {
    return "https://www.salesforce.com/jp/";
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new HrefDynamic({
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
  yield* tmplFn(props, attrs, slotted, HrefDynamic, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-scoped-id';

export { HrefDynamic as default, generateMarkup, tagName };
