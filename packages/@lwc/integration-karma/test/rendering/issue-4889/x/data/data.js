export const dataStatesVariant1 = [
    [
        {
            id: 1,
            renderMe: true,
        },
        {
            id: 2,
            renderMe: true,
            children: [],
        },
        {
            id: 3,
            renderMe: true,
            children: [],
        },
    ],
    [
        {
            id: 5,
            renderMe: false,
        },
        {
            id: 6,
            renderMe: false,
            children: [],
        },
        {
            id: 7,
            renderMe: true,
            children: [
                {
                    id: 13,
                    renderMe: true,
                },
            ],
        },
        {
            id: 8,
            renderMe: false,
            children: [],
        },
    ],
    [
        {
            id: 10,
            renderMe: true,
            children: [],
        },
        {
            id: 11,
            renderMe: true,
            children: [
                {
                    id: 13,
                    renderMe: true,
                },
            ],
        },
        {
            id: 12,
            renderMe: true,
            children: [],
        },
    ],
];

// second variant to repro a different error message
export const dataStatesVariant2 = [
    [
        {
            id: 1,
            renderMe: true,
        },
        {
            id: 2,
            renderMe: true,
            children: [],
        },
        {
            id: 3,
            renderMe: true,
            children: [],
        },
    ],
    [
        {
            id: 5,
            renderMe: false,
        },
        {
            id: 6,
            renderMe: false,
            children: [],
        },
        {
            id: 7,
            renderMe: true,
            children: [
                {
                    id: 13,
                    renderMe: true,
                },
            ],
        },
        {
            id: 8,
            renderMe: false,
            children: [],
        },
    ],
    [
        {
            id: 10,
            renderMe: true,
            children: [],
        },
        {
            id: 11,
            renderMe: true,
            children: [
                {
                    id: 13,
                    renderMe: true,
                },
            ],
        },
    ],
];
