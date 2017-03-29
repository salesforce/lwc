function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        []
    )];
}

class FooBar {
  render() {
    return tmpl;
  }

}

export default FooBar;
