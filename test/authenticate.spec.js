const { verifySignature } = require('../src/authenticate')

// Mocks
jest.mock('crypto', () => {
    return {
        createHmac () {
            return {
                update () {
                    return {
                        digest () {
                            return 'digested-hmac'
                        }
                    }
                }
            }p
        },
        timingSafeEqual (s1, s2) {
            return s1.toString() === s2.toString()
        }
    }
})
jest.mock('../src/secret-gcloud', () => {
    return {
        accessSecretVersion () {
            return new Promise(resolve => resolve('secret'))
        }
    }
})

// Test
describe('authenticate', () => {
    it('should return true when expected signature equals calculated', async () => {
        // noinspection JSCheckFunctionSignatures
        const isValid = await verifySignature({
            body: {},
            headers: {
                'x-hub-signature-256': 'sha256=digested-hmac'
            }
        })

        expect(isValid).toBe(true)
    })

    it('should return false when expected signature differs from calculated', async () => {
        // noinspection JSCheckFunctionSignatures
        const isValid = await verifySignature({
            body: {},
            headers: {
                'x-hub-signature-256': 'sha256=digested-hmac2'
            }
        })

        expect(isValid).toBe(false)
    })
})
