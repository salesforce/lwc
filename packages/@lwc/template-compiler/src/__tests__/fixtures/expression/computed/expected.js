import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_text(
      api_dynamic_text($cmp.val) +
        " " +
        api_dynamic_text($cmp.val[$cmp.state.foo]) +
        " " +
        api_dynamic_text($cmp.val[$cmp.state.foo][$cmp.state.bar])
    ),
    api_iterator($cmp.arr, function (item, index) {
      return api_text(
        api_dynamic_text($cmp.arr[index]) +
          " " +
          api_dynamic_text($cmp.arr[$cmp.state.val])
      );
    }),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
