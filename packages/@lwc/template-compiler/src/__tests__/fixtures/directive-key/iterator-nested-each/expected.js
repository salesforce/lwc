import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic,
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.features, function (feature) {
    return api_iterator(
      feature.innerFeatures,
      function (featureValue, featureIndex, featureFirst, featureLast) {
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
    );
  });
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
