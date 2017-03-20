const memoized = Symbol('memoize');
var _tmpl = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        []
    )];
};
const templateUsedIds = [];

class Default {
  render() {
    return _tmpl;
  }

}
Default.tagName = "x-default";
Default.templateUsedIds = templateUsedIds;

export default Default;
