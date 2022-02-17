import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    allow: "geolocation https://google-developers.appspot.com",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("iframe", stc0)];
  /*LWC compiler v1*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
