define('namespace-html-local-import', ['lwc', 'namespace/html-local-import.html'], function (lwc, html) {

    class App extends lwc.LightningElement {
      get myname() {
        return 'hello';
      }

      render() {
        return html;
      }

    }

    return App;

});
