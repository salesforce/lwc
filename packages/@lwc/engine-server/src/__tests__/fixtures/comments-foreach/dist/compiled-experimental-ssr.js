import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-62akn1j5d4f";
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
  yield "<ul";
  yield stylesheetScopeTokenClass;
  yield ">";
  for (let [__unused__, color] of Object.entries(instance.colors ?? ({}))) {
    yield "<!-- color --><li";
    yield stylesheetScopeTokenClass;
    yield ">";
    const a = color;
    if (typeof a === 'string') {
      yield a === '' ? '\u200D' : htmlEscape(a);
    } else if (typeof a === 'number') {
      yield a.toString();
    } else {
      yield htmlEscape((a ?? '').toString());
    }
    yield "</li>";
  }
  yield "</ul>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class CommentsForeach extends LightningElement {
  colors = ["red", "blue", "yellow"];
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new CommentsForeach({
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
  yield* tmplFn(props, attrs, slotted, CommentsForeach, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-comments-foreach';

export { CommentsForeach as default, generateMarkup, tagName };
