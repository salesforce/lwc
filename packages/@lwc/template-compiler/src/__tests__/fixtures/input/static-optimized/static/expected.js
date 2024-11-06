import _implicitStylesheets from "./static.css";
import _implicitScopedStylesheets from "./static.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input disabled${3}>`;
const $fragment2 = parseFragment`<input disabled${3}>`;
const $fragment3 = parseFragment`<input disabled="disabled"${3}>`;
const $fragment4 = parseFragment`<input disabled="FALSE"${3}>`;
const $fragment5 = parseFragment`<input disabled="TRUE"${3}>`;
const $fragment6 = parseFragment`<input disabled="yolo"${3}>`;
const stc0 = {
  props: {
    checked: true,
  },
  key: 0,
};
const stc1 = {
  attrs: {
    type: "checkbox",
  },
  props: {
    checked: true,
  },
  key: 1,
};
const stc2 = {
  attrs: {
    type: "checkbox",
  },
  props: {
    checked: true,
  },
  key: 2,
};
const stc3 = {
  attrs: {
    type: "checkbox",
  },
  props: {
    checked: true,
  },
  key: 3,
};
const stc4 = {
  attrs: {
    type: "checkbox",
  },
  props: {
    checked: true,
  },
  key: 4,
};
const stc5 = {
  attrs: {
    type: "checkbox",
  },
  props: {
    checked: true,
  },
  key: 5,
};
const stc6 = {
  props: {
    value: true,
  },
  key: 6,
};
const stc7 = {
  props: {
    value: "",
  },
  key: 7,
};
const stc8 = {
  props: {
    value: "value",
  },
  key: 8,
};
const stc9 = {
  props: {
    value: "false",
  },
  key: 9,
};
const stc10 = {
  props: {
    value: "true",
  },
  key: 10,
};
const stc11 = {
  props: {
    value: "FALSE",
  },
  key: 11,
};
const stc12 = {
  props: {
    value: "TRUE",
  },
  key: 12,
};
const stc13 = {
  props: {
    value: "yolo",
  },
  key: 13,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, st: api_static_fragment } = $api;
  return [
    api_element("input", stc0),
    api_element("input", stc1),
    api_element("input", stc2),
    api_element("input", stc3),
    api_element("input", stc4),
    api_element("input", stc5),
    api_element("input", stc6),
    api_element("input", stc7),
    api_element("input", stc8),
    api_element("input", stc9),
    api_element("input", stc10),
    api_element("input", stc11),
    api_element("input", stc12),
    api_element("input", stc13),
    api_static_fragment($fragment1, 15),
    api_static_fragment($fragment2, 17),
    api_static_fragment($fragment3, 19),
    api_static_fragment($fragment4, 21),
    api_static_fragment($fragment5, 23),
    api_static_fragment($fragment6, 25),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-548g1ondp5s";
tmpl.legacyStylesheetToken = "x-static_static";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
