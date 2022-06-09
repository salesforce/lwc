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
const stc2 = {
  props: {
    required: "",
  },
  key: 10,
};
const stc3 = {
  props: {
    required: "other than true",
  },
  key: 11,
};
const stc4 = {
  props: {
    required: "3",
  },
  key: 13,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    h: api_element,
    t: api_text,
    c: api_custom_element,
  } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_static_fragment($fragment3(), 5),
    api_element("input", {
      attrs: {
        required: $cmp.computed ? "" : null,
      },
      props: stc0,
      key: 6,
    }),
    api_static_fragment($fragment4(), 8),
    api_custom_element("x-foo", _xFoo, stc1, [api_text("boolean present")]),
    api_custom_element("x-foo", _xFoo, stc2, [api_text("empty string")]),
    api_custom_element("x-foo", _xFoo, stc3, [api_text("string value")]),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          required: $cmp.computed,
        },
        key: 12,
      },
      [api_text("computed value, should be resolved in component")]
    ),
    api_custom_element("x-foo", _xFoo, stc4, [api_text("integer value")]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
