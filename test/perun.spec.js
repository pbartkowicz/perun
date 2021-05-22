const accessSecretVersion = require('../src/secret-gcloud')
const os = require('os')
const Perun = require('../src/perun')
const SensitiveDataSearcher = require('../src/sensitive-data-searcher')

jest.mock('../src/sensitive-data-searcher')
jest.mock('../src/sensitive-data-searcher')

describe('perun', () => {
    it('instantiates', () => {
        expect(() => {
            const perun = new Perun()

            expect(perun).toBeTruthy()
        }).not.toThrow()
    })

    it('should set default parameters', () => {
        const perun = new Perun()

        expect(perun.debug).toBe(true)
        expect(perun.cloneDir.startsWith(os.tmpdir())).toBe(true)
        expect(perun.foundProblems).toBeInstanceOf(Array)
        expect(perun.foundProblems).toHaveLength(0)
        expect(perun.searcher).toBeInstanceOf(SensitiveDataSearcher)
    })

    describe('run', () => {

    })

    describe('cloneRepository', () => {

    })

    describe('process', () => {

    })

    describe('analyzeFile', () => {

    })

    describe('lookForSensitiveData', () => {

    })

    describe('lookForSqlInjection', () => {

    })

    describe('cleanup', () => {

    })

    describe('logRaw', () => {

    })

    describe('log', () => {
        
    })
})
