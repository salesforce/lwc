import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [
        $cmp.state.isTrue
          ? api_text(
              api_dynamic_text($cmp.foo) + " " + api_dynamic_text($cmp.bar)
            )
          : null,
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
