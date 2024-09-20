import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-16msa9tg017";
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
    yield ' ' + "class" + '="' + prefix + "foo bar" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red; background: blue" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "accesskey" + '="' + prefix + "A" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "contenteditable" + '="' + prefix + "true" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "data-test" + '="' + prefix + "test" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "draggable" + '="' + prefix + "true" + '"';
  }
  yield " hidden";
  {
    const prefix = '';
    yield ' ' + "id" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "itemprop" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "lang" + '="' + prefix + "fr" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "spellcheck" + '="' + prefix + "true" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "tabindex" + '="' + prefix + "-1" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "title" + '="' + prefix + "foo" + '"';
  }
  yield "></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class AttributeGlobalHtml extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new AttributeGlobalHtml({
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
  yield* tmplFn(props, attrs, slotted, AttributeGlobalHtml, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-global-html';

export { AttributeGlobalHtml as default, generateMarkup, tagName };
