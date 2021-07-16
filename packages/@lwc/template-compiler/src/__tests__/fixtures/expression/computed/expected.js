import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { val: $cv0_0, state: $cv0_1, arr: $cv0_2 } = $cmp;
  function foreach1_0(item, index) {
    return [
      api_dynamic($cv0_2[index]),
      api_text(" "),
      api_dynamic($cv0_2[$cv0_1.val]),
    ];
  }
  const { d: api_dynamic, t: api_text, i: api_iterator, f: api_flatten } = $api;
  return api_flatten([
    api_dynamic($cv0_0),
    api_text(" "),
    api_dynamic($cv0_0[$cv0_1.foo]),
    api_text(" "),
    api_dynamic($cv0_0[$cv0_1.foo][$cv0_1.bar]),
    api_iterator($cv0_2, foreach1_0),
  ]);
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
