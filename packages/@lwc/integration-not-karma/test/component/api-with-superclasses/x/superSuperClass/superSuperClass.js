import { api } from 'lwc';

import { LightningElement } from 'lwc';
export default class extends LightningElement {
    @api
    methodPublicOmitOmit() {}

    @api
    methodPublicOmitPublic() {}

    @api
    methodPublicOmitPrivate() {}

    @api
    methodPublicPublicOmit() {}

    @api
    methodPublicPublicPublic() {}

    @api
    methodPublicPublicPrivate() {}

    @api
    methodPublicPrivateOmit() {}

    @api
    methodPublicPrivatePublic() {}

    @api
    methodPublicPrivatePrivate() {}

    methodPrivateOmitOmit() {}

    methodPrivateOmitPublic() {}

    methodPrivateOmitPrivate() {}

    methodPrivatePublicOmit() {}

    methodPrivatePublicPublic() {}

    methodPrivatePublicPrivate() {}

    methodPrivatePrivateOmit() {}

    methodPrivatePrivatePublic() {}

    methodPrivatePrivatePrivate() {}
}
