import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const $hoisted1 = api_element(
  "img",
  {
    attrs: {
      src: "http://www.example.com/image.png",
      crossorigin: "anonymous",
    },
    key: 0,
  },
  [],
  true
);
const $hoisted2 = api_element(
  "video",
  {
    attrs: {
      src: "http://www.example.com/video.mp4",
      crossorigin: "anonymous",
    },
    key: 1,
  },
  [],
  true
);
const $hoisted3 = api_element(
  "audio",
  {
    attrs: {
      src: "http://www.example.com/video.mp3",
      crossorigin: "anonymous",
    },
    key: 2,
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1, $hoisted2, $hoisted3];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
