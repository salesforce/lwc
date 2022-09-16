import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text } = $api;
  return [
    $cmp.showItems ? api_text("if true") : null,
    !$cmp.showItems ? api_text("if false") : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
