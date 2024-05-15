import _implicitStylesheets from "./valid-hyphen-attribute.css";
import _implicitScopedStylesheets from "./valid-hyphen-attribute.scoped.css?scoped=true";
import _xButton from "x/button";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  props: {
    under_Hyphen: "bar",
  },
  key: 0,
};
const stc1 = {
  props: {
    PascalCase: "bar",
  },
  key: 1,
};
const stc2 = {
  props: {
    Hyphen: "bar",
  },
  key: 2,
};
const stc3 = {
  props: {
    hyphen3pecial: "bar",
  },
  key: 3,
};
const stc4 = {
  props: {
    hyphenSSpecial: "bar",
  },
  key: 4,
};
const stc5 = {
  props: {
    hyphenÀpecial: "bar",
  },
  key: 5,
};
const stc6 = {
  props: {
    hyphenªpecial: "bar",
  },
  key: 6,
};
const stc7 = {
  props: {
    "hyphen🎉pecial": "bar",
  },
  key: 7,
};
const stc8 = {
  props: {
    "hyphen🇺🇸pecial": "bar",
  },
  key: 8,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-button", _xButton, stc0),
    api_custom_element("x-button", _xButton, stc1),
    api_custom_element("x-button", _xButton, stc2),
    api_custom_element("x-button", _xButton, stc3),
    api_custom_element("x-button", _xButton, stc4),
    api_custom_element("x-button", _xButton, stc5),
    api_custom_element("x-button", _xButton, stc6),
    api_custom_element("x-button", _xButton, stc7),
    api_custom_element("x-button", _xButton, stc8),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4rpc6om82jo";
tmpl.legacyStylesheetToken = "x-valid-hyphen-attribute_valid-hyphen-attribute";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
