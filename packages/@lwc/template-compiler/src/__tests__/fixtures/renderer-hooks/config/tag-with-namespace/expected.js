import { parseFragment, registerTemplate, renderer } from "lwc";
const $fragment1 = parseFragment`<use href="#myCircle" x="10" fill="blue"${3}></use>`;
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
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    t: api_text,
    gid: api_scoped_id,
    st: api_static_fragment,
  } = $api;
  return [
    api_element("svg", stc0, [
      api_element("use", {
        attrs: stc1,
        key: 1,
        svg: true,
        renderer: renderer,
      }),
    ]),
    api_element("span", stc2, [
      api_text("Should not get custom renderer!"),
      api_element("circle", {
        attrs: {
          id: api_scoped_id("myCircle"),
          cx: "5",
          cy: "5",
          r: "4",
          stroke: "blue",
        },
        key: 3,
      }),
      api_static_fragment($fragment1(), 5),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
