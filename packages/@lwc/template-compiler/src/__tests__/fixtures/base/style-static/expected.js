import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section style="font-size: 12px; color: red; margin: 10px 5px 10px"${3}></section>`;
const $fragment2 = parseFragment`<section style="--my-color: blue; color: var(--my-color)"${3}></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
