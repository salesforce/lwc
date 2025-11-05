import { api } from 'lwc';

import SuperSuperClass from 'x/superSuperClass';
export default class extends SuperSuperClass {
    @api
    methodOmitPublicOmit() {}

    @api
    methodOmitPublicPublic() {}

    @api
    methodOmitPublicPrivate() {}

    methodOmitPrivateOmit() {}

    methodOmitPrivatePublic() {}

    methodOmitPrivatePrivate() {}

    @api
    methodPublicPublicOmit() {}

    @api
    methodPublicPublicPublic() {}

    @api
    methodPublicPublicPrivate() {}

    methodPublicPrivateOmit() {}

    methodPublicPrivatePublic() {}

    methodPublicPrivatePrivate() {}

    @api
    methodPrivatePublicOmit() {}

    @api
    methodPrivatePublicPublic() {}

    @api
    methodPrivatePublicPrivate() {}

    methodPrivatePrivateOmit() {}

    methodPrivatePrivatePublic() {}

    methodPrivatePrivatePrivate() {}
}
