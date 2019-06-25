## HTMLSlotElement

IE11 does not support this global constructor, in which case we need to provide it. Additionally, we need to guarantee that any `slot` element create via `document.createElement('slot')` matches the proper prototype, otherwise adding just the global constructor does nothing.

Note: This polyfill DOES NOT cover the cases where the `slot` element is created via `innerHTML` or any other mechanism, including server side rendering. It only covers the cases where the diffing algo creates the elements defined in a template.
