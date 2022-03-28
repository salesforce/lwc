import _xFoo from "x/foo";
import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  h: api_element,
  so: api_set_owner,
  c: api_custom_element,
} = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    attrs: {
      hidden: "",
    },
    key: 0,
    isStatic: true,
  },
  [api_text("boolean present")]
);
const $hoisted2 = api_element(
  "p",
  {
    attrs: {
      hidden: "",
    },
    key: 1,
    isStatic: true,
  },
  [api_text("empty string, should be true")]
);
const $hoisted3 = api_element(
  "p",
  {
    attrs: {
      hidden: "other than true",
    },
    key: 2,
    isStatic: true,
  },
  [api_text("string value, should be true")]
);
const $hoisted4 = api_text("computed value, should be resolved in component");
const $hoisted5 = api_element(
  "p",
  {
    attrs: {
      hidden: "3",
    },
    key: 4,
    isStatic: true,
  },
  [api_text("integer value, should be true")]
);
const $hoisted6 = api_text("boolean present");
const $hoisted7 = api_text("empty string, should be true");
const $hoisted8 = api_text("string value, should be true");
const $hoisted9 = api_text("computed value, should be resolved in component");
const $hoisted10 = api_text("integer value, should be true");
const stc0 = {
  props: {
    hidden: true,
  },
  key: 5,
};
const stc1 = {
  props: {
    hidden: true,
  },
  key: 6,
};
const stc2 = {
  props: {
    hidden: true,
  },
  key: 7,
};
const stc3 = {
  props: {
    hidden: true,
  },
  key: 9,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_set_owner($hoisted1),
    api_set_owner($hoisted2),
    api_set_owner($hoisted3),
    api_element(
      "p",
      {
        attrs: {
          hidden: $cmp.computed ? "" : null,
        },
        key: 3,
      },
      [api_set_owner($hoisted4)]
    ),
    api_set_owner($hoisted5),
    api_custom_element("x-foo", _xFoo, stc0, [api_set_owner($hoisted6)]),
    api_custom_element("x-foo", _xFoo, stc1, [api_set_owner($hoisted7)]),
    api_custom_element("x-foo", _xFoo, stc2, [api_set_owner($hoisted8)]),
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          hidden: $cmp.computed,
        },
        key: 8,
      },
      [api_set_owner($hoisted9)]
    ),
    api_custom_element("x-foo", _xFoo, stc3, [api_set_owner($hoisted10)]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
