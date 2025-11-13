(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<input class="handler-computes-inner-text-input${0}" type="text"${2}>`;
    const $fragment2 = lwc.parseFragment`<input class="handler-computes-inner-text-div${0}" type="text"${2}>`;
    const $fragment3 = lwc.parseFragment`<div${3}>some text</div>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0, _m1, _m2, _m3} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "click": api_bind($cmp.computeInputInnerText)
        })
      }, null)]), api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m3 || ($ctx._m3 = {
          "click": api_bind($cmp.computeDivInnerText)
        })
      }, null)]), api_static_fragment($fragment3, 5)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-1r7sc5tfb";
    tmpl.legacyStylesheetToken = "integration-inner-text_inner-text";
    lwc.freezeTemplate(tmpl);

    class InnerText extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._innerText = null;
      }
      computeInputInnerText(evt) {
        this._innerText = evt.target.innerText;
      }
      computeDivInnerText() {
        this._innerText = this.template.querySelector('div').innerText;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(InnerText, {
      fields: ["_innerText"]
    });
    const __lwc_component_class_internal = lwc.registerComponent(InnerText, {
      tmpl: _tmpl,
      sel: "integration-inner-text",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-inner-text', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
