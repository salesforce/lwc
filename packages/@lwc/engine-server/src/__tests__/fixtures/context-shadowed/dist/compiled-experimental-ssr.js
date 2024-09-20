import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';
import { createContextProvider } from 'lwc';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken$2 = "lwc-5n0lbpjgrgn";
const stylesheetScopeTokenClass$2 = '';
const stylesheetScopeTokenHostClass$2 = '';
async function* tmpl$2(props, attrs, slotted, Cmp, instance) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  const stylesheets = [defaultScopedStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken$2 : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass$2 + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  yield "<div";
  yield stylesheetScopeTokenClass$2;
  yield ">";
  const a = instance.foo;
  if (typeof a === 'string') {
    yield a === '' ? '\u200D' : htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield "</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl$2.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$2;

class WireAdapter {
    contextValue = { value: 'missing' };
    static contextSchema = { value: 'required' };

    constructor(callback) {
        this._callback = callback;
    }

    connect() {
        // noop
    }

    disconnect() {
        // noop
    }

    update(_config, context) {
        if (context) {
            if (!context.hasOwnProperty('value')) {
                throw new Error(`Invalid context provided`);
            }
            this.contextValue = context.value;
            this._callback(this.contextValue);
        }
    }

}

const contextualizer = createContextProvider(WireAdapter);

class Component extends LightningElement {
  foo;
}
const __REFLECTED_PROPS__$2 = [];
async function* generateMarkup$2(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new Component({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$2, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  const tmplFn = tmpl$2 ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, Component, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken$1 = "lwc-8qjjb2ctv";
const stylesheetScopeTokenClass$1 = '';
const stylesheetScopeTokenHostClass$1 = '';
async function* tmpl$1(props, attrs, slotted, Cmp, instance) {
  if (Cmp.renderMode !== 'light') {
    yield `<template shadowrootmode="open"${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>`;
  }
  const stylesheets = [defaultScopedStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
  for (const stylesheet of stylesheets) {
    const token = stylesheet.$scoped$ ? stylesheetScopeToken$1 : undefined;
    const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
    const useNativeDirPseudoclass = true;
    yield '<style' + stylesheetScopeTokenClass$1 + ' type="text/css">';
    yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
    yield '</style>';
  }
  {
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$2("x-consumer", childProps, childAttrs, childSlottedContentGenerators);
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl$1.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$1;

let ProviderComponent$1 = class ProviderComponent extends LightningElement {
  connectedCallback() {
    contextualizer(this, {
      consumerConnectedCallback(consumer) {
        consumer.provide({
          value: "shadowed context"
        });
      }
    });
  }
};
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new ProviderComponent$1({
    tagName: tagName.toUpperCase()
  });
  instance.__internal__setState(props, __REFLECTED_PROPS__$1, attrs);
  instance.isConnected = true;
  instance.connectedCallback?.();
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield `<${tagName}`;
  yield tmplFn.stylesheetScopeTokenHostClass;
  yield* renderAttrs(attrs);
  yield '>';
  yield* tmplFn(props, attrs, slotted, ProviderComponent$1, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken = "lwc-3g0lsgsh6t5";
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
  {
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-middle", childProps, childAttrs, childSlottedContentGenerators);
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class ProviderComponent extends LightningElement {
  connectedCallback() {
    contextualizer(this, {
      consumerConnectedCallback(consumer) {
        consumer.provide({
          value: "top level"
        });
      }
    });
  }
}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new ProviderComponent({
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
  yield* tmplFn(props, attrs, slotted, ProviderComponent, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-provider';

export { ProviderComponent as default, generateMarkup, tagName };
