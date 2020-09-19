import { isRef, isReactive, unref, effect, stop } from "@vue/reactivity"

const LIFETIMES = [
  'onLoad', 
  'onShow', 
  'onReady', 
  'onHide', 
  'onUnload', 
  'onPullDownRefresh', 
  'onReachBottom', 
  'onShareAppMessage', 
  'onResize']

function noop() { }

function isExistMethods(c) {
  return c.methods !== undefined
}

const shallowUnwrapHandlers = {
  get: (target, key, receiver) => {
    console.log(target)
    return Reflect.get(target, key, receiver)
  },

  set: (target, key, value, receiver) => {
    console.log(target)
    return Reflect.set(target, key, value, receiver);
  }
}

function initialSetup(instance, config) {
  const { setup } = config
  config.data = config.data || {}
  if (setup) {
    const setupResult = setup()

    Object.keys(setupResult).forEach(key => {
      const value = Reflect.get(setupResult, key)
      if (isRef(value) || isReactive(value)) {
        config.data = {
          ...config.data,
          [key]: unref(value)
        }
      } else {
        Object.defineProperty(instance, key, {
          configurable: true,
          enumerable: true,
          value: function (...args) {
            if (!value.effect) {
              value.effect = effect(() => value.apply(null, args), {
                lazy: true,
                scheduler() {
                  //console.log('121212')
                }
              })
            }
            value.effect()
            if (value.effect.deps.length) {
              instance.setData(instance.data)
            }
          }
        })
      }
    })
    instance.data = config.data
    instance.setData(config.data)
  }
}

function bindLifetimes(instance) {
  LIFETIMES.forEach(name => {
    if (lifetimesMap.has(name)) {
      Object.defineProperty(instance, name, {
        enumerable: true,
        configurable: true,
        value: function(...args) {
          const lifetimeSet = lifetimesMap.get(name)
          lifetimeSet.forEach(lifetime => lifetime.apply(null, args))
        }
      })
    }
  })
}

function proxyOnload(config) {
  if (!isExistMethods(config)) {
    config.methods = {
      onLoad: noop
    }
  }
  const origin = config.methods.onLoad
  Object.defineProperty(config.methods, 'onLoad', {
    enumerable: true,
    configurable: true,
    value: function () {
      // 对setup进行操作
      // this 当前的组件实例
      initialSetup(this, config)

      // 绑定生命周期函数
      bindLifetimes(this)
      // 执行已经定义的onload回调
      if (!origin || origin === noop) return;
      origin.apply(this, arguments)
    }
  })
}

export function createApp(config = {}) {
  proxyOnload(config)
  return Component(config)
}


const lifetimesMap = new Map()
function createLifetime(name) {
  return function lifetime(fn) {
    let lifetimeSet
    if (!lifetimesMap.has(name)) {
      lifetimesMap.set(name, lifetimeSet = new Set())
    }
    lifetimeSet.add(fn)
  }
}

export const onShow = createLifetime('onShow')
export const onReady = createLifetime('onReady')
export const onHide = createLifetime('onHide')
export const onUnload = createLifetime('onUnload')
export const onPullDownRefresh = createLifetime('onPullDownRefresh')