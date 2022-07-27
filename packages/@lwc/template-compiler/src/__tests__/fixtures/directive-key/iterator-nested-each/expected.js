import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_fragment(
      1,
      api_iterator($cmp.features, function (feature) {
        return api_fragment(
          0,
          api_iterator(
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
                  key: feature.value.label,
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
          )
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
