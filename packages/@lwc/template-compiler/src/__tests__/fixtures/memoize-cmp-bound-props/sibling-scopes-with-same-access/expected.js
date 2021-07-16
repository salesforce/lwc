import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if2_0() {
    const { foo: $cv2_0 } = $cmp;
    return [api_dynamic($cv2_0), api_dynamic($cv2_0)];
  }
  function if1_0() {
    const { foo: $cv1_0 } = $cmp;
    return [api_dynamic($cv1_0), api_dynamic($cv1_0)];
  }
  const { d: api_dynamic } = $api;
  return [
    ...($cmp.truthyPath ? if1_0() : [null, null]),
    ...(!$cmp.falsyPath ? if2_0() : [null, null]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
