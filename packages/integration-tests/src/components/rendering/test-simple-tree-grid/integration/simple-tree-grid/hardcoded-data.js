const DATA_FROM_NETWORK = [
    {
        id: '1',
        name: 'Name1',
        address: 'Address1',
        phone: 'phone1',
        children: [
            {
                id: '1.1',
                name: 'Name1.1',
                address: 'Address1.1',
                phone: 'phone1.1',
            },
            {
                id: '1.2',
                name: 'Name1.2',
                address: 'Address1.2',
                phone: 'phone1.2',
                children: [
                    {
                        id: '1.2.1',
                        name: 'Name1.2.1',
                        address: 'Address1.2.1',
                        phone: 'phone1.2.1',
                    },
                ],
            },
        ],
    },
    {
        id: '2',
        name: 'Name2',
        address: 'Address2',
        phone: 'phone2',
        _isExpanded: false,
        children: [
            {
                id: '2.1',
                name: 'Name2.1',
                address: 'Address2.1',
                phone: 'phone2.1',
            },
        ],
    },
];

export default DATA_FROM_NETWORK;
