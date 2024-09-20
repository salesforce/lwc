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
  yield "<div";
  {
    const attrOrPropValue = instance.customStyles;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Component extends LightningElement {
  color = "blue";
  margin = 8;
  get customStyles() {
    return `
            color: ${this.color};
            margin: ${this.margin}px;
        `;
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Component({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Component, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-component';

export { Component as default, generateMarkup, tagName };
