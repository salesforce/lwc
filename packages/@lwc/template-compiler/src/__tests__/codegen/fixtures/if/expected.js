import {registerTemplate} from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {t: api_text} = $api;
  return $cmp.ifCondition ? [api_text("Just the if")] : stc0;
  /*LWC compiler v2.21.1*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
