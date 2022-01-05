import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, t: api_text, h: api_element } = $api;
  return [
    $cmp.truthyValue ? api_comment(" HTML comment inside if:true ") : null,
    $cmp.truthyValue
      ? api_element(
          "p",
          {
            key: 0,
          },
          [api_text("true branch")]
        )
      : null,
    !$cmp.truthyValue ? api_comment(" HTML comment inside if:false ") : null,
    !$cmp.truthyValue
      ? api_element(
          "p",
          {
            key: 1,
          },
          [api_text("false branch")]
        )
      : null,
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
