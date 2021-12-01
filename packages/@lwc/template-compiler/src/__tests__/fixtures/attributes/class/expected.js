import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    foo: true,
  },
  key: 0,
};
const stc1 = [];
const stc2 = {
  classMap: {
    foo: true,
    bar: true,
  },
  key: 1,
};
const stc3 = {
  classMap: {
    foo: true,
    bar: true,
  },
  key: 2,
};
const stc4 = {
  classMap: {
    foo: true,
    bar: true,
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("div", stc0, stc1),
    api_element("div", stc2, stc1),
    api_element("div", stc3, stc1),
    api_element("div", stc4, stc1),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
