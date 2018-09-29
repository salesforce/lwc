define('namespace/js-local-import', ['lwc', 'namespace/utils'], function (lwc, utils) {

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
        tmpl.stylesheet = style;
    }

    function method(name) {
      return 'utilities was called with the name: ' + name;
    }

    class App extends lwc.LightningElement {
      get myname() {
        utils.log(method('App'));
        return 'my name comes from utils ' + method('App');
      }

      render() {
        return tmpl;
      }

    }

    return App;

});
