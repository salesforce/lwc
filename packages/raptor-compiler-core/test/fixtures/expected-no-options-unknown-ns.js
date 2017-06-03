function tmpl($api, $cmp, $slotset, $ctx) {
  return [$api.h("section", {}, [])];
}

class Default {
  render() {
    return tmpl;
  }

}

export default Default;
