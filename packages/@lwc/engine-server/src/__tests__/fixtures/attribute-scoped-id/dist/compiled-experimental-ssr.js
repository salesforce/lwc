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
  yield "<div class=\"sanjo\"";
  {
    const attrOrPropValue = instance.attrValue;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></div><div><a class=\"anchor-fragment-url\"";
  {
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  {
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield ">fragment url</a><a class=\"anchor-relative-url\"";
  {
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  {
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield ">relative url</a><a class=\"anchor-absolute-url\"";
  {
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  {
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield ">absolute url</a></div><div><map name=\"blackdot\"><area class=\"area-fragment-url\"";
  {
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  {
    const attrOrPropValue = instance.fragmentUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield " shape=\"circle\" coords=\"75,75,75\"><area class=\"area-relative-url\"";
  {
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  {
    const attrOrPropValue = instance.relativeUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield " shape=\"circle\" coords=\"75,75,75\"><area class=\"area-absolute-url\"";
  {
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "href";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  {
    const attrOrPropValue = instance.absoluteUrl;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "data-id";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield " shape=\"circle\" coords=\"75,75,75\"></map></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, HrefDynamic, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-scoped-id';

export { HrefDynamic as default, generateMarkup, tagName };
