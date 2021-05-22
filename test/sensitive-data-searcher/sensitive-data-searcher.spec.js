const fs = require('fs')
const path = require('path')

const SensitiveDataSearcher = require('../../src/sensitive-data-searcher')
const sensitiveKeywords = require('../../src/sensitive-keywords')

describe('SensitiveDataSearcher', () => {
    /**
     * @var {SensitiveDataSearcher}
     */
    let searcher

    beforeEach(() => {
        searcher = new SensitiveDataSearcher()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should instantiate', () => {
        expect(() => {
            const searcher = new SensitiveDataSearcher()
            expect(searcher).toBeTruthy()
        }).not.toThrow()
    })

    it('should set default field values', () => {
        expect(searcher.regexes).toEqual([])
    })

    describe('build', () => {
        it('should build regexes', () => {
            searcher.build()
            expect(searcher.regexes).toHaveLength(sensitiveKeywords.length * 2)
            expect(searcher.regexes).toMatchSnapshot()
        })
    })

    describe('search', () => {
        const invalidFilesPath = path.resolve(__dirname, './invalid-files')
        const validFilesPath = path.resolve(__dirname, './valid-files')

        const invalidFiles = fs.readdirSync(invalidFilesPath)
        const validFiles = fs.readdirSync(validFilesPath)

        test.each(invalidFiles)('it should find problems in file %s', (filename) => {
            const contents = fs.readFileSync(path.join(invalidFilesPath, filename)).toString()

            searcher.build()
            const results = searcher.search('test', contents)

            expect(results.valid).toBe(false)
            expect(results.problems).toHaveLength(5)
            expect(results).toMatchSnapshot()
        })

        test.each(validFiles)('it should not find problems in file %s', (filename) => {
            const contents = fs.readFileSync(path.join(validFilesPath, filename)).toString()

            searcher.build()
            const results = searcher.search(filename, contents)

            expect(results.valid).toBe(true)
            expect(results.problems).toHaveLength(0)
        })
    })
})
