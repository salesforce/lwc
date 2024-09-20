import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

var defaultScopedStylesheets = undefined;

const stylesheetScopeToken$1 = "lwc-5h3d35cke7v";
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
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl$1.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass$1;

let DefaultComponentName$1 = class DefaultComponentName extends LightningElement {};
const __REFLECTED_PROPS__$1 = [];
async function* generateMarkup$1(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new DefaultComponentName$1({
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
  yield* tmplFn(props, attrs, slotted, DefaultComponentName$1, instance);
  yield `</${tagName}>`;
}

const stylesheetScopeToken = "lwc-ts1rr7v761";
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
    const childProps = {
      ariaActiveDescendant: "foo",
      ariaAtomic: "foo",
      ariaAutoComplete: "foo",
      ariaBusy: "foo",
      ariaChecked: "foo",
      ariaColCount: "foo",
      ariaColIndex: "foo",
      ariaColIndexText: "foo",
      ariaColSpan: "foo",
      ariaControls: "foo",
      ariaCurrent: "foo",
      ariaDescribedBy: "foo",
      ariaDescription: "foo",
      ariaDetails: "foo",
      ariaDisabled: "foo",
      ariaErrorMessage: "foo",
      ariaExpanded: "foo",
      ariaFlowTo: "foo",
      ariaHasPopup: "foo",
      ariaHidden: "foo",
      ariaInvalid: "foo",
      ariaKeyShortcuts: "foo",
      ariaLabel: "foo",
      ariaLabelledBy: "foo",
      ariaLevel: "foo",
      ariaLive: "foo",
      ariaModal: "foo",
      ariaMultiLine: "foo",
      ariaMultiSelectable: "foo",
      ariaOrientation: "foo",
      ariaOwns: "foo",
      ariaPlaceholder: "foo",
      ariaPosInSet: "foo",
      ariaPressed: "foo",
      ariaReadOnly: "foo",
      ariaRelevant: "foo",
      ariaRequired: "foo",
      ariaRoleDescription: "foo",
      ariaRowCount: "foo",
      ariaRowIndex: "foo",
      ariaRowIndexText: "foo",
      ariaRowSpan: "foo",
      ariaSelected: "foo",
      ariaSetSize: "foo",
      ariaSort: "foo",
      ariaValueMax: "foo",
      ariaValueMin: "foo",
      ariaValueNow: "foo",
      ariaValueText: "foo",
      ariaBrailleLabel: "foo",
      ariaBrailleRoleDescription: "foo",
      role: "foo"
    };
    const childAttrs = {
      "aria-activedescendant": "foo",
      "aria-atomic": "foo",
      "aria-autocomplete": "foo",
      "aria-busy": "foo",
      "aria-checked": "foo",
      "aria-colcount": "foo",
      "aria-colindex": "foo",
      "aria-colindextext": "foo",
      "aria-colspan": "foo",
      "aria-controls": "foo",
      "aria-current": "foo",
      "aria-describedby": "foo",
      "aria-description": "foo",
      "aria-details": "foo",
      "aria-disabled": "foo",
      "aria-errormessage": "foo",
      "aria-expanded": "foo",
      "aria-flowto": "foo",
      "aria-haspopup": "foo",
      "aria-hidden": "foo",
      "aria-invalid": "foo",
      "aria-keyshortcuts": "foo",
      "aria-label": "foo",
      "aria-labelledby": "foo",
      "aria-level": "foo",
      "aria-live": "foo",
      "aria-modal": "foo",
      "aria-multiline": "foo",
      "aria-multiselectable": "foo",
      "aria-orientation": "foo",
      "aria-owns": "foo",
      "aria-placeholder": "foo",
      "aria-posinset": "foo",
      "aria-pressed": "foo",
      "aria-readonly": "foo",
      "aria-relevant": "foo",
      "aria-required": "foo",
      "aria-roledescription": "foo",
      "aria-rowcount": "foo",
      "aria-rowindex": "foo",
      "aria-rowindextext": "foo",
      "aria-rowspan": "foo",
      "aria-selected": "foo",
      "aria-setsize": "foo",
      "aria-sort": "foo",
      "aria-valuemax": "foo",
      "aria-valuemin": "foo",
      "aria-valuenow": "foo",
      "aria-valuetext": "foo",
      "aria-braillelabel": "foo",
      "aria-brailleroledescription": "foo",
      role: "foo"
    };
    const childSlottedContentGenerators = {};
    yield* generateMarkup$1("x-child", childProps, childAttrs, childSlottedContentGenerators);
  }
  yield "<div";
  yield stylesheetScopeTokenClass;
  {
    const prefix = '';
    yield ' ' + "aria-activedescendant" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-atomic" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-autocomplete" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-busy" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-checked" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-colcount" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-colindex" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-colindextext" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-colspan" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-controls" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-current" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-describedby" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-description" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-details" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-disabled" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-errormessage" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-expanded" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-flowto" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-haspopup" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-hidden" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-invalid" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-keyshortcuts" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-label" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-labelledby" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-level" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-live" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-modal" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-multiline" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-multiselectable" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-orientation" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-owns" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-placeholder" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-posinset" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-pressed" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-readonly" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-relevant" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-required" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-roledescription" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-rowcount" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-rowindex" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-rowindextext" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-rowspan" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-selected" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-setsize" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-sort" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuemax" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuemin" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuenow" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-valuetext" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-braillelabel" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "aria-brailleroledescription" + '="' + prefix + "foo" + '"';
  }
  {
    const prefix = '';
    yield ' ' + "role" + '="' + prefix + "foo" + '"';
  }
  yield "></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}
tmpl.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;

class DefaultComponentName extends LightningElement {}
const __REFLECTED_PROPS__ = [];
async function* generateMarkup(tagName, props, attrs, slotted) {
  attrs = attrs ?? ({});
  const instance = new DefaultComponentName({
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
  yield* tmplFn(props, attrs, slotted, DefaultComponentName, instance);
  yield `</${tagName}>`;
}

const tagName = 'x-parent';

export { DefaultComponentName as default, generateMarkup, tagName };
