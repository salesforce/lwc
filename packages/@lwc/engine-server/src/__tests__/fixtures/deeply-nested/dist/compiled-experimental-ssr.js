import { LightningElement, renderAttrs, fallbackTmpl } from '@lwc/ssr-runtime';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken = "lwc-6a8uqob2ku4";
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
  yield ">";
  if (instance.isPositive) {
    if (instance.isDivisibleByThree) {
      for (let [__unused__, child] of Object.entries(instance.someChildren ?? ({}))) {
        yield "<span";
        yield stylesheetScopeTokenClass;
        yield ">";
        {
          const childProps = {
            label: child,
            remaining: instance.minusOne
          };
          const childAttrs = {};
          const childSlottedContentGenerators = {};
          yield* generateMarkup("x-component", childProps, childAttrs, childSlottedContentGenerators);
        }
        yield "</span>";
      }
    } else if (instance.isDivisibleByTwo) {
      yield "<div";
      yield stylesheetScopeTokenClass;
      yield "><span";
      yield stylesheetScopeTokenClass;
      yield ">two</span>";
      {
        const childProps = {
          remaining: instance.minusOne
        };
        const childAttrs = {};
        const childSlottedContentGenerators = {};
        yield* generateMarkup("x-component", childProps, childAttrs, childSlottedContentGenerators);
      }
      yield "</div>";
    } else {
      {
        const childProps = {
          remaining: instance.minusOne
        };
        const childAttrs = {};
        const childSlottedContentGenerators = {};
        yield* generateMarkup("x-component", childProps, childAttrs, childSlottedContentGenerators);
      }
    }
  } else {
    yield "terminal node";
  }
  yield "</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class Component extends LightningElement {
  remaining = 9;
  label = "default";
  get someChildren() {
    return ["a", "b", "c"];
  }
  get isPositive() {
    return this.remaining > 0;
  }
  get isDivisibleByThree() {
    return this.remaining % 3 === 0;
  }
  get isDivisibleByTwo() {
    return this.remaining % 3 === 0;
  }
  get minusOne() {
    return this.remaining - 1;
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Component({
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
  yield* tmplFn(props, attrs, slotted, Component, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-component';

export { Component as default, generateMarkup, tagName };
