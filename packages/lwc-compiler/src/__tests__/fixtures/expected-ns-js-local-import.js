define('namespace-js-local-import', ['lwc', 'c/utils'], function (lwc, utils) {

    const style = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;

      return [api_element("h1", {
        key: 1
      }, [api_dynamic($cmp.myname)])];
    }

    if (style) {
        tmpl.hostToken = 'namespace-js-local-import_js-local-import-host';
        tmpl.shadowToken = 'namespace-js-local-import_js-local-import';

        const style$$1 = document.createElement('style');
        style$$1.type = 'text/css';
        style$$1.dataset.token = 'namespace-js-local-import_js-local-import';
        style$$1.textContent = style('namespace-js-local-import_js-local-import');
        document.head.appendChild(style$$1);
    }

    class App extends lwc.LightningElement {
      get myname() {
        return 'my name comes from utils ' + utils.method('App');
      }

      render() {
        return tmpl;
      }

    }

    return App;

});
