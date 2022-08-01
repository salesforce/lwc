import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<iframe allow="geolocation https://google-developers.appspot.com"${3}></iframe>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1(), 1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
