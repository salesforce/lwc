import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultStylesheets$1 = undefined;

var defaultStylesheets = undefined;

async function* tmpl$1(props, attrs, slotted, Cmp, instance, stylesheets) {
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
  yield "<p>Value: ";
  const a = instance.dataAttr;
  if (typeof a === 'string') {
    yield htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield "</p>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Child extends LightningElement {
  get dataAttr() {
    return String(this.getAttribute("data-attr"));
  }
}
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Child({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$1, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Child, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

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
  {
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  {
    const childProps = {};
    const childAttrs = {
      "data-attr": true
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  {
    const childProps = {};
    const childAttrs = {
      "data-attr": "foo"
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class MethodGetAttribute extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new MethodGetAttribute({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, MethodGetAttribute, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

const tagName = 'x-method-get-attribute';

export { MethodGetAttribute as default, generateMarkup, tagName };
