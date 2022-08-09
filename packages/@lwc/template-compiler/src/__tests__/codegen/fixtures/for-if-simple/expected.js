import {registerTemplate} from "lwc";
const stc0 = {
  key: 0
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {k: api_key, d: api_dynamic_text, t: api_text, h: api_element, i: api_iterator} = $api;
  return [api_element("section", stc0, $cmp.showItems ? api_iterator($cmp.items, function (item) {
    return api_element("p", {
      key: api_key(1, item.id)
    }, [api_text("1" + api_dynamic_text(item))]);
  }) : stc1)];
  /*LWC compiler v2.21.1*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
