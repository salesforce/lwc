(function (lwc) {
    'use strict';

    const {t: api_text, h: api_element} = lwc.renderApi;
    const $hoisted1 = api_element("h1", {
      key: 0
    }, [api_text("hello")], true);
    function tmpl($api, $cmp, $slotset, $ctx) {
      return [$hoisted1];
      /*LWC compiler vX.X.X*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];

    class NotALightningElement {}

    class AlsoNotALightningElement {
      constructor() {
        this.foo = 'bar';
      }

    }

    lwc.registerDecorators(AlsoNotALightningElement, {
      fields: ["foo"]
    });

    class App extends lwc.LightningElement {
      renderedCallback() {
        // eslint-disable-next-line no-console
        console.log(NotALightningElement, AlsoNotALightningElement);
      }
      /*LWC compiler vX.X.X*/


    }

    var App$1 = lwc.registerComponent(App, {
      tmpl: _tmpl
    });

    const container = document.getElementById('main');
    const element = lwc.createElement('x-app', {
      is: App$1
    });
    container.appendChild(element);

})(LWC);
