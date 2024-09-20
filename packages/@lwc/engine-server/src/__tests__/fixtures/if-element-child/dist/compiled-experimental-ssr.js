import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken$1 = "lwc-fv9ggriteq";
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
    yield "<div";
    {
      const prefix = '';
      yield ' ' + "class" + '="' + prefix + "div-false" + '"';
    }
    yield "></div>";
  }
  if (true === instance.activatetruepath) {
    yield "<div";
    {
      const prefix = '';
      yield ' ' + "class" + '="' + prefix + "div-true" + '"';
    }
    yield "></div>";
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl$1.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$1;

class ElementChild extends LightningElement {
  activatefalsepath;
  activatetruepath;
}
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new ElementChild({
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
  yield* tmplFn(props, attrs, slotted, ElementChild, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken = "lwc-7opru7svpdv";
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
    yield* generateMarkup$1("x-element-child", childProps, childAttrs, childSlottedContentGenerators);
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
    yield* generateMarkup$1("x-element-child", childProps, childAttrs, childSlottedContentGenerators);
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

const tagName = 'x-if-element-child';

export { Test as default, generateMarkup, tagName };
