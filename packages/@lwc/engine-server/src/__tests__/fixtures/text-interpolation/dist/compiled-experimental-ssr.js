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
  yield "<p>Public property: ";
  const a = instance.publicProp;
  if (typeof a === 'string') {
    yield htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield "</p><p>Private property: ";
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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, TextInterpolation, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-text-interpolation';

export { TextInterpolation as default, generateMarkup, tagName };
