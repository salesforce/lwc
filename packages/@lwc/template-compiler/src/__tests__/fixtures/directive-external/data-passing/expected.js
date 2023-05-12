import _xTest from "x/test";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element(
      "x-test",
      _xTest,
      {
        props: {
          abc: $cmp.def,
        },
        key: 0,
      },
      undefined,
      16
    ),
    api_element(
      "x-test",
      {
        attrs: {
          ghi: $cmp.jkl,
        },
        key: 1,
        external: true,
      },
      undefined,
      8
    ),
    api_element(
      "foo-bar",
      {
        attrs: {
          mno: $cmp.pqr,
        },
        key: 2,
        external: true,
      },
      undefined,
      8
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
