import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p hidden${3}>boolean present</p>`;
const $fragment2 = parseFragment`<p hidden=""${3}>empty string, should be true</p>`;
const $fragment3 = parseFragment`<p hidden="other than true"${3}>string value, should be true</p>`;
const $fragment4 = parseFragment`<p hidden="3"${3}>integer value, should be true</p>`;
const stc0 = ["computed value, should be resolved in component"];
const stc1 = {
  props: {
    hidden: true,
  },
  key: 9,
};
const stc2 = ["boolean present"];
const stc3 = {
  props: {
    hidden: true,
  },
  key: 10,
};
const stc4 = ["empty string, should be true"];
const stc5 = {
  props: {
    hidden: true,
  },
  key: 11,
};
const stc6 = ["string value, should be true"];
const stc7 = {
  props: {
    hidden: true,
  },
  key: 13,
};
const stc8 = ["integer value, should be true"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
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
      stc0,
      160
    ),
    api_static_fragment($fragment4(), 8),
    api_custom_element("x-foo", _xFoo, stc1, stc2, 192),
    api_custom_element("x-foo", _xFoo, stc3, stc4, 192),
    api_custom_element("x-foo", _xFoo, stc5, stc6, 192),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: $cmp.computed,
        },
        key: 12,
      },
      stc0,
      192
    ),
    api_custom_element("x-foo", _xFoo, stc7, stc8, 192),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
