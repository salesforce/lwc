import _xCustomComponent from "x/customComponent";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<unknonwtag${3}></unknonwtag>`;
const $fragment2 = parseFragment`<span${3}>valid tags should not warn</span>`;
const $fragment3 = parseFragment`<spam${3}>this tag has a typo</spam>`;
const stc0 = {
  props: {
    someTruthyValue: true,
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, c: api_custom_element } = $api;
  return [
    api_static_fragment($fragment1(), 0),
    api_custom_element("x-custom-component", _xCustomComponent, stc0),
    api_static_fragment($fragment2(), 2),
    api_static_fragment($fragment3(), 3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
