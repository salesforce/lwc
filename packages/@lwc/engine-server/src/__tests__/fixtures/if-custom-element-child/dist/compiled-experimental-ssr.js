import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken$2 = "lwc-5h3d35cke7v";
const stylesheetScopeTokenClass$2 = '';
const stylesheetScopeTokenHostClass$2 = '';
async function* tmpl$2(props, attrs, slotted, Cmp, instance) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  const stylesheets = [defaultScopedStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken$2 : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass$2 + ' type="text/css">';
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
tmpl$2.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$2;

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
  const tmplFn = tmpl$2 ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Child, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken$1 = "lwc-4op83bn022u";
const stylesheetScopeTokenClass$1 = '';
const stylesheetScopeTokenHostClass$1 = '';
async function* tmpl$1(props, attrs, slotted, Cmp, instance) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  const stylesheets = [defaultScopedStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken$1 : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass$1 + ' type="text/css">';
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
tmpl$1.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$1;

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
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, CustomElementChild, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken = "lwc-8ld0kf2p5s";
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
    yield ' ' + "class" + '="' + prefix + "active-if-blocks" + '"';
  }
  yield ">";
  {
    const childProps = {
      activatetruepath: instance.trueFlag,
      activatefalsepath: instance.falseFlag
    };
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-custom-element-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  yield "</div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "inactive-if-blocks" + '"';
  }
  yield ">";
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
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

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
  const tmplFn = tmpl ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Test, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-if-custom-element-child';

export { Test as default, generateMarkup, tagName };
