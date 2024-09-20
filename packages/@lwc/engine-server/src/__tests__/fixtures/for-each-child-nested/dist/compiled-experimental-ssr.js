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
  for (let [index, city] of Object.entries(instance.cities ?? ({}))) {
    yield "<li>";
    const a = index;
    if (typeof a === 'string') {
      yield htmlEscape(a);
    } else if (typeof a === 'number') {
      yield a.toString();
    } else {
      yield htmlEscape((a ?? '').toString());
    }
    yield " - ";
    const b = city;
    if (typeof b === 'string') {
      yield htmlEscape(b);
    } else if (typeof b === 'number') {
      yield b.toString();
    } else {
      yield htmlEscape((b ?? '').toString());
    }
    yield "</li>";
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Child extends LightningElement {
  cities;
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
  yield "<ol>";
  for (let [index, item] of Object.entries(instance.list ?? ({}))) {
    yield "<li>";
    const a = item.continent;
    if (typeof a === 'string') {
      yield a === '' ? '\u200D' : htmlEscape(a);
    } else if (typeof a === 'number') {
      yield a.toString();
    } else {
      yield htmlEscape((a ?? '').toString());
    }
    {
      const childProps = {
        cities: item.cities
      };
      const childAttrs = {};
      const childSlottedContentGenerators = {};
      yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
    }
    yield "</li>";
  }
  yield "</ol>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Test extends LightningElement {
  list;
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Test({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Test, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

const tagName = 'x-for-each-child-nested';

export { Test as default, generateMarkup, tagName };
