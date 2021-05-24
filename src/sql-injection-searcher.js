class SqlInjectionSearcher {
    constructor() {
        this.regexes = [
            new RegExp('OR 1=1'),
            new RegExp('UNION SELECT username'),
            new RegExp('WHERE [a-zA-Z0-9_]+ ?[=><] ?" ?[+.] ?\\$?[a-zA-Z0-9_]+'),
            new RegExp('WHERE [a-zA-Z0-9_]+ ?[=><] ?\'?\\$[a-zA-Z0-9_]+\'?')
        ]
    }

    /**
     *
     * @param {string} file
     * @param {string} contents
     */
    search(file, contents) {
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
                        type: 'Potential sql injection vulnerability'
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

module.exports = SqlInjectionSearcher
