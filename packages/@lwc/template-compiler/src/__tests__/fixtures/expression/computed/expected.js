import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, t: api_text, i: api_iterator, f: api_flatten } = $api;
  return api_flatten([
    api_dynamic($cmp.val),
    api_text(" "),
    api_dynamic($cmp.val[$cmp.state.foo]),
    api_text(" "),
    api_dynamic($cmp.val[$cmp.state.foo][$cmp.state.bar]),
    api_iterator($cmp.arr, function(item, index) {
      return [
        api_dynamic($cmp.arr[index]),
        api_text(" "),
        api_dynamic($cmp.arr[$cmp.state.val])
      ];
    })
  ]);
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
