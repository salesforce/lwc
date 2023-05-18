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
const stc3 = {
  attrs: {
    href: "#kawaramachi",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("a", stc0, "Yasaka Taxi", 160),
    api_element(
      "map",
      stc1,
      [
        api_element("area", stc2, undefined, 32),
        api_element("area", stc3, undefined, 32),
      ],
      0
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
