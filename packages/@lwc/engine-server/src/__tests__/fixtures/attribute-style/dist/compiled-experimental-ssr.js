import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';

var defaultScopedStylesheets = undefined;

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
  const tmplFn = fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Child, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken = "lwc-3he37he02f2";
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
  yield "<div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: red" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "color: blue; background: black; border: 1px solid red" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "border-width: 1px; border-style: solid; border-color: red" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "style" + '="' + prefix + "border-width: 1px !important; border-style: solid; border-color: red    !important" + '"';
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    const attrOrPropValue = instance.dynamicStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    const attrOrPropValue = instance.invalidStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    const attrOrPropValue = instance.nullStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
      }
    }
  }
  yield "></div><div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    const attrOrPropValue = instance.emptyStringStyle;
    const valueType = typeof attrOrPropValue;
    if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
      yield ' ' + "style";
      if (valueType === 'string') {
        yield `="${prefix}${htmlEscape(attrOrPropValue, true)}"`;
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
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

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
  const tmplFn = tmpl ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, StyleAttribute, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-attribute-style';

export { StyleAttribute as default, generateMarkup, tagName };
