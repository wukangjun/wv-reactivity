
export const lifetimes = ['onLoad', 'onShow', 'onReady', 'onPullDownRefresh']

export const lifetimeMap = new Map()

function createLifetime(name) {
    return function lifetime(fn) {
        if (!lifetimeMap.has(name)) {
            lifetimeMap.set(name, new Set())
        }
        const lifetimeSet = lifetimeMap.get(name)
        lifetimeSet.add(fn)
    }
}

/**
 * 
 * @param {*} fn
 */
export const onLoad = createLifetime('onLoad')
export const onShow = createLifetime('onShow')
export const onReady = createLifetime('onReady')
export const onPullDownRefresh = createLifetime('onPullDownRefresh')

