import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const $hoisted1 = api_element(
  "div",
  {
    classMap: {
      foo: true,
    },
    key: 0,
  },
  [],
  true
);
const $hoisted2 = api_element(
  "div",
  {
    classMap: {
      foo: true,
      bar: true,
    },
    key: 1,
  },
  [],
  true
);
const $hoisted3 = api_element(
  "div",
  {
    classMap: {
      foo: true,
      bar: true,
    },
    key: 2,
  },
  [],
  true
);
const $hoisted4 = api_element(
  "div",
  {
    classMap: {
      foo: true,
      bar: true,
    },
    key: 3,
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1, $hoisted2, $hoisted3, $hoisted4];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
