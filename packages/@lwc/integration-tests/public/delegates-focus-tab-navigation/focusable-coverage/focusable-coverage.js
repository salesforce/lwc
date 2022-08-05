(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey3 = Proxy.callKey3;

  var __callKey2 = Proxy.callKey2;

  var __setKey = Proxy.setKey;

  var __concat = Proxy.concat;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      __setKey(o, "__proto__", p);

      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    __setKey(subClass, "prototype", Object.create(superClass && (superClass._ES5ProxyType ? superClass.get("prototype") : superClass.prototype), {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    }));

    Object.compatDefineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  var __inKey = Proxy.inKey;

  function _defineProperties(target, props) {
    for (var i = 0; i < (props._ES5ProxyType ? props.get("length") : props.length); i++) {
      var descriptor = props._ES5ProxyType ? props.get(i) : props[i];

      __setKey(descriptor, "enumerable", (descriptor._ES5ProxyType ? descriptor.get("enumerable") : descriptor.enumerable) || false);

      __setKey(descriptor, "configurable", true);

      if (__inKey(descriptor, "value")) __setKey(descriptor, "writable", true);
      Object.compatDefineProperty(target, descriptor._ES5ProxyType ? descriptor.get("key") : descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor._ES5ProxyType ? Constructor.get("prototype") : Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.compatDefineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var _tmpl$1 = void 0;

  var stc0$s = {
    attrs: {
      "data-focus": "anchor"
    },
    key: 0
  };
  var stc1$m = {
    attrs: {
      "data-focus": "anchorHref",
      "href": "#"
    },
    key: 1
  };

  function tmpl$s($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("a", stc0$s, [api_text("a")]), api_element("a", stc1$m, [api_text("a[href]")])];
    /*LWC compiler v2.11.8*/
  }

  var anchorHref = lwc.registerTemplate(tmpl$s);

  __setKey(tmpl$s, "stylesheets", []);

  var stc0$r = {
    attrs: {
      "src": "https://html.spec.whatwg.org/images/sample-usemap.png",
      "usemap": "#shapes"
    },
    key: 0
  };
  var stc1$l = {
    attrs: {
      "name": "shapes"
    },
    key: 1
  };
  var stc2$7 = {
    attrs: {
      "data-focus": "area",
      "shape": "rect",
      "coords": "50,50,100,100"
    },
    key: 2
  };
  var stc3$6 = {
    attrs: {
      "data-focus": "areaHref",
      "shape": "rect",
      "coords": "25,25,125,125",
      "href": "red.html",
      "alt": "square"
    },
    key: 3
  };

  function tmpl$r($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("area[href]"), api_element("img", stc0$r), api_element("map", stc1$l, [api_element("area", stc2$7), api_element("area", stc3$6)])];
    /*LWC compiler v2.11.8*/
  }

  var areaHref = lwc.registerTemplate(tmpl$r);

  __setKey(tmpl$r, "stylesheets", []);

  var stc0$q = {
    attrs: {
      "data-focus": "audio",
      "width": "1",
      "height": "1"
    },
    key: 0
  };
  var stc1$k = {
    attrs: {
      "data-focus": "audioControls",
      "controls": "",
      "width": "1",
      "height": "1"
    },
    key: 1
  };

  function tmpl$q($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("audio[controls]"), api_element("audio", stc0$q), api_element("audio", stc1$k)];
    /*LWC compiler v2.11.8*/
  }

  var audioControls = lwc.registerTemplate(tmpl$q);

  __setKey(tmpl$q, "stylesheets", []);

  var stc0$p = {
    attrs: {
      "data-focus": "buttonDisabled",
      "disabled": ""
    },
    key: 0
  };
  var stc1$j = {
    attrs: {
      "data-focus": "button"
    },
    key: 1
  };

  function tmpl$p($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("button", stc0$p, [api_text("button")]), api_element("button", stc1$j, [api_text("button")])];
    /*LWC compiler v2.11.8*/
  }

  var button = lwc.registerTemplate(tmpl$p);

  __setKey(tmpl$p, "stylesheets", []);

  var stc0$o = {
    attrs: {
      "data-focus": "checkboxDisabled",
      "type": "checkbox",
      "disabled": ""
    },
    key: 0
  };
  var stc1$i = {
    attrs: {
      "data-focus": "checkbox",
      "type": "checkbox"
    },
    key: 1
  };

  function tmpl$o($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("input", stc0$o), api_element("input", stc1$i)];
    /*LWC compiler v2.11.8*/
  }

  var checkbox = lwc.registerTemplate(tmpl$o);

  __setKey(tmpl$o, "stylesheets", []);

  var stc0$n = {
    attrs: {
      "data-focus": "detailsEmpty"
    },
    key: 0
  };

  function tmpl$n($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("details", stc0$n)];
    /*LWC compiler v2.11.8*/
  }

  var detailsEmpty = lwc.registerTemplate(tmpl$n);

  __setKey(tmpl$n, "stylesheets", []);

  var stc0$m = {
    styleDecls: [["overflow", "scroll", false], ["height", "50px", false], ["width", "50px", false]],
    attrs: {
      "data-focus": "divOverflow"
    },
    key: 0
  };
  var stc1$h = {
    key: 1
  };
  var stc2$6 = {
    key: 2
  };
  var stc3$5 = {
    key: 3
  };
  var stc4$3 = {
    key: 4
  };

  function tmpl$m($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("div overflow"), api_element("div", stc0$m, [api_text("text1"), api_element("br", stc1$h), api_text("text2"), api_element("br", stc2$6), api_text("text3"), api_element("br", stc3$5), api_text("text4"), api_element("br", stc4$3)])];
    /*LWC compiler v2.11.8*/
  }

  var divOverflow = lwc.registerTemplate(tmpl$m);

  __setKey(tmpl$m, "stylesheets", []);

  var stc0$l = {
    attrs: {
      "data-focus": "embed",
      "width": "10",
      "height": "10"
    },
    key: 0
  };
  var stc1$g = {
    attrs: {
      "data-focus": "embedSrc",
      "width": "10",
      "height": "10",
      "src": "https://example.com/"
    },
    key: 1
  };

  function tmpl$l($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("embed", stc0$l), api_element("embed", stc1$g)];
    /*LWC compiler v2.11.8*/
  }

  var embedSrc = lwc.registerTemplate(tmpl$l);

  __setKey(tmpl$l, "stylesheets", []);

  var stc0$k = {
    attrs: {
      "data-focus": "iframe",
      "width": "10",
      "height": "10"
    },
    key: 0
  };

  function tmpl$k($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("iframe", stc0$k)];
    /*LWC compiler v2.11.8*/
  }

  var iframe = lwc.registerTemplate(tmpl$k);

  __setKey(tmpl$k, "stylesheets", []);

  var stc0$j = {
    attrs: {
      "data-focus": "iframeSrc",
      "width": "10",
      "height": "10",
      "src": "iframe.html"
    },
    key: 0
  };

  function tmpl$j($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("iframe", stc0$j)];
    /*LWC compiler v2.11.8*/
  }

  var iframeSrc = lwc.registerTemplate(tmpl$j);

  __setKey(tmpl$j, "stylesheets", []);

  var stc0$i = {
    attrs: {
      "data-focus": "img"
    },
    key: 0
  };

  function tmpl$i($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("img"), api_element("img", stc0$i)];
    /*LWC compiler v2.11.8*/
  }

  var img = lwc.registerTemplate(tmpl$i);

  __setKey(tmpl$i, "stylesheets", []);

  var stc0$h = {
    attrs: {
      "data-focus": "imgSrc",
      "src": "http://placekitten.com/100/100"
    },
    key: 0
  };

  function tmpl$h($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("img[src]"), api_element("img", stc0$h)];
    /*LWC compiler v2.11.8*/
  }

  var imgSrc = lwc.registerTemplate(tmpl$h);

  __setKey(tmpl$h, "stylesheets", []);

  var stc0$g = {
    attrs: {
      "data-focus": "inputDisabled",
      "disabled": ""
    },
    key: 0
  };
  var stc1$f = {
    attrs: {
      "data-focus": "input"
    },
    key: 1
  };

  function tmpl$g($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("input", stc0$g), api_element("input", stc1$f)];
    /*LWC compiler v2.11.8*/
  }

  var input = lwc.registerTemplate(tmpl$g);

  __setKey(tmpl$g, "stylesheets", []);

  var stc0$f = {
    attrs: {
      "data-focus": "inputTimeDisabled",
      "type": "time",
      "disabled": ""
    },
    key: 0
  };
  var stc1$e = {
    attrs: {
      "data-focus": "inputTime",
      "type": "time"
    },
    key: 1
  };

  function tmpl$f($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("input", stc0$f), api_element("input", stc1$e)];
    /*LWC compiler v2.11.8*/
  }

  var inputTime = lwc.registerTemplate(tmpl$f);

  __setKey(tmpl$f, "stylesheets", []);

  var stc0$e = {
    attrs: {
      "data-focus": "object",
      "width": "10",
      "height": "10"
    },
    key: 0
  };
  var stc1$d = {
    attrs: {
      "data-focus": "objectData",
      "width": "10",
      "height": "10",
      "data": "https://example.com/"
    },
    key: 1
  };

  function tmpl$e($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("object", stc0$e), api_element("object", stc1$d)];
    /*LWC compiler v2.11.8*/
  }

  var objectData = lwc.registerTemplate(tmpl$e);

  __setKey(tmpl$e, "stylesheets", []);

  var stc0$d = {
    attrs: {
      "data-focus": "selectDisabled",
      "disabled": ""
    },
    key: 0
  };
  var stc1$c = {
    key: 1
  };
  var stc2$5 = {
    attrs: {
      "data-focus": "select"
    },
    key: 2
  };
  var stc3$4 = {
    key: 3
  };

  function tmpl$d($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("select", stc0$d, [api_element("option", stc1$c, [api_text("select")])]), api_element("select", stc2$5, [api_element("option", stc3$4, [api_text("select")])])];
    /*LWC compiler v2.11.8*/
  }

  var select = lwc.registerTemplate(tmpl$d);

  __setKey(tmpl$d, "stylesheets", []);

  var stc0$c = {
    attrs: {
      "data-focus": "selectMultipleDisabled",
      "multiple": "",
      "disabled": ""
    },
    key: 0
  };
  var stc1$b = {
    key: 1
  };
  var stc2$4 = {
    attrs: {
      "data-focus": "selectMultiple",
      "multiple": ""
    },
    key: 2
  };
  var stc3$3 = {
    key: 3
  };

  function tmpl$c($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("select", stc0$c, [api_element("option", stc1$b, [api_text("select multiple")])]), api_element("select", stc2$4, [api_element("option", stc3$3, [api_text("select multiple")])])];
    /*LWC compiler v2.11.8*/
  }

  var selectMultiple = lwc.registerTemplate(tmpl$c);

  __setKey(tmpl$c, "stylesheets", []);

  var stc0$b = {
    attrs: {
      "data-focus": "selectOptgroupDisabled",
      "disabled": ""
    },
    key: 0
  };
  var stc1$a = {
    key: 1
  };
  var stc2$3 = {
    key: 2
  };
  var stc3$2 = {
    attrs: {
      "data-focus": "selectOptgroup"
    },
    key: 3
  };
  var stc4$2 = {
    key: 4
  };
  var stc5$2 = {
    key: 5
  };

  function tmpl$b($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("select", stc0$b, [api_element("optgroup", stc1$a, [api_element("option", stc2$3, [api_text("optgroup")])])]), api_element("select", stc3$2, [api_element("optgroup", stc4$2, [api_element("option", stc5$2, [api_text("optgroup")])])])];
    /*LWC compiler v2.11.8*/
  }

  var selectOptgroup = lwc.registerTemplate(tmpl$b);

  __setKey(tmpl$b, "stylesheets", []);

  var stc0$a = {
    attrs: {
      "data-focus": "span"
    },
    key: 0
  };
  var stc1$9 = {
    attrs: {
      "data-focus": "spanContenteditable",
      "contenteditable": ""
    },
    key: 1
  };

  function tmpl$a($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("span", stc0$a, [api_text("span")]), api_element("span", stc1$9, [api_text("span[contenteditable]")])];
    /*LWC compiler v2.11.8*/
  }

  var spanContenteditable = lwc.registerTemplate(tmpl$a);

  __setKey(tmpl$a, "stylesheets", []);

  var stc0$9 = {
    attrs: {
      "data-focus": "span"
    },
    key: 0
  };
  var stc1$8 = {
    attrs: {
      "data-focus": "spanTabindexNegativeOne",
      "tabindex": "-1"
    },
    key: 1
  };

  function tmpl$9($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("span", stc0$9, [api_text("span")]), api_element("span", stc1$8, [api_text("span[tabindex=\"-1\"]")])];
    /*LWC compiler v2.11.8*/
  }

  var spanTabindexNegativeOne = lwc.registerTemplate(tmpl$9);

  __setKey(tmpl$9, "stylesheets", []);

  var stc0$8 = {
    attrs: {
      "data-focus": "span"
    },
    key: 0
  };
  var stc1$7 = {
    attrs: {
      "data-focus": "spanTabindexZero",
      "tabindex": "0"
    },
    key: 1
  };

  function tmpl$8($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("span", stc0$8, [api_text("span")]), api_element("span", stc1$7, [api_text("span[tabindex=\"0\"]")])];
    /*LWC compiler v2.11.8*/
  }

  var spanTabindexZero = lwc.registerTemplate(tmpl$8);

  __setKey(tmpl$8, "stylesheets", []);

  var stc0$7 = {
    attrs: {
      "data-focus": "summary"
    },
    key: 0
  };

  function tmpl$7($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("summary", stc0$7, [api_text("summary by itself")])];
    /*LWC compiler v2.11.8*/
  }

  var summary = lwc.registerTemplate(tmpl$7);

  __setKey(tmpl$7, "stylesheets", []);

  var stc0$6 = {
    key: 0
  };
  var stc1$6 = {
    attrs: {
      "data-focus": "summaryInsideDetails"
    },
    key: 1
  };

  function tmpl$6($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("details", stc0$6, [api_element("summary", stc1$6, [api_text("summary inside details")]), api_text("summary inside details content")])];
    /*LWC compiler v2.11.8*/
  }

  var summaryInsideDetails = lwc.registerTemplate(tmpl$6);

  __setKey(tmpl$6, "stylesheets", []);

  var stc0$5 = {
    key: 0
  };
  var stc1$5 = {
    attrs: {
      "data-focus": "summaryInsideDetailsMultiple"
    },
    key: 1
  };
  var stc2$2 = {
    attrs: {
      "data-focus": "summaryInsideDetailsMultipleSecond"
    },
    key: 2
  };

  function tmpl$5($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("details", stc0$5, [api_element("summary", stc1$5, [api_text("summary inside details multiple")]), api_text("summary inside details multiple content"), api_element("summary", stc2$2, [api_text("summary inside details multiple")]), api_text("summary inside details multiple content")])];
    /*LWC compiler v2.11.8*/
  }

  var summaryInsideDetailsMultiple = lwc.registerTemplate(tmpl$5);

  __setKey(tmpl$5, "stylesheets", []);

  var stc0$4 = {
    attrs: {
      "width": "150",
      "height": "30"
    },
    key: 0,
    svg: true
  };
  var stc1$4 = {
    attrs: {
      "data-focus": "svgAnchor"
    },
    key: 1,
    svg: true
  };
  var stc2$1 = {
    attrs: {
      "x": "0",
      "y": "20"
    },
    key: 2,
    svg: true
  };
  var stc3$1 = {
    attrs: {
      "width": "150",
      "height": "30"
    },
    key: 3,
    svg: true
  };
  var stc4$1 = {
    attrs: {
      "data-focus": "svgAnchorHref",
      "href": "#"
    },
    key: 4,
    svg: true
  };
  var stc5$1 = {
    attrs: {
      "x": "0",
      "y": "20"
    },
    key: 5,
    svg: true
  };

  function tmpl$4($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("svg", stc0$4, [api_element("a", stc1$4, [api_element("text", stc2$1, [api_text("svg a")])])]), api_element("svg", stc3$1, [api_element("a", stc4$1, [api_element("text", stc5$1, [api_text("svg a[href]")])])])];
    /*LWC compiler v2.11.8*/
  }

  var svgAnchorHref = lwc.registerTemplate(tmpl$4);

  __setKey(tmpl$4, "stylesheets", []);

  var stc0$3 = {
    attrs: {
      "width": "150",
      "height": "30"
    },
    key: 0,
    svg: true
  };
  var stc1$3 = {
    attrs: {
      "data-focus": "svgAnchor"
    },
    key: 1,
    svg: true
  };
  var stc2 = {
    attrs: {
      "x": "0",
      "y": "20"
    },
    key: 2,
    svg: true
  };
  var stc3 = {
    attrs: {
      "width": "150",
      "height": "30"
    },
    key: 3,
    svg: true
  };
  var stc4 = {
    attrs: {
      "data-focus": "svgAnchorXlinkHref",
      "xlink:href": ""
    },
    key: 4,
    svg: true
  };
  var stc5 = {
    attrs: {
      "x": "0",
      "y": "20"
    },
    key: 5,
    svg: true
  };

  function tmpl$3($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("svg", stc0$3, [api_element("a", stc1$3, [api_element("text", stc2, [api_text("svg")])])]), api_element("svg", stc3, [api_element("a", stc4, [api_element("text", stc5, [api_text("svg a[xlink:href]")])])])];
    /*LWC compiler v2.11.8*/
  }

  var svgAnchorXlinkHref = lwc.registerTemplate(tmpl$3);

  __setKey(tmpl$3, "stylesheets", []);

  var stc0$2 = {
    attrs: {
      "data-focus": "textareaDisabled",
      "rows": "1",
      "cols": "1",
      "disabled": ""
    },
    key: 0
  };
  var stc1$2 = {
    attrs: {
      "data-focus": "textarea",
      "rows": "1",
      "cols": "1"
    },
    key: 1
  };

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("textarea", stc0$2), api_element("textarea", stc1$2)];
    /*LWC compiler v2.11.8*/
  }

  var textarea = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  var stc0$1 = {
    attrs: {
      "data-focus": "video",
      "width": "1",
      "height": "1"
    },
    key: 0
  };
  var stc1$1 = {
    attrs: {
      "data-focus": "videoControls",
      "controls": "",
      "width": "1",
      "height": "1"
    },
    key: 1
  };

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("video[controls]"), api_element("video", stc0$1), api_element("video", stc1$1)];
    /*LWC compiler v2.11.8*/
  }

  var videoControls = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$1() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }
  var map = Object.compatAssign(Object.create(null), {
    anchorHref: anchorHref,
    areaHref: areaHref,
    audioControls: audioControls,
    button: button,
    checkbox: checkbox,
    detailsEmpty: detailsEmpty,
    divOverflow: divOverflow,
    embedSrc: embedSrc,
    iframe: iframe,
    iframeSrc: iframeSrc,
    img: img,
    imgSrc: imgSrc,
    input: input,
    inputTime: inputTime,
    objectData: objectData,
    select: select,
    selectMultiple: selectMultiple,
    selectOptgroup: selectOptgroup,
    spanContenteditable: spanContenteditable,
    spanTabindexNegativeOne: spanTabindexNegativeOne,
    spanTabindexZero: spanTabindexZero,
    summary: summary,
    summaryInsideDetails: summaryInsideDetails,
    summaryInsideDetailsMultiple: summaryInsideDetailsMultiple,
    svgAnchorHref: svgAnchorHref,
    svgAnchorXlinkHref: svgAnchorXlinkHref,
    textarea: textarea,
    videoControls: videoControls
  });

  var Child = /*#__PURE__*/function (_LightningElement) {
    _inherits(Child, _LightningElement);

    var _super = _createSuper$1(Child);

    function Child() {
      var _this;

      _classCallCheck(this, Child);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "type", void 0);

      return _this;
    }

    _createClass(Child, [{
      key: "render",
      value: function render() {
        var _this$type;

        var html = (_this$type = this._ES5ProxyType ? this.get("type") : this.type, map._ES5ProxyType ? map.get(_this$type) : map[_this$type]);

        if (!html) {
          throw new TypeError(__concat("Unknown type: \"", this._ES5ProxyType ? this.get("type") : this.type, "\""));
        }

        return html;
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Child;
  }(lwc.LightningElement);

  __setKey(Child, "delegatesFocus", true);

  lwc.registerDecorators(Child, {
    publicProps: {
      type: {
        config: 0
      }
    }
  });

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl$1
  });

  var stc0 = {
    classMap: {
      "start": true
    },
    attrs: {
      "placeholder": "start"
    },
    key: 0
  };
  var stc1 = {
    classMap: {
      "done": true
    },
    attrs: {
      "placeholder": "done"
    },
    key: 2
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("input", stc0), api_custom_element("integration-child", _integrationChild, {
      props: {
        "tabIndex": "0",
        "type": $cmp._ES5ProxyType ? $cmp.get("type") : $cmp.type
      },
      key: 1
    }), api_element("input", stc1)];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var FocusableCoverage = /*#__PURE__*/function (_LightningElement) {
    _inherits(FocusableCoverage, _LightningElement);

    var _super = _createSuper(FocusableCoverage);

    function FocusableCoverage() {
      var _this;

      _classCallCheck(this, FocusableCoverage);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "type", 'anchorHref');

      return _this;
    }
    /*LWC compiler v2.11.8*/


    return FocusableCoverage;
  }(lwc.LightningElement);

  lwc.registerDecorators(FocusableCoverage, {
    publicProps: {
      type: {
        config: 0
      }
    }
  });

  var Cmp = lwc.registerComponent(FocusableCoverage, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-focusable-coverage', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
