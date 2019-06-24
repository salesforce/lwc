import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0
      },
      [
        $cmp.state.isTrue ? api_dynamic($cmp.foo) : null,
        $cmp.state.isTrue ? api_text(" ") : null,
        $cmp.state.isTrue ? api_dynamic($cmp.bar) : null
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
