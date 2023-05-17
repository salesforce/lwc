import _nsCmp from "ns/cmp";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    slot: "",
  },
  key: 2,
};
const stc3 = ["S1"];
const stc4 = {
  attrs: {
    slot: "",
  },
  key: 3,
};
const stc5 = ["S2"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element } = $api;
  return [
    api_element(
      "section",
      stc0,
      [
        api_custom_element(
          "ns-cmp",
          _nsCmp,
          stc1,
          [
            $cmp.isTrue ? api_element("p", stc2, stc3, 160) : null,
            api_element("p", stc4, stc5, 160),
          ],
          0
        ),
      ],
      0
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
