import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    tabIndex: "0",
    ariaAtomic: true,
    myProp: "value",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return [api_dynamic_component($cmp.ctor, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
