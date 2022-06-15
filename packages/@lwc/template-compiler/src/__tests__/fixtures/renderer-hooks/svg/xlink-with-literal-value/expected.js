import { registerTemplate, renderer } from "lwc";
const stc0 = {
  classMap: {
    "slds-icon": true,
  },
  attrs: {
    "aria-hidden": "true",
    title: "when needed",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  "xlink:href": "/assets/icons/standard-sprite/svg/symbols.svg#case",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_element("use", {
        attrs: stc1,
        key: 1,
        svg: true,
        renderer: renderer,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
