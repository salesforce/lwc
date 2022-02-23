(function (lwc) {
    'use strict';

    const stc0 = {
      key: 0
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {t: api_text, h: api_element} = $api;
      return [api_element("h1", stc0, [api_text("hello")])];
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
