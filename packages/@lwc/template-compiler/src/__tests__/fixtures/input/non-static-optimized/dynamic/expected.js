import _implicitStylesheets from "./dynamic.css";
import _implicitScopedStylesheets from "./dynamic.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  type: "checkbox",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isUndefined,
      },
      key: 0,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isNull,
      },
      key: 1,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isFalse,
      },
      key: 2,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isTrue,
      },
      key: 3,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isZero,
      },
      key: 4,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isNegZero,
      },
      key: 5,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isNaN,
      },
      key: 6,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isInfinity,
      },
      key: 7,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isNegInfinity,
      },
      key: 8,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isEmptyString,
      },
      key: 9,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isSymbol,
      },
      key: 10,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isArray,
      },
      key: 11,
    }),
    api_element("input", {
      attrs: stc0,
      props: {
        checked: $cmp.isObject,
      },
      key: 12,
    }),
    api_element("input", {
      props: {
        value: $cmp.isUndefined,
      },
      key: 13,
    }),
    api_element("input", {
      props: {
        value: $cmp.isNull,
      },
      key: 14,
    }),
    api_element("input", {
      props: {
        value: $cmp.isFalse,
      },
      key: 15,
    }),
    api_element("input", {
      props: {
        value: $cmp.isTrue,
      },
      key: 16,
    }),
    api_element("input", {
      props: {
        value: $cmp.isZero,
      },
      key: 17,
    }),
    api_element("input", {
      props: {
        value: $cmp.isNegZero,
      },
      key: 18,
    }),
    api_element("input", {
      props: {
        value: $cmp.isNaN,
      },
      key: 19,
    }),
    api_element("input", {
      props: {
        value: $cmp.isInfinity,
      },
      key: 20,
    }),
    api_element("input", {
      props: {
        value: $cmp.isNegInfinity,
      },
      key: 21,
    }),
    api_element("input", {
      props: {
        value: $cmp.isEmptyString,
      },
      key: 22,
    }),
    api_element("input", {
      props: {
        value: $cmp.isSymbol,
      },
      key: 23,
    }),
    api_element("input", {
      props: {
        value: $cmp.isArray,
      },
      key: 24,
    }),
    api_element("input", {
      props: {
        value: $cmp.isObject,
      },
      key: 25,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isUndefined ? "" : null,
      },
      key: 26,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isNull ? "" : null,
      },
      key: 27,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isFalse ? "" : null,
      },
      key: 28,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isTrue ? "" : null,
      },
      key: 29,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isZero ? "" : null,
      },
      key: 30,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isNegZero ? "" : null,
      },
      key: 31,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isNaN ? "" : null,
      },
      key: 32,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isInfinity ? "" : null,
      },
      key: 33,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isNegInfinity ? "" : null,
      },
      key: 34,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isEmptyString ? "" : null,
      },
      key: 35,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isSymbol ? "" : null,
      },
      key: 36,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isArray ? "" : null,
      },
      key: 37,
    }),
    api_element("input", {
      attrs: {
        disabled: $cmp.isObject ? "" : null,
      },
      key: 38,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-32cmakp1ss8";
tmpl.legacyStylesheetToken = "x-dynamic_dynamic";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
