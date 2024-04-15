import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p hidden${3}>x</p>`;
const $fragment2 = parseFragment`<input${"a0:readonly"} disabled title="foo"${3}>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, sp: api_static_part } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        0,
        {
          attrs: {
            readonly: $cmp.getReadOnly ? "" : null,
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
