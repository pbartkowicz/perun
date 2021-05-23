const { CheckRun } = require('../src/checks')

describe('CheckRun', () => {
    let checkRun

    beforeEach(() => {
        checkRun = new CheckRun(
            'check-name',
            'Check title',
            'Check summary',
            'Check problem type',
            'Check msg'
        )
    })

    it('should set property values', () => {
        expect(checkRun.id).toBeNull()
        expect(checkRun.name).toBe('check-name')
        expect(checkRun.status).toBe('in_progress')
        expect(checkRun.conclusion).toBe('success')
        expect(checkRun.output).toEqual({
            title: 'Check title',
            summary: 'Check summary',
            annotations: []
        })
        expect(checkRun.problemsType).toBe('Check problem type')
        expect(checkRun.msg).toBe('Check msg')
    })

    it('create should call octokit request and set params', async () => {
        const request = {
            body: {
                repository: {
                    owner: {
                        login: 'login'
                    },
                    name: 'name'
                },
                pull_request: {
                    head: {
                        sha: 'sha'
                    }
                }
            }
        }

        const octokitInstallation = {
            request () {
                return new Promise(resolve => resolve({
                    status: 201,
                    data: {
                        id: 1337
                    }
                }))
            }
        }

        const octoSpy = jest.spyOn(octokitInstallation, 'request')

        await checkRun.create(request, octokitInstallation)

        expect(checkRun.id).toBe(1337)
        expect(octoSpy).toBeCalledTimes(1)
        expect(octoSpy).toBeCalledWith('POST /repos/{owner}/{repo}/check-runs', {
            owner: 'login',
            repo: 'name',
            name: checkRun.name,
            head_sha: 'sha',
            status: checkRun.status
        })
    })

    it('create should throw error if response status differs from 201', async () => {
        const request = {
            body: {
                repository: {
                    owner: {
                        login: 'login'
                    },
                    name: 'name'
                },
                pull_request: {
                    head: {
                        sha: 'sha'
                    }
                }
            }
        }

        const octokitInstallation = {
            request () {
                return new Promise(resolve => {
                    resolve({
                        status: 404,
                        data: {
                            id: 1337
                        }
                    })
                })
            }
        }

        await expect(async () => {
            await checkRun.create(request, octokitInstallation)
        }).rejects.toThrow(Error)
    })

    it('update should call octokit request', async () => {
        const request = {
            body: {
                repository: {
                    owner: {
                        login: 'login'
                    },
                    name: 'name'
                },
                pull_request: {
                    head: {
                        sha: 'sha'
                    }
                }
            }
        }

        const octokitInstallation = {
            request () {
                return new Promise(resolve => resolve({ status: 200 }))
            }
        }

        const octoSpy = jest.spyOn(octokitInstallation, 'request')

        checkRun.id = 7331
        await checkRun.update(request, octokitInstallation)

        expect(octoSpy).toBeCalledTimes(1)
        expect(octoSpy).toBeCalledWith('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: 'login',
            repo: 'name',
            check_run_id: checkRun.id,
            name: checkRun.name,
            head_sha: 'sha',
            status: checkRun.status,
            conclusion: checkRun.conclusion
        })
    })

    it('update should update body output if current annotations length differs from 0', async () => {
        const request = {
            body: {
                repository: {
                    owner: {
                        login: 'login'
                    },
                    name: 'name'
                },
                pull_request: {
                    head: {
                        sha: 'sha'
                    }
                }
            }
        }

        const octokitInstallation = {
            request () {
                return new Promise(resolve => resolve({ status: 200 }))
            }
        }

        const octoSpy = jest.spyOn(octokitInstallation, 'request')

        checkRun.id = 7331
        checkRun.output.annotations.push('foo')
        await checkRun.update(request, octokitInstallation)

        expect(octoSpy).toBeCalledTimes(1)
        expect(octoSpy).toBeCalledWith('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: 'login',
            repo: 'name',
            check_run_id: checkRun.id,
            name: checkRun.name,
            head_sha: 'sha',
            status: checkRun.status,
            conclusion: checkRun.conclusion,
            output: {
                title: 'Check title',
                summary: 'Check summary',
                annotations: ['foo']
            }
        })
    })

    it('update should throw error if response status is not 200', async () => {
        const request = {
            body: {
                repository: {
                    owner: {
                        login: 'login'
                    },
                    name: 'name'
                },
                pull_request: {
                    head: {
                        sha: 'sha'
                    }
                }
            }
        }

        const octokitInstallation = {
            request () {
                return new Promise(resolve => {
                    resolve({
                        status: 404
                    })
                })
            }
        }

        await expect(async () => {
            await checkRun.update(request, octokitInstallation)
        }).rejects.toThrow(Error)
    })

    it('updateStatus should set conclusion success if no problems of current type found', () => {
        checkRun.conclusion = 'definitely-not-a-success'

        checkRun.updateStatus([
            { type: 'Check problem type 2' },
            { type: 'Check problem type 3' }
        ])

        expect(checkRun.conclusion).toBe('success')
    })

    it('updateStatus should add annotations based on found problems', () => {
        const foundProblems = [
            { type: 'Check problem type', file: 'foo', line: { number: 3 } },
            { type: 'Check problem type 2' },
            { type: 'Check problem type', file: 'bar', line: { number: 135123 } },
            { type: 'Check problem type 3' }
        ]

        checkRun.conclusion = 'definitely-not-a-success'
        checkRun.output.annotations = [{ foo: 'bar' }]
        checkRun.updateStatus(foundProblems)

        expect(checkRun.conclusion).toBe('failure')
        expect(checkRun.output.annotations).toHaveLength(3) // 1 before, 2 from check
        expect(checkRun.output.annotations).toEqual([
            {
                foo: 'bar'
            },
            {
                path: foundProblems[0].file,
                start_line: foundProblems[0].line.number,
                end_line: foundProblems[0].line.number,
                annotation_level: 'warning',
                message: checkRun.msg
            },
            {
                path: foundProblems[2].file,
                start_line: foundProblems[2].line.number,
                end_line: foundProblems[2].line.number,
                annotation_level: 'warning',
                message: checkRun.msg
            }
        ])
    })
})
