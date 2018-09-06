define('namespace/htmlLocalImport', ['namespace/importedTemplate', 'lwc'], function (_namespaceImportedTemplate, lwc) {

    const style = undefined;

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

    if (style) {
        tmpl.hostToken = 'namespace-html-local-import_html-local-import-host';
        tmpl.shadowToken = 'namespace-html-local-import_html-local-import';

        const style$$1 = document.createElement('style');
        style$$1.type = 'text/css';
        style$$1.dataset.token = 'namespace-html-local-import_html-local-import';
        style$$1.textContent = style('namespace-html-local-import_html-local-import');
        document.head.appendChild(style$$1);
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
