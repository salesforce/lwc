# @lwc/aria-reflection

> **Note:** use this code at your own risk. It is optimized for backwards-compatibility, not
> as a forward-looking polyfill that keeps up to date with web standards.

Polyfill for [ARIA string reflection](https://wicg.github.io/aom/spec/aria-reflection.html) on Elements.
This is part of the [Accessibility Object Model](https://wicg.github.io/aom/explainer.html) (AOM).

For example:

```js
element.setAttribute('aria-pressed', 'true');
console.log(element.ariaPressed); // true
element.ariaPressed = false;
console.log(element.getAttribute('aria-pressed')); // false
```

Note that the attribute `aria-pressed` is reflected to the property `ariaPressed`, and vice versa.

## Usage

```shell
npm install @lwc/aria-reflection
```

```js
import '@lwc/aria-reflection';
```

The polyfill is applied globally to `Element.prototype` as soon as the module is imported.

## Implementation

The polyfill patches these [standard](https://w3c.github.io/aria/#idl-interface) properties:

-   ariaAtomic
-   ariaAutoComplete
-   ariaBusy
-   ariaChecked
-   ariaColCount
-   ariaColIndex
-   ariaColSpan
-   ariaCurrent
-   ariaDisabled
-   ariaExpanded
-   ariaHasPopup
-   ariaHidden
-   ariaInvalid
-   ariaKeyShortcuts
-   ariaLabel
-   ariaLevel
-   ariaLive
-   ariaModal
-   ariaMultiLine
-   ariaMultiSelectable
-   ariaOrientation
-   ariaPlaceholder
-   ariaPosInSet
-   ariaPressed
-   ariaReadOnly
-   ariaRelevant
-   ariaRequired
-   ariaRoleDescription
-   ariaRowCount
-   ariaRowIndex
-   ariaRowSpan
-   ariaSelected
-   ariaSetSize
-   ariaSort
-   ariaValueMax
-   ariaValueMin
-   ariaValueNow
-   ariaValueText
-   role

As well as these [currently non-standard](https://github.com/w3c/aria/issues/1732) properties:

-   ariaActiveDescendant
-   ariaControls
-   ariaDescribedBy
-   ariaDetails
-   ariaErrorMessage
-   ariaFlowTo
-   ariaLabelledBy
-   ariaOwns

To determine which browsers already support ARIA reflection, see [this test](https://bl.ocks.org/nolanlawson/raw/66448a53df90680a81bda78ff8486014/).
