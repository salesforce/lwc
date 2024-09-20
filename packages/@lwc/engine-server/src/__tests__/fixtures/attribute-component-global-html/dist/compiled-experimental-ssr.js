import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultStylesheets$1 = undefined;

var defaultStylesheets = undefined;

async function* tmpl$1(props, attrs, slotted, Cmp, instance, stylesheets) {
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
  yield "Passthrough properties:<ul><li>Title: ";
  const a = instance.title;
  if (typeof a === 'string') {
    yield htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield "</li><li>Lang: ";
  const b = instance.lang;
  if (typeof b === 'string') {
    yield htmlEscape(b);
  } else if (typeof b === 'number') {
    yield b.toString();
  } else {
    yield htmlEscape((b ?? '').toString());
  }
  yield "</li></ul>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class Child extends LightningElement {
  title;
  lang;
}
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Child({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$1, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Child, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

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
  {
    const childProps = {
      accessKey: "A",
      contentEditable: "true",
      draggable: "true",
      hidden: true,
      id: "foo",
      itemprop: "foo",
      lang: "fr",
      spellcheck: "true",
      tabIndex: "-1",
      title: "foo"
    };
    const childAttrs = {
      "class": "foo bar",
      "data-test": "test",
      style: "color: red; background: blue"
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class AttributeComponentGlobalHtml extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new AttributeComponentGlobalHtml({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, AttributeComponentGlobalHtml, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-component-global-html';

export { AttributeComponentGlobalHtml as default, generateMarkup, tagName };
