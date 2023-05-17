import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<input required value="boolean present"${3}>`;
const $fragment2 = parseFragment`<input required="" value="empty string"${3}>`;
const $fragment3 = parseFragment`<input required="other than true" value="string value"${3}>`;
const $fragment4 = parseFragment`<input required="3" value="integer value"${3}>`;
const stc0 = {
  value: "computed value",
};
const stc1 = {
  props: {
    required: true,
  },
  key: 9,
};
const stc2 = ["boolean present"];
const stc3 = {
  props: {
    required: "",
  },
  key: 10,
};
const stc4 = ["empty string"];
const stc5 = {
  props: {
    required: "other than true",
  },
  key: 11,
};
const stc6 = ["string value"];
const stc7 = ["computed value, should be resolved in component"];
const stc8 = {
  props: {
    required: "3",
  },
  key: 13,
};
const stc9 = ["integer value"];
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
      "input",
      {
        attrs: {
          required: $cmp.computed ? "" : null,
        },
        props: stc0,
        key: 6,
      },
      undefined,
      96
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
          required: $cmp.computed,
        },
        key: 12,
      },
      stc7,
      192
    ),
    api_custom_element("x-foo", _xFoo, stc8, stc9, 192),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
