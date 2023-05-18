import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_iterator($cmp.items, function (item) {
        return [
          api_element(
            "p",
            {
              key: api_key(1, item.keyOne),
            },
            "1" + api_dynamic_text(item),
            128
          ),
          api_element(
            "p",
            {
              key: api_key(2, item.keyTwo),
            },
            "2" + api_dynamic_text(item.foo),
            128
          ),
          api_element(
            "p",
            {
              key: api_key(3, item.keyThree),
            },
            "3" + api_dynamic_text($cmp.other),
            128
          ),
          api_element(
            "p",
            {
              key: api_key(4, item.keyFour),
            },
            "4" + api_dynamic_text($cmp.other.foo),
            128
          ),
        ];
      }),
      0
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
