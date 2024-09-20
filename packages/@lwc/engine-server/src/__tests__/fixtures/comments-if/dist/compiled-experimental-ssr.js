import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

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
  if (true === instance.truthyValue) {
    yield "<!-- HTML comment inside if:true --><p>true branch</p>";
  }
  if (false === instance.truthyValue) {
    yield "<!-- HTML comment inside if:false --><p>false branch</p>";
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class CommentsIf extends LightningElement {
  truthyValue = true;
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new CommentsIf({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, CommentsIf, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-comments-if';

export { CommentsIf as default, generateMarkup, tagName };
