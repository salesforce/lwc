import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultStylesheets$1 = undefined;

var defaultStylesheets = undefined;

class Child extends LightningElement {}
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
  const tmplFn = fallbackTmpl;
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
  yield "<div style=\"color: red\"></div><div style=\"color: blue; background: black; border: 1px solid red\"></div><div style=\"border-width: 1px; border-style: solid; border-color: red\"></div><div style=\"border-width: 1px !important; border-style: solid; border-color: red    !important\"></div><div";
  {
    const attrOrPropValue = instance.dynamicStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></div><div";
  {
    const attrOrPropValue = instance.invalidStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></div><div";
  {
    const attrOrPropValue = instance.nullStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></div><div";
  {
    const attrOrPropValue = instance.emptyStringStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield '="' + htmlEscape(attrOrPropValue, true) + '"';
      }
    }
  }
  yield "></div>";
  {
    const childProps = {};
    const childAttrs = {
      style: "color: red"
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  {
    const childProps = {};
    const childAttrs = {
      style: "color: blue; background: black; border: 1px solid red"
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  {
    const childProps = {};
    const childAttrs = {
      style: "border-width: 1px; border-style: solid; border-color: red"
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  {
    const childProps = {};
    const childAttrs = {
      style: instance.dynamicStyle
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class StyleAttribute extends LightningElement {
  dynamicStyle = "color: salmon; background-color: chocolate;";
  invalidStyle = {};
  nullStyle = null;
  emptyStringStyle = "";
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new StyleAttribute({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, StyleAttribute, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-style';

export { StyleAttribute as default, generateMarkup, tagName };
