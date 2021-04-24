const sensitiveKeywords = require('./sensitive-keywords')

class SensitiveDataSearcher {
    constructor () {
        this.regexes = []
    }

    build () {
        const expectedCharacters = `\w !@#$%^&()\\\/,.;'-_`

        this.regexes = sensitiveKeywords.map(keyword => {
            return [
                // Most C-Style languages
                new RegExp(`${keyword} ?= ?["'\`]?([${expectedCharacters}]+)["'\`]?;?`),

                // Type of variable after comma - Kotlin/Typescript
                new RegExp(`${keyword} ?: ?[a-zA-Z0-9_]+ ?= ?["'\`]?([${expectedCharacters}]+)["'\`]?`)
            ];
        }).flat()
    }

    /**
     *
     * @param {string} file
     * @param {string} contents
     */
    search (file, contents) {
        const problems = []

        this.regexes.forEach(regex => {
            contents.split('\n').forEach((line, idx) => {
                line = line.trim()
                const match = line.match(regex)

                if (match) {
                    problems.push({
                        file: file,
                        line: {
                            number: idx + 1,
                            contents: line
                        },
                        type: 'Sensitive data'
                    })
                }
            })
        })

        return {
            problems: problems,
            valid: problems.length === 0
        }
    }
}

module.exports = SensitiveDataSearcher
