const fs = require('fs')
const path = require('path')

const SqlInjectionSearcher = require('../../src/sql-injection-searcher')

describe('SqlInjectionSearcher', () => {

    /**
     * @var {SqlInjectionSearcher}
     */
    let searcher

    beforeEach(() => {
        searcher = new SqlInjectionSearcher()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should instantiate', () => {
        expect(() => {
            const searcher = new SqlInjectionSearcher()
            expect(searcher).toBeTruthy()
        }).not.toThrow()
    })

    it('should correctly set sql injection vulnerabilities regexes', () => {
        expect(searcher.regexes.length).toBeGreaterThan(0)
    })

    describe('search', () => {
        const invalidFilesPath = path.resolve(__dirname, './invalid-files')
        const validFilesPath = path.resolve(__dirname, './valid-files')

        const invalidFiles = fs.readdirSync(invalidFilesPath)
        const validFiles = fs.readdirSync(validFilesPath)

        // Number after _ means how many problems should be found in file
        test.each(invalidFiles)('it should find problems in file %s', (filename) => {
            const contents = fs.readFileSync(path.join(invalidFilesPath, filename)).toString()
            const expectedErrorsCount = parseInt(filename.split('_')[1].split('.')[0])

            const results = searcher.search(filename, contents)

            expect(results.valid).toBe(false)
            expect(results.problems).toHaveLength(expectedErrorsCount)
            expect(results).toMatchSnapshot()
        })

        test.each(validFiles)('it should not find problems in file %s', (filename) => {
            const contents = fs.readFileSync(path.join(validFilesPath, filename)).toString()

            const results = searcher.search(filename, contents)

            expect(results.valid).toBe(true)
            expect(results.problems).toHaveLength(0)
        })
    })
})
