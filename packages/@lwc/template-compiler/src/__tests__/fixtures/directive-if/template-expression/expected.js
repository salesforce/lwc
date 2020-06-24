import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 3,
      },
      [
        $cmp.state.isTrue ? api_dynamic($cmp.foo, 0) : null,
        $cmp.state.isTrue ? api_text(" ", 1) : null,
        $cmp.state.isTrue ? api_dynamic($cmp.bar, 2) : null,
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
