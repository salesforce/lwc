import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import { htmlEscape } from '@lwc/shared';
import { createContextProvider } from 'lwc';

var defaultStylesheets$2 = undefined;

var defaultStylesheets$1 = undefined;

var defaultStylesheets = undefined;

async function* tmpl$2(props, attrs, slotted, Cmp, instance, stylesheets) {
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
  yield "<div>";
  const a = instance.top;
  if (typeof a === 'string') {
    yield htmlEscape(a);
  } else if (typeof a === 'number') {
    yield a.toString();
  } else {
    yield htmlEscape((a ?? '').toString());
  }
  yield " and ";
  const b = instance.nested;
  if (typeof b === 'string') {
    yield htmlEscape(b);
  } else if (typeof b === 'number') {
    yield b.toString();
  } else {
    yield htmlEscape((b ?? '').toString());
  }
  yield "</div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class WireAdapterA {
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

const contextualizerA = createContextProvider(WireAdapterA);

class WireAdapterB {
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
            if (!hasOwnProperty.call(context, 'value')) {
                throw new Error(`Invalid context provided`);
            }
            this.contextValue = context.value;
            this._callback(this.contextValue);
        }
    }

}

const contextualizerB = createContextProvider(WireAdapterB);

class Component extends LightningElement {
  top;
  nested;
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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$2 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, Component, instance, defaultStylesheets);
  yield `</${tagName}>`;
}

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

let ProviderComponent$1 = class ProviderComponent extends LightningElement {
  connectedCallback() {
    contextualizerB(this, {
      consumerConnectedCallback(consumer) {
        consumer.provide({
          value: "nested"
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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, ProviderComponent$1, instance, defaultStylesheets$1);
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
    const childProps = {};
    const childAttrs = {};
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-provider-nested", childProps, childAttrs, childSlottedContentGenerators);
  }
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

class ProviderComponent extends LightningElement {
  connectedCallback() {
    contextualizerA(this, {
      consumerConnectedCallback(consumer) {
        consumer.provide({
          value: "top-level"
        });
      }
    });
    contextualizerB(this, {
      consumerConnectedCallback(consumer) {
        consumer.provide({
          value: "outer-value"
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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, ProviderComponent, instance, defaultStylesheets$2);
  yield `</${tagName}>`;
}

const tagName = 'x-provider';

export { ProviderComponent as default, generateMarkup, tagName };
