import _implicitStylesheets from "./non-static-optimized.css";
import _implicitScopedStylesheets from "./non-static-optimized.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    "these-are-dynamic": true,
  },
  key: 0,
};
const stc1 = {
  classMap: {
    "these-are-static": true,
  },
  key: 2,
};
const stc2 = {
  classMap: {
    "these-are-boolean-true": true,
  },
  key: 4,
};
const stc3 = {
  attrs: {
    "aria-describedby": "",
    "aria-activedescendant": "",
    "aria-errormessage": "",
    "aria-flowto": "",
    "aria-labelledby": "",
    for: "",
    id: "",
  },
  key: 5,
};
const stc4 = {
  classMap: {
    "these-are-the-empty-string": true,
  },
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_element("div", {
        attrs: {
          "aria-describedby": api_scoped_id($cmp.scoped),
          "aria-activedescendant": api_scoped_id($cmp.scoped),
          "aria-errormessage": api_scoped_id($cmp.scoped),
          "aria-flowto": api_scoped_id($cmp.scoped),
          "aria-labelledby": api_scoped_id($cmp.scoped),
          for: api_scoped_id($cmp.scoped),
          id: api_scoped_id($cmp.scoped),
        },
        key: 1,
      }),
    ]),
    api_element("section", stc1, [
      api_element("div", {
        attrs: {
          "aria-describedby": api_scoped_id("yolo"),
          "aria-activedescendant": api_scoped_id("yolo"),
          "aria-errormessage": api_scoped_id("yolo"),
          "aria-flowto": api_scoped_id("yolo"),
          "aria-labelledby": api_scoped_id("yolo"),
          for: api_scoped_id("yolo"),
          id: api_scoped_id("yolo"),
        },
        key: 3,
      }),
    ]),
    api_element("section", stc2, [api_element("div", stc3)]),
    api_element("section", stc4, [
      api_element("div", {
        attrs: {
          "aria-describedby": api_scoped_id(""),
          "aria-activedescendant": api_scoped_id(""),
          "aria-errormessage": api_scoped_id(""),
          "aria-flowto": api_scoped_id(""),
          "aria-labelledby": api_scoped_id(""),
          for: api_scoped_id(""),
          id: api_scoped_id(""),
        },
        key: 7,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-d9girnpd2k";
tmpl.legacyStylesheetToken = "x-non-static-optimized_non-static-optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
