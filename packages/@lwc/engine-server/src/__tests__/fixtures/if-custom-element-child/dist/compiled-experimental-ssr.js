import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultStylesheets$2 = undefined;

var defaultStylesheets$1 = undefined;

var defaultStylesheets = undefined;

async function* tmpl$2(props, attrs, slotted, Cmp, instance, stylesheets) {
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
  yield "Custom element child ";
  const a = instance.label;
  if (typeof a === 'string') {
    yield htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Child extends LightningElement {
  label;
}
const __REFLECTED_PROPS__$2 = [];
async function* generateMarkup$2(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Child({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$2, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$2 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Child, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

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
  if (false === instance.activatefalsepath) {
    {
      const childProps = {
        label: "x-child-test-false"
      };
      const childAttrs = {};
      const childSlottedContentGenerators = {};
      yield* generateMarkup$2("x-child", childProps, childAttrs, childSlottedContentGenerators);
    }
  }
  if (true === instance.activatetruepath) {
    {
      const childProps = {
        label: "x-child-test-true"
      };
      const childAttrs = {};
      const childSlottedContentGenerators = {};
      yield* generateMarkup$2("x-child", childProps, childAttrs, childSlottedContentGenerators);
    }
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class CustomElementChild extends LightningElement {
  activatefalsepath;
  activatetruepath;
}
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new CustomElementChild({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$1, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, CustomElementChild, instance, defaultStylesheets$1);
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
  yield "<div class=\"active-if-blocks\">";
  {
    const childProps = {
      activatetruepath: instance.trueFlag,
      activatefalsepath: instance.falseFlag
    };
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-custom-element-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  yield "</div><div class=\"inactive-if-blocks\">";
  {
    const childProps = {
      activatetruepath: instance.falseFlag,
      activatefalsepath: instance.trueFlag
    };
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-custom-element-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  yield "</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Test extends LightningElement {
  falseFlag = false;
  trueFlag = true;
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
  yield* tmplFn(props, attrs, slotted, Test, instance, defaultStylesheets$2);
  yield `</${tagName}>`;
}

const tagName = 'x-if-custom-element-child';

export { Test as default, generateMarkup, tagName };
