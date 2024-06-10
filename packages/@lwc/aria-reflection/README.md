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

The polyfill patches these [standard](https://w3c.github.io/aria/#ARIAMixin) property/attribute reflections:

| Property                     | Attribute                     |
| ---------------------------- | ----------------------------- |
| `ariaAtomic`                 | `aria-atomic`                 |
| `ariaAutoComplete`           | `aria-autocomplete`           |
| `ariaBrailleLabel`           | `aria-braillelabel`           |
| `ariaBrailleRoleDescription` | `aria-brailleroledescription` |
| `ariaBusy`                   | `aria-busy`                   |
| `ariaChecked`                | `aria-checked`                |
| `ariaColCount`               | `aria-colcount`               |
| `ariaColIndex`               | `aria-colindex`               |
| `ariaColIndexText`           | `aria-colindextext`           |
| `ariaColSpan`                | `aria-colspan`                |
| `ariaCurrent`                | `aria-current`                |
| `ariaDescription`            | `aria-description`            |
| `ariaDisabled`               | `aria-disabled`               |
| `ariaExpanded`               | `aria-expanded`               |
| `ariaHasPopup`               | `aria-haspopup`               |
| `ariaHidden`                 | `aria-hidden`                 |
| `ariaInvalid`                | `aria-invalid`                |
| `ariaKeyShortcuts`           | `aria-keyshortcuts`           |
| `ariaLabel`                  | `aria-label`                  |
| `ariaLevel`                  | `aria-level`                  |
| `ariaLive`                   | `aria-live`                   |
| `ariaModal`                  | `aria-modal`                  |
| `ariaMultiLine`              | `aria-multiline`              |
| `ariaMultiSelectable`        | `aria-multiselectable`        |
| `ariaOrientation`            | `aria-orientation`            |
| `ariaPlaceholder`            | `aria-placeholder`            |
| `ariaPosInSet`               | `aria-posinset`               |
| `ariaPressed`                | `aria-pressed`                |
| `ariaReadOnly`               | `aria-readonly`               |
| `ariaRelevant`               | `aria-relevant`               |
| `ariaRequired`               | `aria-required`               |
| `ariaRoleDescription`        | `aria-roledescription`        |
| `ariaRowCount`               | `aria-rowcount`               |
| `ariaRowIndex`               | `aria-rowindex`               |
| `ariaRowIndexText`           | `aria-rowindextext`           |
| `ariaRowSpan`                | `aria-rowspan`                |
| `ariaSelected`               | `aria-selected`               |
| `ariaSetSize`                | `aria-setsize`                |
| `ariaSort`                   | `aria-sort`                   |
| `ariaValueMax`               | `aria-valuemax`               |
| `ariaValueMin`               | `aria-valuemin`               |
| `ariaValueNow`               | `aria-valuenow`               |
| `ariaValueText`              | `aria-valuetext`              |
| `role`                       | `role`                        |

As well as these [non-standard](https://github.com/w3c/aria/issues/1732) reflections:

| Property               | Attribute               |
| ---------------------- | ----------------------- |
| `ariaActiveDescendant` | `aria-activedescendant` |
| `ariaControls`         | `aria-controls`         |
| `ariaDescribedBy`      | `aria-describedby`      |
| `ariaDetails`          | `aria-details`          |
| `ariaErrorMessage`     | `aria-errormessage`     |
| `ariaFlowTo`           | `aria-flowto`           |
| `ariaLabelledBy`       | `aria-labelledby`       |
| `ariaOwns`             | `aria-owns`             |

To determine which browsers support ARIA reflection, see the relevant [Web Platform Tests](https://web-platform-tests.org/) for [ARIA string reflection](https://wpt.fyi/results/custom-elements/reactions/AriaMixin-string-attributes.html?label=experimental&label=master&aligned) and [ARIA element reflection](https://wpt.fyi/results/custom-elements/reactions/AriaMixin-element-attributes.html?label=experimental&label=master&aligned).
