import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, i: api_iterator } = $api;
  return $cmp.visible
    ? api_iterator($cmp.items, function (item) {
        return api_text("Conditional Iteration");
      })
    : api_iterator($cmp.altItems, function (item) {
        return api_text("Else Iteration");
      });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
