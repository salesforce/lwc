import _implicitStylesheets from "./synthetic-shadow.css";
import _implicitScopedStylesheets from "./synthetic-shadow.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    t: api_text,
    h: api_element,
    fid: api_scoped_frag_id,
  } = $api;
  return [
    api_element(
      "label",
      {
        attrs: {
          for: api_scoped_id("foo"),
        },
        key: 0,
      },
      [api_text("Click me:")]
    ),
    api_element("input", {
      attrs: {
        type: "checkbox",
        id: api_scoped_id("foo"),
      },
      key: 1,
    }),
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id("#bar"),
        },
        key: 2,
      },
      [api_text("Click to scroll")]
    ),
    api_element(
      "section",
      {
        attrs: {
          id: api_scoped_id("bar"),
        },
        key: 3,
      },
      [api_text("Scroll to me")]
    ),
    api_element(
      "label",
      {
        attrs: {
          for: api_scoped_id($cmp.foo),
        },
        key: 4,
      },
      [api_text("Click me:")]
    ),
    api_element("input", {
      attrs: {
        type: "checkbox",
        id: api_scoped_id($cmp.foo),
      },
      key: 5,
    }),
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id($cmp.bar),
        },
        key: 6,
      },
      [api_text("Click to scroll")]
    ),
    api_element(
      "section",
      {
        attrs: {
          id: api_scoped_id($cmp.bar),
        },
        key: 7,
      },
      [api_text("Scroll to me")]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-520i124ag3i";
tmpl.legacyStylesheetToken = "x-synthetic-shadow_synthetic-shadow";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
