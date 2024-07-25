import _implicitStylesheets from "./light.css";
import _implicitScopedStylesheets from "./light.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    for: "foo",
  },
  key: 0,
};
const stc1 = {
  attrs: {
    type: "checkbox",
    id: "foo",
  },
  key: 1,
};
const stc2 = {
  attrs: {
    href: "#bar",
  },
  key: 2,
};
const stc3 = {
  attrs: {
    id: "bar",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("label", stc0, [api_text("Click me:")]),
    api_element("input", stc1),
    api_element("a", stc2, [api_text("Click to scroll")]),
    api_element("section", stc3, [api_text("Scroll to me")]),
    api_element(
      "label",
      {
        attrs: {
          for: $cmp.foo,
        },
        key: 4,
      },
      [api_text("Click me:")]
    ),
    api_element("input", {
      attrs: {
        type: "checkbox",
        id: $cmp.foo,
      },
      key: 5,
    }),
    api_element(
      "a",
      {
        attrs: {
          href: $cmp.bar,
        },
        key: 6,
      },
      [api_text("Click to scroll")]
    ),
    api_element(
      "section",
      {
        attrs: {
          id: $cmp.bar,
        },
        key: 7,
      },
      [api_text("Scroll to me")]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1kadf5igpar";
tmpl.legacyStylesheetToken = "x-light_light";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
