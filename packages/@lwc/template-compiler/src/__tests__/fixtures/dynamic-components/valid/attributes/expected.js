import { registerTemplate } from "lwc";
const stc0 = {
  "slds-style": true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { b: api_bind, dc: api_dynamic_component } = $api;
  const { _m0 } = $ctx;
  return [
    api_dynamic_component($cmp.ctor, {
      classMap: stc0,
      slotAssignment: "slotName",
      key: 0,
      on: {
        click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick)),
      },
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
