import _implicitStylesheets from "./dynamic.css";
import _implicitScopedStylesheets from "./dynamic.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment2 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment3 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment4 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment5 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment6 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment7 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment8 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment9 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment10 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment11 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment12 = parseFragment`<input${"a0:disabled"}${3}>`;
const $fragment13 = parseFragment`<input${"a0:disabled"}${3}>`;
const stc0 = {
  type: "checkbox",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, sp: api_static_part, st: api_static_fragment } = $api;
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
    api_static_fragment($fragment1, 27, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isUndefined ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 29, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isNull ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment3, 31, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isFalse ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment4, 33, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isTrue ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment5, 35, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isZero ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment6, 37, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isNegZero ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment7, 39, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isNaN ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment8, 41, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isInfinity ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment9, 43, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isNegInfinity ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment10, 45, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isEmptyString ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment11, 47, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isSymbol ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment12, 49, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isArray ? "" : null,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment13, 51, [
      api_static_part(
        0,
        {
          attrs: {
            disabled: $cmp.isObject ? "" : null,
          },
        },
        null
      ),
    ]),
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
