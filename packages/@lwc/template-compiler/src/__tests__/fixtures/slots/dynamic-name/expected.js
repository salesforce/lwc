import _nsCmp from "ns/cmp";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element } = $api;
  return [
    api_custom_element("ns-cmp", _nsCmp, stc0, [
      api_element("p", {
        slotAssignment: $cmp.mySlot,
        key: 1,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
