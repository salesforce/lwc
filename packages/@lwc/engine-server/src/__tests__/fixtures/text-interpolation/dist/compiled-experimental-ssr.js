import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-1ua14l8jqot";
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
  yield ">Public property: ";
  const a = instance.publicProp;
  if (typeof a === 'string') {
    yield htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield "</p><p";
  yield stylesheetScopeTokenClass;
  yield ">Private property: ";
  const b = instance.privateProp;
  if (typeof b === 'string') {
    yield htmlEscape(b);
  } else if (typeof b === 'number') {
    yield b.toString();
  } else {
    yield htmlEscape((b ?? '').toString());
  }
  yield "</p>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class TextInterpolation extends LightningElement {
  publicProp = "default-public-prop";
  privateProp = "private-prop";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new TextInterpolation({
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
  yield* tmplFn(props, attrs, slotted, TextInterpolation, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-text-interpolation';

export { TextInterpolation as default, generateMarkup, tagName };
