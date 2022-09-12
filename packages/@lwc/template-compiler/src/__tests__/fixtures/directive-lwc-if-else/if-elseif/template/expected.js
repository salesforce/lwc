import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment("if-fr0", [api_text("Conditional Text")])
      : api_fragment("if-fr0", [
          $cmp.displayAlt
            ? api_fragment("if-fr0", [api_text("Elseif!")])
            : api_fragment("if-fr0", stc0),
        ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
