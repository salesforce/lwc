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

class FooBar {
  render() {
    return _tmpl;
  }

}
FooBar.tagName = "foo-bar";
FooBar.templateUsedIds = templateUsedIds;

export default FooBar;
