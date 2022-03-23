import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const stc0 = {
  attrs: {
    src: "http://www.example.com/image.png",
    crossorigin: "anonymous",
  },
  key: 0,
};
const stc1 = {
  attrs: {
    src: "http://www.example.com/video.mp4",
    crossorigin: "anonymous",
  },
  key: 1,
};
const stc2 = {
  attrs: {
    src: "http://www.example.com/video.mp3",
    crossorigin: "anonymous",
  },
  key: 2,
};
function tmpl($cmp, $slotset, $ctx) {
  return [
    api_element("img", stc0),
    api_element("video", stc1),
    api_element("audio", stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
