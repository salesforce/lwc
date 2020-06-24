import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, h: api_element } = $api;
  return [
    api_element(
      "p",
      {
        key: 1,
      },
      [api_dynamic($cmp.text, 0)]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
