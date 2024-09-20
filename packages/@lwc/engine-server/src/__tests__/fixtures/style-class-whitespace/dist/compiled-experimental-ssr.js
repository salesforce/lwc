import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-1hl7358i549";
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
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red !important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red !important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red  !important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red  !important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red ! important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red ! important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red !IMPORTANT" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red !IMPORTANT" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red  !IMPORTANT" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red  !IMPORTANT" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red ! IMPORTANT" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red ! IMPORTANT" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color  :  red  !  IMPORTANT  ;" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color  :  red  !  IMPORTAnt  ;" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color  :  red    ;" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red; background-color: aqua" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red ; background-color: aqua;" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "--its-a-tab:\tred    ;" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "--its-a-tab-and-a-space:\t red    ;" + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + " boo " + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "\tboo" + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + " foo bar   " + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + " foo  bar  baz " + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "foo   bar" + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + "\tfoo  bar " + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + " foo\tbar " + '"';
  }
  yield "></div><div";
  {
    const prefix = '';
    yield ' ' + "class" + '="' + prefix + " foo bar\t" + '"';
  }
  yield "></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class Foo extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Foo({
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
  yield* tmplFn(props, attrs, slotted, Foo, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-foo';

export { Foo as default, generateMarkup, tagName };
