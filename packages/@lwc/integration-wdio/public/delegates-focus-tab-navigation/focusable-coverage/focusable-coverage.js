(function (lwc) {
    'use strict';

    var _tmpl$1 = void 0;

    const $fragment1$q = lwc.parseFragment`<a data-focus="anchor"${3}>a</a>`;
    const $fragment2$j = lwc.parseFragment`<a data-focus="anchorHref" href="#"${3}>a[href]</a>`;
    function tmpl$s($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$q, 1), api_static_fragment($fragment2$j, 3)];
      /*LWC compiler v8.24.0*/
    }
    var anchorHref = lwc.registerTemplate(tmpl$s);
    tmpl$s.stylesheets = [];
    tmpl$s.stylesheetToken = "lwc-4oca81a1lc8";
    tmpl$s.legacyStylesheetToken = "integration-child_anchorHref";
    lwc.freezeTemplate(tmpl$s);

    const $fragment1$p = lwc.parseFragment`<img src="https://html.spec.whatwg.org/images/sample-usemap.png" usemap="#shapes"${3}>`;
    const $fragment2$i = lwc.parseFragment`<map name="shapes"${3}><area data-focus="area" shape="rect" coords="50,50,100,100"${3}><area data-focus="areaHref" shape="rect" coords="25,25,125,125" href="red.html" alt="square"${3}></map>`;
    function tmpl$r($api, $cmp, $slotset, $ctx) {
      const {t: api_text, st: api_static_fragment} = $api;
      return [api_text("area[href]"), api_static_fragment($fragment1$p, 1), api_static_fragment($fragment2$i, 3)];
      /*LWC compiler v8.24.0*/
    }
    var areaHref = lwc.registerTemplate(tmpl$r);
    tmpl$r.stylesheets = [];
    tmpl$r.stylesheetToken = "lwc-2l8s2rvqi32";
    tmpl$r.legacyStylesheetToken = "integration-child_areaHref";
    lwc.freezeTemplate(tmpl$r);

    const $fragment1$o = lwc.parseFragment`<audio data-focus="audio" width="1" height="1"${3}></audio>`;
    const $fragment2$h = lwc.parseFragment`<audio data-focus="audioControls" controls width="1" height="1"${3}></audio>`;
    function tmpl$q($api, $cmp, $slotset, $ctx) {
      const {t: api_text, st: api_static_fragment} = $api;
      return [api_text("audio[controls]"), api_static_fragment($fragment1$o, 1), api_static_fragment($fragment2$h, 3)];
      /*LWC compiler v8.24.0*/
    }
    var audioControls = lwc.registerTemplate(tmpl$q);
    tmpl$q.stylesheets = [];
    tmpl$q.stylesheetToken = "lwc-2p04uf4aume";
    tmpl$q.legacyStylesheetToken = "integration-child_audioControls";
    lwc.freezeTemplate(tmpl$q);

    const $fragment1$n = lwc.parseFragment`<button data-focus="buttonDisabled" disabled${3}>button</button>`;
    const $fragment2$g = lwc.parseFragment`<button data-focus="button"${3}>button</button>`;
    function tmpl$p($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$n, 1), api_static_fragment($fragment2$g, 3)];
      /*LWC compiler v8.24.0*/
    }
    var button = lwc.registerTemplate(tmpl$p);
    tmpl$p.stylesheets = [];
    tmpl$p.stylesheetToken = "lwc-2441n3b0np5";
    tmpl$p.legacyStylesheetToken = "integration-child_button";
    lwc.freezeTemplate(tmpl$p);

    const $fragment1$m = lwc.parseFragment`<input data-focus="checkboxDisabled" type="checkbox" disabled${3}>`;
    const $fragment2$f = lwc.parseFragment`<input data-focus="checkbox" type="checkbox"${3}>`;
    function tmpl$o($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$m, 1), api_static_fragment($fragment2$f, 3)];
      /*LWC compiler v8.24.0*/
    }
    var checkbox = lwc.registerTemplate(tmpl$o);
    tmpl$o.stylesheets = [];
    tmpl$o.stylesheetToken = "lwc-5kd57ljhh2j";
    tmpl$o.legacyStylesheetToken = "integration-child_checkbox";
    lwc.freezeTemplate(tmpl$o);

    const $fragment1$l = lwc.parseFragment`<details data-focus="detailsEmpty"${3}></details>`;
    function tmpl$n($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$l, 1)];
      /*LWC compiler v8.24.0*/
    }
    var detailsEmpty = lwc.registerTemplate(tmpl$n);
    tmpl$n.stylesheets = [];
    tmpl$n.stylesheetToken = "lwc-5sn8v17ffee";
    tmpl$n.legacyStylesheetToken = "integration-child_detailsEmpty";
    lwc.freezeTemplate(tmpl$n);

    const $fragment1$k = lwc.parseFragment`<div data-focus="divOverflow" style="overflow: scroll; height: 50px; width: 50px;"${3}>text1<br${3}>text2<br${3}>text3<br${3}>text4<br${3}></div>`;
    function tmpl$m($api, $cmp, $slotset, $ctx) {
      const {t: api_text, st: api_static_fragment} = $api;
      return [api_text("div overflow"), api_static_fragment($fragment1$k, 1)];
      /*LWC compiler v8.24.0*/
    }
    var divOverflow = lwc.registerTemplate(tmpl$m);
    tmpl$m.stylesheets = [];
    tmpl$m.stylesheetToken = "lwc-9gm8st6od2";
    tmpl$m.legacyStylesheetToken = "integration-child_divOverflow";
    lwc.freezeTemplate(tmpl$m);

    const $fragment1$j = lwc.parseFragment`<embed data-focus="embed" width="10" height="10"${3}>`;
    const $fragment2$e = lwc.parseFragment`<embed data-focus="embedSrc" width="10" height="10" src="https://example.com/"${3}>`;
    function tmpl$l($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$j, 1), api_static_fragment($fragment2$e, 3)];
      /*LWC compiler v8.24.0*/
    }
    var embedSrc = lwc.registerTemplate(tmpl$l);
    tmpl$l.stylesheets = [];
    tmpl$l.stylesheetToken = "lwc-4elpupe35v0";
    tmpl$l.legacyStylesheetToken = "integration-child_embedSrc";
    lwc.freezeTemplate(tmpl$l);

    const stc0$1 = {
      attrs: {
        "data-focus": "iframe",
        "width": "10",
        "height": "10"
      },
      key: 0
    };
    function tmpl$k($api, $cmp, $slotset, $ctx) {
      const {h: api_element} = $api;
      return [api_element("iframe", stc0$1)];
      /*LWC compiler v8.24.0*/
    }
    var iframe = lwc.registerTemplate(tmpl$k);
    tmpl$k.stylesheets = [];
    tmpl$k.stylesheetToken = "lwc-3mljofn0hgf";
    tmpl$k.legacyStylesheetToken = "integration-child_iframe";
    lwc.freezeTemplate(tmpl$k);

    const stc0 = {
      attrs: {
        "data-focus": "iframeSrc",
        "width": "10",
        "height": "10",
        "src": "iframe.html"
      },
      key: 0
    };
    function tmpl$j($api, $cmp, $slotset, $ctx) {
      const {h: api_element} = $api;
      return [api_element("iframe", stc0)];
      /*LWC compiler v8.24.0*/
    }
    var iframeSrc = lwc.registerTemplate(tmpl$j);
    tmpl$j.stylesheets = [];
    tmpl$j.stylesheetToken = "lwc-4s2pcq2qto4";
    tmpl$j.legacyStylesheetToken = "integration-child_iframeSrc";
    lwc.freezeTemplate(tmpl$j);

    const $fragment1$i = lwc.parseFragment`<img data-focus="img"${3}>`;
    function tmpl$i($api, $cmp, $slotset, $ctx) {
      const {t: api_text, st: api_static_fragment} = $api;
      return [api_text("img"), api_static_fragment($fragment1$i, 1)];
      /*LWC compiler v8.24.0*/
    }
    var img = lwc.registerTemplate(tmpl$i);
    tmpl$i.stylesheets = [];
    tmpl$i.stylesheetToken = "lwc-7ner94499je";
    tmpl$i.legacyStylesheetToken = "integration-child_img";
    lwc.freezeTemplate(tmpl$i);

    const $fragment1$h = lwc.parseFragment`<img data-focus="imgSrc" src="http://placekitten.com/100/100"${3}>`;
    function tmpl$h($api, $cmp, $slotset, $ctx) {
      const {t: api_text, st: api_static_fragment} = $api;
      return [api_text("img[src]"), api_static_fragment($fragment1$h, 1)];
      /*LWC compiler v8.24.0*/
    }
    var imgSrc = lwc.registerTemplate(tmpl$h);
    tmpl$h.stylesheets = [];
    tmpl$h.stylesheetToken = "lwc-jv074ilalk";
    tmpl$h.legacyStylesheetToken = "integration-child_imgSrc";
    lwc.freezeTemplate(tmpl$h);

    const $fragment1$g = lwc.parseFragment`<input data-focus="inputDisabled" disabled${3}>`;
    const $fragment2$d = lwc.parseFragment`<input data-focus="input"${3}>`;
    function tmpl$g($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$g, 1), api_static_fragment($fragment2$d, 3)];
      /*LWC compiler v8.24.0*/
    }
    var input = lwc.registerTemplate(tmpl$g);
    tmpl$g.stylesheets = [];
    tmpl$g.stylesheetToken = "lwc-3u7s6d2tk5l";
    tmpl$g.legacyStylesheetToken = "integration-child_input";
    lwc.freezeTemplate(tmpl$g);

    const $fragment1$f = lwc.parseFragment`<input data-focus="inputTimeDisabled" type="time" disabled${3}>`;
    const $fragment2$c = lwc.parseFragment`<input data-focus="inputTime" type="time"${3}>`;
    function tmpl$f($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$f, 1), api_static_fragment($fragment2$c, 3)];
      /*LWC compiler v8.24.0*/
    }
    var inputTime = lwc.registerTemplate(tmpl$f);
    tmpl$f.stylesheets = [];
    tmpl$f.stylesheetToken = "lwc-6t51jmapdj5";
    tmpl$f.legacyStylesheetToken = "integration-child_inputTime";
    lwc.freezeTemplate(tmpl$f);

    const $fragment1$e = lwc.parseFragment`<object data-focus="object" width="10" height="10"${3}></object>`;
    const $fragment2$b = lwc.parseFragment`<object data-focus="objectData" width="10" height="10" data="https://example.com/"${3}></object>`;
    function tmpl$e($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$e, 1), api_static_fragment($fragment2$b, 3)];
      /*LWC compiler v8.24.0*/
    }
    var objectData = lwc.registerTemplate(tmpl$e);
    tmpl$e.stylesheets = [];
    tmpl$e.stylesheetToken = "lwc-oqmgpc4m8q";
    tmpl$e.legacyStylesheetToken = "integration-child_objectData";
    lwc.freezeTemplate(tmpl$e);

    const $fragment1$d = lwc.parseFragment`<select data-focus="selectDisabled" disabled${3}><option${3}>select</option></select>`;
    const $fragment2$a = lwc.parseFragment`<select data-focus="select"${3}><option${3}>select</option></select>`;
    function tmpl$d($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$d, 1), api_static_fragment($fragment2$a, 3)];
      /*LWC compiler v8.24.0*/
    }
    var select = lwc.registerTemplate(tmpl$d);
    tmpl$d.stylesheets = [];
    tmpl$d.stylesheetToken = "lwc-60q8e93q960";
    tmpl$d.legacyStylesheetToken = "integration-child_select";
    lwc.freezeTemplate(tmpl$d);

    const $fragment1$c = lwc.parseFragment`<select data-focus="selectMultipleDisabled" multiple disabled${3}><option${3}>select multiple</option></select>`;
    const $fragment2$9 = lwc.parseFragment`<select data-focus="selectMultiple" multiple${3}><option${3}>select multiple</option></select>`;
    function tmpl$c($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$c, 1), api_static_fragment($fragment2$9, 3)];
      /*LWC compiler v8.24.0*/
    }
    var selectMultiple = lwc.registerTemplate(tmpl$c);
    tmpl$c.stylesheets = [];
    tmpl$c.stylesheetToken = "lwc-3njjlj94n4o";
    tmpl$c.legacyStylesheetToken = "integration-child_selectMultiple";
    lwc.freezeTemplate(tmpl$c);

    const $fragment1$b = lwc.parseFragment`<select data-focus="selectOptgroupDisabled" disabled${3}><optgroup${3}><option${3}>optgroup</option></optgroup></select>`;
    const $fragment2$8 = lwc.parseFragment`<select data-focus="selectOptgroup"${3}><optgroup${3}><option${3}>optgroup</option></optgroup></select>`;
    function tmpl$b($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$b, 1), api_static_fragment($fragment2$8, 3)];
      /*LWC compiler v8.24.0*/
    }
    var selectOptgroup = lwc.registerTemplate(tmpl$b);
    tmpl$b.stylesheets = [];
    tmpl$b.stylesheetToken = "lwc-1bacaqqvk96";
    tmpl$b.legacyStylesheetToken = "integration-child_selectOptgroup";
    lwc.freezeTemplate(tmpl$b);

    const $fragment1$a = lwc.parseFragment`<span data-focus="span"${3}>span</span>`;
    const $fragment2$7 = lwc.parseFragment`<span data-focus="spanContenteditable" contenteditable${3}>span[contenteditable]</span>`;
    function tmpl$a($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$a, 1), api_static_fragment($fragment2$7, 3)];
      /*LWC compiler v8.24.0*/
    }
    var spanContenteditable = lwc.registerTemplate(tmpl$a);
    tmpl$a.stylesheets = [];
    tmpl$a.stylesheetToken = "lwc-6s3d00ouper";
    tmpl$a.legacyStylesheetToken = "integration-child_spanContenteditable";
    lwc.freezeTemplate(tmpl$a);

    const $fragment1$9 = lwc.parseFragment`<span data-focus="span"${3}>span</span>`;
    const $fragment2$6 = lwc.parseFragment`<span data-focus="spanTabindexNegativeOne" tabindex="-1"${3}>span[tabindex=&quot;-1&quot;]</span>`;
    function tmpl$9($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$9, 1), api_static_fragment($fragment2$6, 3)];
      /*LWC compiler v8.24.0*/
    }
    var spanTabindexNegativeOne = lwc.registerTemplate(tmpl$9);
    tmpl$9.stylesheets = [];
    tmpl$9.stylesheetToken = "lwc-596gtk2qtdt";
    tmpl$9.legacyStylesheetToken = "integration-child_spanTabindexNegativeOne";
    lwc.freezeTemplate(tmpl$9);

    const $fragment1$8 = lwc.parseFragment`<span data-focus="span"${3}>span</span>`;
    const $fragment2$5 = lwc.parseFragment`<span data-focus="spanTabindexZero" tabindex="0"${3}>span[tabindex=&quot;0&quot;]</span>`;
    function tmpl$8($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$8, 1), api_static_fragment($fragment2$5, 3)];
      /*LWC compiler v8.24.0*/
    }
    var spanTabindexZero = lwc.registerTemplate(tmpl$8);
    tmpl$8.stylesheets = [];
    tmpl$8.stylesheetToken = "lwc-2858md9bui3";
    tmpl$8.legacyStylesheetToken = "integration-child_spanTabindexZero";
    lwc.freezeTemplate(tmpl$8);

    const $fragment1$7 = lwc.parseFragment`<summary data-focus="summary"${3}>summary by itself</summary>`;
    function tmpl$7($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$7, 1)];
      /*LWC compiler v8.24.0*/
    }
    var summary = lwc.registerTemplate(tmpl$7);
    tmpl$7.stylesheets = [];
    tmpl$7.stylesheetToken = "lwc-d768092v0q";
    tmpl$7.legacyStylesheetToken = "integration-child_summary";
    lwc.freezeTemplate(tmpl$7);

    const $fragment1$6 = lwc.parseFragment`<details${3}><summary data-focus="summaryInsideDetails"${3}>summary inside details</summary>summary inside details content</details>`;
    function tmpl$6($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$6, 1)];
      /*LWC compiler v8.24.0*/
    }
    var summaryInsideDetails = lwc.registerTemplate(tmpl$6);
    tmpl$6.stylesheets = [];
    tmpl$6.stylesheetToken = "lwc-23rit9riquc";
    tmpl$6.legacyStylesheetToken = "integration-child_summaryInsideDetails";
    lwc.freezeTemplate(tmpl$6);

    const $fragment1$5 = lwc.parseFragment`<details${3}><summary data-focus="summaryInsideDetailsMultiple"${3}>summary inside details multiple</summary>summary inside details multiple content<summary data-focus="summaryInsideDetailsMultipleSecond"${3}>summary inside details multiple</summary>summary inside details multiple content</details>`;
    function tmpl$5($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$5, 1)];
      /*LWC compiler v8.24.0*/
    }
    var summaryInsideDetailsMultiple = lwc.registerTemplate(tmpl$5);
    tmpl$5.stylesheets = [];
    tmpl$5.stylesheetToken = "lwc-1v23f0kviek";
    tmpl$5.legacyStylesheetToken = "integration-child_summaryInsideDetailsMultiple";
    lwc.freezeTemplate(tmpl$5);

    const $fragment1$4 = lwc.parseFragment`<svg width="150" height="30"${3}><a data-focus="svgAnchor"${3}><text x="0" y="20"${3}>svg a</text></a></svg>`;
    const $fragment2$4 = lwc.parseFragment`<svg width="150" height="30"${3}><a data-focus="svgAnchorHref" href="#"${3}><text x="0" y="20"${3}>svg a[href]</text></a></svg>`;
    function tmpl$4($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$4, 1), api_static_fragment($fragment2$4, 3)];
      /*LWC compiler v8.24.0*/
    }
    var svgAnchorHref = lwc.registerTemplate(tmpl$4);
    tmpl$4.stylesheets = [];
    tmpl$4.stylesheetToken = "lwc-27kgttila6k";
    tmpl$4.legacyStylesheetToken = "integration-child_svgAnchorHref";
    lwc.freezeTemplate(tmpl$4);

    const $fragment1$3 = lwc.parseFragment`<svg width="150" height="30"${3}><a data-focus="svgAnchor"${3}><text x="0" y="20"${3}>svg</text></a></svg>`;
    const $fragment2$3 = lwc.parseFragment`<svg width="150" height="30"${3}><a data-focus="svgAnchorXlinkHref" xlink:href${3}><text x="0" y="20"${3}>svg a[xlink:href]</text></a></svg>`;
    function tmpl$3($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$3, 1), api_static_fragment($fragment2$3, 3)];
      /*LWC compiler v8.24.0*/
    }
    var svgAnchorXlinkHref = lwc.registerTemplate(tmpl$3);
    tmpl$3.stylesheets = [];
    tmpl$3.stylesheetToken = "lwc-71chl4a36dt";
    tmpl$3.legacyStylesheetToken = "integration-child_svgAnchorXlinkHref";
    lwc.freezeTemplate(tmpl$3);

    const $fragment1$2 = lwc.parseFragment`<textarea data-focus="textareaDisabled" rows="1" cols="1" disabled${3}></textarea>`;
    const $fragment2$2 = lwc.parseFragment`<textarea data-focus="textarea" rows="1" cols="1"${3}></textarea>`;
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$2, 1), api_static_fragment($fragment2$2, 3)];
      /*LWC compiler v8.24.0*/
    }
    var textarea = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-7ece4rel9l7";
    tmpl$2.legacyStylesheetToken = "integration-child_textarea";
    lwc.freezeTemplate(tmpl$2);

    const $fragment1$1 = lwc.parseFragment`<video data-focus="video" width="1" height="1"${3}></video>`;
    const $fragment2$1 = lwc.parseFragment`<video data-focus="videoControls" controls width="1" height="1"${3}></video>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {t: api_text, st: api_static_fragment} = $api;
      return [api_text("video[controls]"), api_static_fragment($fragment1$1, 1), api_static_fragment($fragment2$1, 3)];
      /*LWC compiler v8.24.0*/
    }
    var videoControls = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-4t8j4mpev8r";
    tmpl$1.legacyStylesheetToken = "integration-child_videoControls";
    lwc.freezeTemplate(tmpl$1);

    const map = Object.assign(Object.create(null), {
      anchorHref,
      areaHref,
      audioControls,
      button,
      checkbox,
      detailsEmpty,
      divOverflow,
      embedSrc,
      iframe,
      iframeSrc,
      img,
      imgSrc,
      input,
      inputTime,
      objectData,
      select,
      selectMultiple,
      selectOptgroup,
      spanContenteditable,
      spanTabindexNegativeOne,
      spanTabindexZero,
      summary,
      summaryInsideDetails,
      summaryInsideDetailsMultiple,
      svgAnchorHref,
      svgAnchorXlinkHref,
      textarea,
      videoControls
    });
    class Child extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.type = void 0;
      }
      render() {
        const html = map[this.type];
        if (!html) {
          throw new TypeError(`Unknown type: "${this.type}"`);
        }
        return html;
      }
      /*LWC compiler v8.24.0*/
    }
    Child.delegatesFocus = true;
    lwc.registerDecorators(Child, {
      publicProps: {
        type: {
          config: 0
        }
      }
    });
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<input class="start${0}" placeholder="start"${2}>`;
    const $fragment2 = lwc.parseFragment`<input class="done${0}" placeholder="done"${2}>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, c: api_custom_element} = $api;
      return [api_static_fragment($fragment1, 1), api_custom_element("integration-child", __lwc_component_class_internal$1, {
        props: {
          "tabIndex": "0",
          "type": $cmp.type
        },
        key: 2
      }), api_static_fragment($fragment2, 4)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-4i2glavodrq";
    tmpl.legacyStylesheetToken = "integration-focusable-coverage_focusable-coverage";
    lwc.freezeTemplate(tmpl);

    class FocusableCoverage extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.type = 'anchorHref';
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(FocusableCoverage, {
      publicProps: {
        type: {
          config: 0
        }
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(FocusableCoverage, {
      tmpl: _tmpl,
      sel: "integration-focusable-coverage",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-focusable-coverage', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
