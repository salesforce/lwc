import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text } = $api;
  return [
    $cmp.ifCondition ? api_text("If!") : [
        $cmp.elseifCondition ? api_text("Elseif!") : [
            $cmp.elseif2Condition ? api_text("Elseif two!"): [
                $cmp.elseif3Condition ? api_text("Elseif three!"): api_text("Else!")]]]];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
