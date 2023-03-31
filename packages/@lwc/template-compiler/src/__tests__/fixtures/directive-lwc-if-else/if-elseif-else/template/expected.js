import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_text("Conditional Text")], 0)
      : $cmp.elseifCondition
      ? api_fragment(0, [api_text("Elseif!")], 0)
      : api_fragment(0, [api_text("Else!")], 0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
