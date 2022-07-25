import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p hidden${3}>boolean present</p>`;
const $fragment2 = parseFragment`<p hidden=""${3}>empty string, should be true</p>`;
const $fragment3 = parseFragment`<p hidden="other than true"${3}>string value, should be true</p>`;
const $fragment4 = parseFragment`<p hidden="3"${3}>integer value, should be true</p>`;
const stc0 = {
  props: {
    hidden: true,
  },
  key: 9,
};
const stc1 = {
  props: {
    hidden: true,
  },
  key: 10,
};
const stc2 = {
  props: {
    hidden: true,
  },
  key: 11,
};
const stc3 = {
  props: {
    hidden: true,
  },
  key: 13,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    h: api_element,
    c: api_custom_element,
  } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_static_fragment($fragment3(), 5),
    api_element(
      "p",
      {
        attrs: {
          hidden: $cmp.computed ? "" : null,
        },
        key: 6,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_static_fragment($fragment4(), 8),
    api_custom_element("x-foo", _xFoo, stc0, [api_text("boolean present")]),
    api_custom_element("x-foo", _xFoo, stc1, [
      api_text("empty string, should be true"),
    ]),
    api_custom_element("x-foo", _xFoo, stc2, [
      api_text("string value, should be true"),
    ]),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: $cmp.computed,
        },
        key: 12,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element("x-foo", _xFoo, stc3, [
      api_text("integer value, should be true"),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
