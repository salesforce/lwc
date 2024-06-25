import _implicitStylesheets from "./tag-with-namespace.css";
import _implicitScopedStylesheets from "./tag-with-namespace.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate, renderer } from "lwc";
const $fragment1 = parseFragment`<span${3}>Should not get custom renderer!<circle${"a2:id"} cx="5" cy="5" r="4" stroke="blue"${3}></circle><use href="#myCircle" x="10" fill="blue"${3}></use></span>`;
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
  const {
    h: api_element,
    gid: api_scoped_id,
    sp: api_static_part,
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
    api_static_fragment($fragment1, 3, [
      api_static_part(
        2,
        {
          attrs: {
            id: api_scoped_id("myCircle"),
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-ed3iv0kbet";
tmpl.legacyStylesheetToken = "x-tag-with-namespace_tag-with-namespace";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
