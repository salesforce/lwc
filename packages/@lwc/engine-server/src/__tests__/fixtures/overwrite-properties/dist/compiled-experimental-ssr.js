import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-11055soke37";
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
  yield "<p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const a = instance.name;
  if (typeof a === 'string') {
    yield a === '' ? '\u200D' : htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const b = instance.namespace;
  if (typeof b === 'string') {
    yield b === '' ? '\u200D' : htmlEscape(b);
  } else if (typeof b === 'number') {
    yield b.toString();
  } else {
    yield htmlEscape((b ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const c = instance.type;
  if (typeof c === 'string') {
    yield c === '' ? '\u200D' : htmlEscape(c);
  } else if (typeof c === 'number') {
    yield c.toString();
  } else {
    yield htmlEscape((c ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const d = instance.parent;
  if (typeof d === 'string') {
    yield d === '' ? '\u200D' : htmlEscape(d);
  } else if (typeof d === 'number') {
    yield d.toString();
  } else {
    yield htmlEscape((d ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const e = instance.value;
  if (typeof e === 'string') {
    yield e === '' ? '\u200D' : htmlEscape(e);
  } else if (typeof e === 'number') {
    yield e.toString();
  } else {
    yield htmlEscape((e ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const f = instance.shadowRoot;
  if (typeof f === 'string') {
    yield f === '' ? '\u200D' : htmlEscape(f);
  } else if (typeof f === 'number') {
    yield f.toString();
  } else {
    yield htmlEscape((f ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const g = instance.children;
  if (typeof g === 'string') {
    yield g === '' ? '\u200D' : htmlEscape(g);
  } else if (typeof g === 'number') {
    yield g.toString();
  } else {
    yield htmlEscape((g ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const h = instance.attributes;
  if (typeof h === 'string') {
    yield h === '' ? '\u200D' : htmlEscape(h);
  } else if (typeof h === 'number') {
    yield h.toString();
  } else {
    yield htmlEscape((h ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">";
  const i = instance.eventListeners;
  if (typeof i === 'string') {
    yield i === '' ? '\u200D' : htmlEscape(i);
  } else if (typeof i === 'number') {
    yield i.toString();
  } else {
    yield htmlEscape((i ?? '').toString());
  }
  yield "</p>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class Cmp extends LightningElement {
  name;
  namespace;
  type;
  parent;
  value;
  shadowRoot;
  children;
  attributes;
  eventListeners;
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Cmp({
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
  yield* tmplFn(props, attrs, slotted, Cmp, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-overwrite-properties';

export { Cmp as default, generateMarkup, tagName };
