import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    href: "#yasaka-taxi",
  },
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    href: "#eneos-gas",
  },
  key: 2,
};
const stc3 = [];
const stc4 = {
  attrs: {
    href: "#kawaramachi",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("a", stc0, [api_text("Yasaka Taxi")]),
    api_element("map", stc1, [
      api_element("area", stc2, stc3),
      api_element("area", stc4, stc3),
    ]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
