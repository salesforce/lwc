import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-76j1t7n4li6";
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
  yield "<svg";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "height" + '="' + prefix + "150" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "width" + '="' + prefix + "400" + '"';
  }
  yield "><defs";
  yield stylesheetScopeTokenClass;
  yield "><linearGradient";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "id" + '="' + prefix + "grad1" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "x1" + '="' + prefix + "0%" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "y1" + '="' + prefix + "0%" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "x2" + '="' + prefix + "100%" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "y2" + '="' + prefix + "0%" + '"';
  }
  yield "><stop";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "static" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "stop-color:rgb(255,255,0);stop-opacity:1" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "offset" + '="' + prefix + "0%" + '"';
  }
  yield "></stop><stop";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "static" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "stop-color:rgb(255,0,0);stop-opacity:1" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "offset" + '="' + prefix + "100%" + '"';
  }
  yield "></stop></linearGradient></defs><ellipse";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "static" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "cx" + '="' + prefix + "200" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "cy" + '="' + prefix + "70" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "rx" + '="' + prefix + "85" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "ry" + '="' + prefix + "55" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "fill" + '="' + prefix + "url(#grad1)" + '"';
  }
  yield "></ellipse></svg><svg";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "static" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "height" + '="' + prefix + "150" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "width" + '="' + prefix + "400" + '"';
  }
  yield "><ellipse";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "static" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "cx" + '="' + prefix + "200" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "cy" + '="' + prefix + "70" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "rx" + '="' + prefix + "85" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "ry" + '="' + prefix + "55" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "fill" + '="' + prefix + "url(#grad1)" + '"';
  }
  yield "></ellipse></svg><div";
  yield stylesheetScopeTokenClass;
  yield "><svg";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "xmlns" + '="' + prefix + "http://www.w3.org/2000/svg" + '"';
  }
  yield "><path";
  yield stylesheetScopeTokenClass;
  yield "></path><path";
  yield stylesheetScopeTokenClass;
  yield "></path></svg></div><svg";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "xmlns" + '="' + prefix + "http://www.w3.org/2000/svg" + '"';
  }
  yield "><path";
  yield stylesheetScopeTokenClass;
  yield "></path><path";
  yield stylesheetScopeTokenClass;
  yield "></path></svg>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class Svgs extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Svgs({
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
  yield* tmplFn(props, attrs, slotted, Svgs, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-svgs';

export { Svgs as default, generateMarkup, tagName };
