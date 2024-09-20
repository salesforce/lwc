import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-429691ij06";
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
  yield "<ol";
  yield stylesheetScopeTokenClass;
  yield ">";
  for (let [index, item] of Object.entries(instance.list ?? ({}))) {
    yield "<li";
    yield stylesheetScopeTokenClass;
    yield ">";
    const a = item.continent;
    if (typeof a === 'string') {
      yield a === '' ? '\u200D' : htmlEscape(a);
    } else if (typeof a === 'number') {
      yield a.toString();
    } else {
      yield htmlEscape((a ?? '').toString());
    }
    yield "<ul";
    yield stylesheetScopeTokenClass;
    yield ">";
    for (let [innerindex, city] of Object.entries(item.cities ?? ({}))) {
      yield "<li";
      yield stylesheetScopeTokenClass;
      yield ">";
      const b = city;
      if (typeof b === 'string') {
        yield b === '' ? '\u200D' : htmlEscape(b);
      } else if (typeof b === 'number') {
        yield b.toString();
      } else {
        yield htmlEscape((b ?? '').toString());
      }
      yield "</li>";
    }
    yield "</ul></li>";
  }
  yield "</ol>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

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
  const tmplFn = tmpl ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Test, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-for-each-nested';

export { Test as default, generateMarkup, tagName };
