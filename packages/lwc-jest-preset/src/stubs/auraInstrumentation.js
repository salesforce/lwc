const perfStart = jest.fn().mockImplementation(() => '');

const perfEnd = jest.fn();

const mark = jest.fn().mockImplementation(() => {});

const markStart = jest.fn().mockImplementation(() => {});

const markEnd = jest.fn().mockImplementation(() => {});

const time = jest.fn().mockImplementation(() => 0);

const interaction = jest.fn();

module.exports = {
    perfStart,
    perfEnd,
    mark,
    markStart,
    markEnd,
    time,
    interaction,
};
