import { LightningElement } from 'lwc';

export default class DemoApp extends LightningElement {
    data = {
        text: `Dame Jane Morris Goodall DBE (/ˈɡʊdɔːl/; born Valerie Jane Morris-Goodall; 3 April 1934),[3] formerly Baroness Jane van Lawick-Goodall, is an English primatologist and anthropologist.[4] She is considered the world's foremost expert on chimpanzees, after 60 years' studying the social and family interactions of wild chimpanzees. Goodall first went to Gombe Stream National Park in Tanzania to observe its chimpanzees in 1960.[5]

        She is the founder of the Jane Goodall Institute and the Roots & Shoots programme, and she has worked extensively on conservation and animal welfare issues. As of 2022, she is on the board of the Nonhuman Rights Project.[6] In April 2002, she was named a United Nations Messenger of Peace. Goodall is an honorary member of the World Future Council.`,
        person: {
            name: 'Jane Goodall',
            imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Jane-goodall.jpg/220px-Jane-goodall.jpg',
        },
    };
}
