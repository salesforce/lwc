import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { i: api_iterator, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          api_iterator($cmp.items, function (item) {
            return "Conditional Iteration";
          }),
          0
        )
      : api_fragment(
          0,
          api_iterator($cmp.altItems, function (item) {
            return "Else Iteration";
          }),
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
