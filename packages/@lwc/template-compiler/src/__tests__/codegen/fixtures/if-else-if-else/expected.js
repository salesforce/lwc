import {registerTemplate} from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {t: api_text} = $api;
  return [$cmp.ifCondition ? [api_text("If!")] : $cmp.elseIfCondition ? [api_text("ElseIf!")] : [api_text("Else!")]];
  /*LWC compiler v2.21.1*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
