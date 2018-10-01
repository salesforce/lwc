define('namespace/html-local-import', ['namespace/importedTemplate', 'lwc'], function (_namespaceImportedTemplate, lwc) {

    const stylesheet = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        d: api_dynamic,
        h: api_element,
        c: api_custom_element
      } = $api;

      return [api_element("h1", {
        key: 1
      }, [api_text("Locally Imported HTML Template "), api_dynamic($cmp.myname)]), api_custom_element("namespace-imported-template", _namespaceImportedTemplate, {
        key: 2
      }, [])];
    }

    if (stylesheet) {
        tmpl.stylesheet = stylesheet;
    }

    class App extends lwc.LightningElement {
      get myname() {
        return 'hello';
      }

      render() {
        return tmpl;
      }

    }

    return App;

});
