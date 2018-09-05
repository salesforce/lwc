import _namespaceLocalTemplate from 'namespace-local-template';
import { LightningElement } from 'lwc';

    const style = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        h: api_element,
        c: api_custom_element
      } = $api;

      return [api_element("h1", {
        key: 1
      }, [api_text("Query Selector")]), api_custom_element("namespace-local-template", _namespaceLocalTemplate, {
        key: 2
      }, [])];
    }

    if (style) {
        tmpl.hostToken = 'namespace-query-selector_query-selector-host';
        tmpl.shadowToken = 'namespace-query-selector_query-selector';

        const style$$1 = document.createElement('style');
        style$$1.type = 'text/css';
        style$$1.dataset.token = 'namespace-query-selector_query-selector';
        style$$1.textContent = style('namespace-query-selector_query-selector');
        document.head.appendChild(style$$1);
    }

    class App extends LightningElement {
      renderedCallback() {
        const bar = this.root.querySelector('namespace-local-template');
      }

      render() {
        return tmpl;
      }

    }

    export default App;
