import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    $cmp.ctor
      ? api_custom_element(
          "x-placeholder",
          $cmp.ctor,
          {
            key: 2
          },
          []
        )
      : null
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
