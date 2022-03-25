import { registerTemplate, renderApi } from "lwc";
const { h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "div",
  {
    classMap: {
      foo: true,
    },
    key: 0,
  },
  []
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
  []
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
  []
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
  []
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_set_owner($hoisted1),
    api_set_owner($hoisted2),
    api_set_owner($hoisted3),
    api_set_owner($hoisted4),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
