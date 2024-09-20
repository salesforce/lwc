import { renderAttrs, LightningElement, fallbackTmpl } from '@lwc/ssr-runtime';
import '@lwc/shared';

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
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl$1 ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, DefaultComponentName$1, instance, defaultStylesheets);
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
  yield "<div aria-activedescendant=\"foo\" aria-atomic=\"foo\" aria-autocomplete=\"foo\" aria-busy=\"foo\" aria-checked=\"foo\" aria-colcount=\"foo\" aria-colindex=\"foo\" aria-colindextext=\"foo\" aria-colspan=\"foo\" aria-controls=\"foo\" aria-current=\"foo\" aria-describedby=\"foo\" aria-description=\"foo\" aria-details=\"foo\" aria-disabled=\"foo\" aria-errormessage=\"foo\" aria-expanded=\"foo\" aria-flowto=\"foo\" aria-haspopup=\"foo\" aria-hidden=\"foo\" aria-invalid=\"foo\" aria-keyshortcuts=\"foo\" aria-label=\"foo\" aria-labelledby=\"foo\" aria-level=\"foo\" aria-live=\"foo\" aria-modal=\"foo\" aria-multiline=\"foo\" aria-multiselectable=\"foo\" aria-orientation=\"foo\" aria-owns=\"foo\" aria-placeholder=\"foo\" aria-posinset=\"foo\" aria-pressed=\"foo\" aria-readonly=\"foo\" aria-relevant=\"foo\" aria-required=\"foo\" aria-roledescription=\"foo\" aria-rowcount=\"foo\" aria-rowindex=\"foo\" aria-rowindextext=\"foo\" aria-rowspan=\"foo\" aria-selected=\"foo\" aria-setsize=\"foo\" aria-sort=\"foo\" aria-valuemax=\"foo\" aria-valuemin=\"foo\" aria-valuenow=\"foo\" aria-valuetext=\"foo\" aria-braillelabel=\"foo\" aria-brailleroledescription=\"foo\" role=\"foo\"></div>";
  if (Cmp.renderMode !== 'light') {
    yield '</template>';
  }
}

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
  yield `<${tagName}`;
  yield* renderAttrs(attrs);
  yield '>';
  const tmplFn = tmpl ?? fallbackTmpl;
  yield* tmplFn(props, attrs, slotted, DefaultComponentName, instance, defaultStylesheets$1);
  yield `</${tagName}>`;
}

const tagName = 'x-parent';

export { DefaultComponentName as default, generateMarkup, tagName };
