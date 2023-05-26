import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg version="1.1" baseProfile="full" width="300" height="200" xmlns="http://www.w3.org/2000/svg"${3}><rect width="100%" height="100%" fill="red"${3}/><circle cx="150" cy="100" r="80" fill="green"${3}/><text x="150" y="125" font-size="60" text-anchor="middle" fill="white"${3}>SVG</text></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
