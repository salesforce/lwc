import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    foo: true,
  },
  key: 0,
};
const stc1 = {
  classMap: {
    foo: true,
    bar: true,
  },
  key: 1,
};
const stc2 = {
  classMap: {
    foo: true,
    bar: true,
  },
  key: 2,
};
const stc3 = {
  classMap: {
    foo: true,
    bar: true,
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", stc0),
    api_element("div", stc1),
    api_element("div", stc2),
    api_element("div", stc3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
