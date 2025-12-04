import { api } from 'lwc';

import SuperClass from 'x/superClass';
export default class extends SuperClass {
    @api
    methodOmitOmitPublic() {}

    methodOmitOmitPrivate() {}

    @api
    methodOmitPublicPublic() {}

    methodOmitPublicPrivate() {}

    @api
    methodOmitPrivatePublic() {}

    methodOmitPrivatePrivate() {}

    @api
    methodPublicOmitPublic() {}

    methodPublicOmitPrivate() {}

    @api
    methodPublicPublicPublic() {}

    methodPublicPublicPrivate() {}

    @api
    methodPublicPrivatePublic() {}

    methodPublicPrivatePrivate() {}

    @api
    methodPrivateOmitPublic() {}

    methodPrivateOmitPrivate() {}

    @api
    methodPrivatePublicPublic() {}

    methodPrivatePublicPrivate() {}

    @api
    methodPrivatePrivatePublic() {}

    methodPrivatePrivatePrivate() {}
}
