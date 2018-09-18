define('namespace/css-local', ['lwc'], function (lwc) {

    function style(token) {
       return `namespace-css-local[${token}] {
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
        tmpl.hostToken = 'namespace-css-local_css-local-host';
        tmpl.shadowToken = 'namespace-css-local_css-local';

        const style$$1 = document.createElement('style');
        style$$1.type = 'text/css';
        style$$1.dataset.token = 'namespace-css-local_css-local';
        style$$1.textContent = style('namespace-css-local_css-local');
        document.head.appendChild(style$$1);
    }

    class App extends lwc.LightningElement {
      render() {
        return tmpl;
      }

    }

    return App;

});
