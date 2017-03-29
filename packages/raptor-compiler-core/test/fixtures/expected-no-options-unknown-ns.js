function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        []
    )];
}

class Default {
  render() {
    return tmpl;
  }

}

export default Default;
