const chalk = require('chalk')
const childProcess = require('child_process')
const fs = require('fs')
const rimraf = require('rimraf')

const accessSecretVersion = require('../src/secret-gcloud')
const Perun = require('../src/perun')
const SensitiveDataSearcher = require('../src/sensitive-data-searcher')

// Mocks
jest.mock('chalk', () => {
    return {
        blue: (msg) => `blue${msg}`,
        red: (msg) => `red${msg}`,
        supportsColor: false
    }
})
jest.mock('child_process', () => {
    return {
        exec: () => {}
    }
})
jest.mock('os', () => {
    return {
        tmpdir: () => 'os-tmpdir'
    }
})
jest.mock('path', () => {
    return {
        join: (...params) => params.join(';')
    }
})
jest.mock('rimraf', () => {
    return {
        sync: () => {}
    }
})
jest.mock('uuid', () => {
    return {
        v4: () => 'uuid-v4'
    }
})
jest.mock('../src/promise-exec', () => {
    return {
        exec: () => {}
    }
})
jest.mock('../src/secret-gcloud')
jest.mock('../src/sensitive-data-searcher')

// Tests
describe('perun', () => {
    /**
     * @var {Perun}
     */
    let perun

    beforeEach(() => {
        perun = new Perun()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('instantiates', () => {
        expect(() => {
            const perun = new Perun()

            expect(perun).toBeTruthy()
        }).not.toThrow()
    })

    it('should set default field values', () => {
        expect(perun.debug).toBe(true)
        expect(perun.cloneDir).toBe('os-tmpdir;uuid-v4')
        expect(perun.foundProblems).toBeInstanceOf(Array)
        expect(perun.foundProblems).toHaveLength(0)
        expect(perun.searcher).toBeInstanceOf(SensitiveDataSearcher)
    })

    describe('run', () => {

    })

    describe('verifyAction', () => {
        const testCases = [
            ['edited', true],
            ['opened', true],
            ['reopened', true],
            ['not-valid', false]
        ]

       test.each(testCases)('it should return correct value for "%s" action', (action, expectedResult) => {
           const result = perun.verifyAction({
               body: {
                   action: action
               }
           })

           expect(result).toBe(expectedResult)
       })
    })

    describe('cloneRepository', () => {
        it('should log, clone repository', async () => {
            const logSpy = jest.spyOn(perun, 'log')
                .mockImplementation(() => {})
            const execSpy = jest.spyOn(childProcess, 'exec')

            await perun.cloneRepository('test')

            expect(logSpy).toBeCalledTimes(1)
            // TODO: Poprawić
            // expect(execSpy).toBeCalledTimes(1)
            // expect(execSpy).toBeCalledWith('test')
        })
    })

    describe('process', () => {
        let testDir = './test/test-directory/'

        it('should analyze all files and log without problems', () => {
            const analyzeSpy = jest.spyOn(perun, 'analyzeFile')
                .mockImplementation(() => {})
            const logSpy = jest.spyOn(perun, 'log')
                .mockImplementation(() => {})

            perun.cloneDir = testDir
            perun.process()

            expect(analyzeSpy).toBeCalledTimes(1)
            expect(logSpy).toBeCalledTimes(1)
            expect(logSpy).toBeCalledWith('green', 'No problems found')
        })

        it('should log all found problems', () => {
            const analyzeSpy = jest.spyOn(perun, 'analyzeFile')
                .mockImplementation(() => {
                    perun.foundProblems.push({})
                })
            const logSpy = jest.spyOn(perun, 'log')
                .mockImplementation(() => {})
            const logRawSpy = jest.spyOn(perun, 'logRaw')
                .mockImplementation(() => {})

            perun.cloneDir = testDir
            perun.process()

            expect(analyzeSpy).toBeCalledTimes(1)
            expect(logSpy).toBeCalledTimes(1)
            expect(logSpy).toBeCalledWith('red', 'Found problems: ')
            expect(logRawSpy).toBeCalledTimes(1)
            expect(logRawSpy).toBeCalledWith(perun.foundProblems)
        })
    })

    describe('analyzeFile', () => {
        it('should read file contents, log info and pass it to the searchers', () => {
            const readFileSyncSpy = jest.spyOn(fs, 'readFileSync')
                .mockImplementation(() => 'file-contents')
            const logSpy = jest.spyOn(perun, 'log')
                .mockImplementation()
            const lookForSensitiveDataSpy = jest.spyOn(perun, 'lookForSensitiveData')
                .mockImplementation()
            const lookForSqlInjectionSpy = jest.spyOn(perun, 'lookForSqlInjection')
                .mockImplementation()

            perun.analyzeFile('test')

            expect(readFileSyncSpy).toBeCalledTimes(1)

            expect(logSpy).toBeCalledTimes(1)
            expect(logSpy).toBeCalledWith('cyan', 'Analyzing file test')

            expect(lookForSensitiveDataSpy).toBeCalledTimes(1)
            expect(lookForSensitiveDataSpy).toBeCalledWith('test', 'file-contents')

            expect(lookForSqlInjectionSpy).toBeCalledTimes(1)
            expect(lookForSqlInjectionSpy).toBeCalledWith('test', 'file-contents')
        })
    })

    describe('lookForSensitiveData', () => {
        it('should do nothing with foundError if searcher found no problems', () => {
            const searchSpy = jest.spyOn(SensitiveDataSearcher.prototype, 'search')
                .mockImplementation(() => {
                    return {
                        valid: true
                    }
                })

            perun.lookForSensitiveData('file', '')

            expect(searchSpy).toBeCalledTimes(1)
            expect(searchSpy).toBeCalledWith('file', '')
            expect(perun.foundProblems).toEqual([])
        })

        it('should append data if searcher found problems', () => {
            const problems = [
                { foo: 'bar' },
                { bar: 'baz '}
            ]

            const searchSpy = jest.spyOn(SensitiveDataSearcher.prototype, 'search')
                .mockImplementation(() => {
                    return {
                        valid: false,
                        problems
                    }
                })

            perun.lookForSensitiveData('file', '')

            expect(searchSpy).toBeCalledTimes(1)
            expect(searchSpy).toBeCalledWith('file', '')
            expect(perun.foundProblems).toEqual(problems)
        })

        it('should append problems to existing problems', () => {
            const oldProblems = [
                { baz: '123' }
            ]
            const problems = [
                { foo: 'bar' },
                { bar: 'baz '}
            ]

            const searchSpy = jest.spyOn(SensitiveDataSearcher.prototype, 'search')
                .mockImplementation(() => {
                    return {
                        valid: false,
                        problems
                    }
                })

            perun.foundProblems = oldProblems
            perun.lookForSensitiveData('file', '')

            expect(searchSpy).toBeCalledTimes(1)
            expect(searchSpy).toBeCalledWith('file', '')
            expect(perun.foundProblems).toEqual([...oldProblems, ...problems])
        })
    })

    describe('lookForSqlInjection', () => {
        // TODO
    })

    describe('cleanup', () => {
        it('should call log and remove tmp directory', () => {
            const logSpy = jest.spyOn(perun, 'log')
                .mockImplementation(() => {})
            const rimrafSyncSpy = jest.spyOn(rimraf, 'sync')

            perun.cleanup()

            expect(logSpy).toBeCalledTimes(1)
            expect(rimrafSyncSpy).toBeCalledTimes(1)
            expect(rimrafSyncSpy).toBeCalledWith(perun.cloneDir)
        })
    })

    describe('logRaw', () => {
        it ('should log to console when debug is set to true', () => {
            const spy = jest.spyOn(console, 'log')
                .mockImplementation(() => {})

            perun.debug = true

            perun.logRaw('test')
            perun.logRaw('test1', 'test2')

            expect(spy).toBeCalledTimes(2)
            expect(spy).toHaveBeenNthCalledWith(1, 'test')
            expect(spy).toHaveBeenNthCalledWith(2, 'test1', 'test2')

            spy.mockRestore()
        })

        it('should not log to console when debug is set to false', () => {
            const spy = jest.spyOn(console, 'log')
            perun.debug = false

            perun.logRaw('test')
            perun.logRaw('test1', 'test2')

            expect(spy).toBeCalledTimes(0)

            spy.mockRestore()
        })
    })

    describe('log', () => {
        it('should call logRaw without color when console does not support color', () => {
            chalk.supportsColor = false
            perun.debug = true

            const spy = jest.spyOn(perun, 'logRaw')
                .mockImplementation(() => {})

            perun.log('blue', 'test')
            perun.log('red', 'foo', 'bar')

            expect(spy).toBeCalledTimes(2)
            expect(spy).toHaveBeenNthCalledWith(1, 'test')
            expect(spy).toHaveBeenNthCalledWith(2, 'foo', 'bar')
        })

        it('should call logRaw with color when console supports color', () => {
            // noinspection JSValidateTypes
            chalk.supportsColor = true
            perun.debug = true

            const spy = jest.spyOn(perun, 'logRaw')
                .mockImplementation(() => {})

            perun.log('blue', 'test')
            perun.log('red', 'foo')

            expect(spy).toBeCalledTimes(2)
            expect(spy).toHaveBeenNthCalledWith(1, 'bluetest')
            expect(spy).toHaveBeenNthCalledWith(2, 'redfoo')
        })
    })
})
