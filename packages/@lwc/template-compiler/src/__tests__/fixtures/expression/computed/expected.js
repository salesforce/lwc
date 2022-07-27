import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_text(
      api_dynamic_text($cmp.val) +
        " " +
        api_dynamic_text($cmp.val[$cmp.state.foo]) +
        " " +
        api_dynamic_text($cmp.val[$cmp.state.foo][$cmp.state.bar])
    ),
    api_fragment(
      0,
      api_iterator($cmp.arr, function (item, index) {
        return api_text(
          api_dynamic_text($cmp.arr[index]) +
            " " +
            api_dynamic_text($cmp.arr[$cmp.state.val])
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
