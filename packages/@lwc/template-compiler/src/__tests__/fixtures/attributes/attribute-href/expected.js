import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    href: "#yasaka-taxi",
  },
  key: 0,
};
const stc1 = ["Yasaka Taxi"];
const stc2 = {
  key: 1,
};
const stc3 = {
  attrs: {
    href: "#eneos-gas",
  },
  key: 2,
};
const stc4 = {
  attrs: {
    href: "#kawaramachi",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("a", stc0, stc1, 160),
    api_element(
      "map",
      stc2,
      [
        api_element("area", stc3, undefined, 32),
        api_element("area", stc4, undefined, 32),
      ],
      0
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
