import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

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
  yield "<svg height=\"150\" width=\"400\"><defs><linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\"><stop class=\"static\" style=\"stop-color:rgb(255,255,0);stop-opacity:1\" offset=\"0%\"></stop><stop class=\"static\" style=\"stop-color:rgb(255,0,0);stop-opacity:1\" offset=\"100%\"></stop></linearGradient></defs><ellipse class=\"static\" cx=\"200\" cy=\"70\" rx=\"85\" ry=\"55\" fill=\"url(#grad1)\"></ellipse></svg><svg class=\"static\" height=\"150\" width=\"400\"><ellipse class=\"static\" cx=\"200\" cy=\"70\" rx=\"85\" ry=\"55\" fill=\"url(#grad1)\"></ellipse></svg><div><svg xmlns=\"http://www.w3.org/2000/svg\"><path></path><path></path></svg></div><svg xmlns=\"http://www.w3.org/2000/svg\"><path></path><path></path></svg>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Svgs, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-svgs';

export { Svgs as default, generateMarkup, tagName };
