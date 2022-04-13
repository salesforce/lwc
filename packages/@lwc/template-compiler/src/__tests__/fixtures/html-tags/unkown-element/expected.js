import _xCustomComponent from "x/customComponent";
import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<unknonwtag${1}${2}></unknonwtag>`;
let $fragment2;
const $hoisted2 = parseFragment`<span${1}${2}>valid tags should not warn</span>`;
let $fragment3;
const $hoisted3 = parseFragment`<spam${1}${2}>this tag has a typo</spam>`;
const stc0 = {
  props: {
    someTruthyValue: true,
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, c: api_custom_element } = $api;
  return [
    api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1),
    api_custom_element("x-custom-component", _xCustomComponent, stc0),
    api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 4),
    api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 6),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
