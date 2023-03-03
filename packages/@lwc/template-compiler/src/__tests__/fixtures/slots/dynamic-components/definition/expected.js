import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: "@:2",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    s: api_slot,
    dc: api_dynamic_component,
  } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_slot(
        "",
        stc1,
        [
          api_element("p", stc2, [
            api_text(api_dynamic_text($cmp.defaultContent)),
          ]),
        ],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
