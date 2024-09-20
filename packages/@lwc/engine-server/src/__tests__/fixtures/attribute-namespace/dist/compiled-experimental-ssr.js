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
  yield "<a";
  {
    const attrOrPropValue = instance.lang;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "xml:lang";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></a><svg><image";
  {
    const attrOrPropValue = instance.title;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "xlink:title";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></image></svg>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class DefaultComponentName extends LightningElement {
  lang = "french";
  title = "bonjour";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new DefaultComponentName({
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

const tagName = 'x-attribute-namespace';

export { DefaultComponentName as default, generateMarkup, tagName };
