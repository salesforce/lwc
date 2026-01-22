import { api, LightningElement } from 'lwc';

export default class Internals extends LightningElement {
    // See W-17585571
    @api getRootNode() {
        throw new Error(`
I used to think maybe you loved me, now, baby, I'm sure
And I just can't wait 'til the day when you knock on my door
Now every time I go for the mailbox, I've gotta hold myself down
'Cause I just can't wait 'til you write me you're coming around
`);
    }

    // See W-17585549
    @api contains() {
        throw new Error(`
Karma, karma, karma, karma, karma chameleon
You come and go, you come and go
Loving would be easy if your colours were like my dream
Red, gold and green, red, gold and green
        `);
    }
}
