(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<input type="text"${3}>`;
    const $fragment2 = lwc.parseFragment`<div class="verify-not-composed${0}"${2}>Not Composed</div>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "change": api_bind($cmp.handleChange)
        })
      }, null)]), $cmp.notComposed ? api_static_fragment($fragment2, 3) : null];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-4s88pviqiof";
    tmpl.legacyStylesheetToken = "integration-change-event-composed_change-event-composed";
    lwc.freezeTemplate(tmpl);

    class ChangeEventComposed extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.notComposed = false;
      }
      handleChange(evt) {
        this.notComposed = evt.composed === false;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(ChangeEventComposed, {
      track: {
        notComposed: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(ChangeEventComposed, {
      tmpl: _tmpl,
      sel: "integration-change-event-composed",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-change-event-composed', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
