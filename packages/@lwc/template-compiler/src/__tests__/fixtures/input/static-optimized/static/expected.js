import _implicitStylesheets from "./static.css";
import _implicitScopedStylesheets from "./static.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input${3}>`;
const $fragment2 = parseFragment`<input type="checkbox"${3}>`;
const $fragment3 = parseFragment`<input type="checkbox"${3}>`;
const $fragment4 = parseFragment`<input type="checkbox"${3}>`;
const $fragment5 = parseFragment`<input type="checkbox"${3}>`;
const $fragment6 = parseFragment`<input type="checkbox"${3}>`;
const $fragment7 = parseFragment`<input${3}>`;
const $fragment8 = parseFragment`<input${3}>`;
const $fragment9 = parseFragment`<input${3}>`;
const $fragment10 = parseFragment`<input${3}>`;
const $fragment11 = parseFragment`<input${3}>`;
const $fragment12 = parseFragment`<input${3}>`;
const $fragment13 = parseFragment`<input${3}>`;
const $fragment14 = parseFragment`<input${3}>`;
const $fragment15 = parseFragment`<input disabled${3}>`;
const $fragment16 = parseFragment`<input disabled${3}>`;
const $fragment17 = parseFragment`<input disabled="disabled"${3}>`;
const $fragment18 = parseFragment`<input disabled="FALSE"${3}>`;
const $fragment19 = parseFragment`<input disabled="TRUE"${3}>`;
const $fragment20 = parseFragment`<input disabled="yolo"${3}>`;
const stc0 = {
  props: {
    checked: true,
  },
};
const stc1 = {
  props: {
    checked: "",
  },
};
const stc2 = {
  props: {
    checked: "checked",
  },
};
const stc3 = {
  props: {
    checked: "FALSE",
  },
};
const stc4 = {
  props: {
    checked: "TRUE",
  },
};
const stc5 = {
  props: {
    checked: "yolo",
  },
};
const stc6 = {
  props: {
    value: true,
  },
};
const stc7 = {
  props: {
    value: "",
  },
};
const stc8 = {
  props: {
    value: "value",
  },
};
const stc9 = {
  props: {
    value: "false",
  },
};
const stc10 = {
  props: {
    value: "true",
  },
};
const stc11 = {
  props: {
    value: "FALSE",
  },
};
const stc12 = {
  props: {
    value: "TRUE",
  },
};
const stc13 = {
  props: {
    value: "yolo",
  },
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { sp: api_static_part, st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1, [api_static_part(0, stc0, null)]),
    api_static_fragment($fragment2, 3, [api_static_part(0, stc1, null)]),
    api_static_fragment($fragment3, 5, [api_static_part(0, stc2, null)]),
    api_static_fragment($fragment4, 7, [api_static_part(0, stc3, null)]),
    api_static_fragment($fragment5, 9, [api_static_part(0, stc4, null)]),
    api_static_fragment($fragment6, 11, [api_static_part(0, stc5, null)]),
    api_static_fragment($fragment7, 13, [api_static_part(0, stc6, null)]),
    api_static_fragment($fragment8, 15, [api_static_part(0, stc7, null)]),
    api_static_fragment($fragment9, 17, [api_static_part(0, stc8, null)]),
    api_static_fragment($fragment10, 19, [api_static_part(0, stc9, null)]),
    api_static_fragment($fragment11, 21, [api_static_part(0, stc10, null)]),
    api_static_fragment($fragment12, 23, [api_static_part(0, stc11, null)]),
    api_static_fragment($fragment13, 25, [api_static_part(0, stc12, null)]),
    api_static_fragment($fragment14, 27, [api_static_part(0, stc13, null)]),
    api_static_fragment($fragment15, 29),
    api_static_fragment($fragment16, 31),
    api_static_fragment($fragment17, 33),
    api_static_fragment($fragment18, 35),
    api_static_fragment($fragment19, 37),
    api_static_fragment($fragment20, 39),
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
