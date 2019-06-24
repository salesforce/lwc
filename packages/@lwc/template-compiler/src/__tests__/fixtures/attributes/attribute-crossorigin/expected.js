import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "img",
      {
        attrs: {
          src: "http://www.example.com/image.png",
          crossorigin: "anonymous"
        },
        key: 1
      },
      []
    ),
    api_element(
      "video",
      {
        attrs: {
          src: "http://www.example.com/video.mp4",
          crossorigin: "anonymous"
        },
        key: 2
      },
      []
    ),
    api_element(
      "audio",
      {
        attrs: {
          src: "http://www.example.com/video.mp3",
          crossorigin: "anonymous"
        },
        key: 3
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
