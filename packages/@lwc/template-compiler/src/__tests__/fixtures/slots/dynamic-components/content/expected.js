import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: "@:1",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    dc: api_dynamic_component,
    s: api_slot,
  } = $api;
  return [
    api_slot(
      "",
      stc0,
      [
        api_dynamic_component($cmp.ctor, stc1, [
          api_text(api_dynamic_text($cmp.defaultContent)),
        ]),
      ],
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
