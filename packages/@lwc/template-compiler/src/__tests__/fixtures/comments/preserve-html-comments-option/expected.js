import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}>click me</button>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    api_comment(" This is an HTML comment "),
    api_static_fragment($fragment1(), 1),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
