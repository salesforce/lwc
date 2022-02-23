import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
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
            api_text(
              api_dynamic_text(feature.value.label) +
                " " +
                api_dynamic_text(feature.label)
            ),
          ]
        );
      }
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
