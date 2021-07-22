import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_1(feature) {
    function forof2_0(featureValue, featureIndex, featureFirst, featureLast) {
      const feature = {
        value: featureValue,
        index: featureIndex,
        first: featureFirst,
        last: featureLast,
      };
      return api_element(
        "p",
        {
          key: api_key(0, feature.value.label),
        },
        [
          api_dynamic(feature.value.label),
          api_text(" "),
          api_dynamic(feature.label),
        ]
      );
    }
    return api_iterator(feature.innerFeatures, forof2_0);
  }
  const {
    k: api_key,
    d: api_dynamic,
    t: api_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.features, foreach1_1);
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
