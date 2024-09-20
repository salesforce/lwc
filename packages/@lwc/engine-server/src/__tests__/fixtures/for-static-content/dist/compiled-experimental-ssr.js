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
  yield "<ul>";
  for (let [__unused__, contact] of Object.entries(instance.contacts ?? ({}))) {
    yield "<li><div><span>static</span></div>";
    const a = contact.Name;
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

class Container extends LightningElement {
  contacts = [{
    Id: "003171931112854375",
    Name: "Amy Taylor"
  }, {
    Id: "003192301009134555",
    Name: "Michael Jones"
  }, {
    Id: "003848991274589432",
    Name: "Jennifer Wu"
  }];
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Container({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Container, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

const tagName = 'x-container';

export { Container as default, generateMarkup, tagName };
