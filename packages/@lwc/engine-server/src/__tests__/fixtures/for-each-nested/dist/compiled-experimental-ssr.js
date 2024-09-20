import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultStylesheets = undefined;

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
    yield "<ul>";
    for (let [innerindex, city] of Object.entries(item.cities ?? ({}))) {
      yield "<li>";
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
  yield* tmplFn(props, attrs, slotted, Test, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-for-each-nested';

export { Test as default, generateMarkup, tagName };
