const Perun = require('../src/perun')

describe('perun', () => {
    it('instantiates', () => {
        expect(() => {
            // eslint-disable-next-line no-new
            new Perun()
        }).not.toThrow()
    })
})
