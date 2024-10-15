import _implicitStylesheets from "./not-optimized.css";
import _implicitScopedStylesheets from "./not-optimized.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    "data-id": "these-should-be-false",
  },
  key: 0,
};
const stc1 = {
  attrs: {
    spellcheck: false,
  },
  key: 1,
};
const stc2 = {
  attrs: {
    spellcheck: false,
  },
  key: 2,
};
const stc3 = {
  attrs: {
    "data-id": "these-should-be-empty-string",
  },
  key: 3,
};
const stc4 = {
  attrs: {
    spellcheck: "",
  },
  key: 4,
};
const stc5 = {
  attrs: {
    "data-id": "these-should-be-true",
  },
  key: 5,
};
const stc6 = {
  attrs: {
    spellcheck: true,
  },
  key: 6,
};
const stc7 = {
  attrs: {
    spellcheck: true,
  },
  key: 7,
};
const stc8 = {
  attrs: {
    spellcheck: true,
  },
  key: 8,
};
const stc9 = {
  attrs: {
    spellcheck: true,
  },
  key: 9,
};
const stc10 = {
  attrs: {
    spellcheck: true,
  },
  key: 10,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_element("div", stc1),
      api_element("div", stc2),
    ]),
    api_element("section", stc3, [api_element("div", stc4)]),
    api_element("section", stc5, [
      api_element("div", stc6),
      api_element("div", stc7),
      api_element("div", stc8),
      api_element("div", stc9),
      api_element("div", stc10),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-76f842e7084";
tmpl.legacyStylesheetToken = "x-not-optimized_not-optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
