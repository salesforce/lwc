import _xChild from "x/child";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-child", _xChild, {
        props: {
          attr: $cmp.foo >> $cmp.bar,
        },
        key: 1,
      }),
      api_custom_element("x-child", _xChild, {
        props: {
          attr: $cmp.foo << $cmp.bar,
        },
        key: 2,
      }),
      api_custom_element("x-child", _xChild, {
        props: {
          attr: $cmp.foo >>> $cmp.bar,
        },
        key: 3,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
