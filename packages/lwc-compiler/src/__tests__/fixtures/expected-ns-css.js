define('namespace/css-local', ['lwc'], function (lwc) {

    function style(token) {
       return `namespace-css-local[${token}],[is="namespace-css-local"][${token}] {
    background-color: red;
}
`;
    }

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        h: api_element
      } = $api;

      return [api_element("h1", {
        key: 1
      }, [api_text("Template With Scoped CSS")])];
    }

    if (style) {
        tmpl.stylesheet = style;
    }

    class App extends lwc.LightningElement {
      render() {
        return tmpl;
      }

    }

    return App;

});
