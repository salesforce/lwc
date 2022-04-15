import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><!--only comments within elements can be static--></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    api_comment(" this comment should not be static "),
    api_static_fragment($fragment1(), 1),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
