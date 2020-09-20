const shared = require('@vue/shared')
const { reactive, effect, ref, computed, isReactive, isRef, unref } = require('@vue/reactivity')
import { onShow, lifetimeMap, lifetimes, onPullDownRefresh } from '../../utils/lifetime'
// Component({
//   data: {
//     state: {
//       count: 1
//     },
//     count: 1
//   },
//   methods: {
//     onLoad() {
      
//     },
//     onShow() {},
    
//     handlerCick() {},
//     mouseCLick() {}
//   }
// })


function noop() {}

function initialSetup(instance, config) {
  if (config.setup) {
    const setupResult = config.setup(instance)
    Object.keys(setupResult).forEach(key => {
      const value = Reflect.get(setupResult, key) // setupResult[key]
      // value 分析是数据类型还是方法类型
      // 1. 数据类型如何判断
      if (isReactive(value) || isRef(value)) {
        Object.defineProperty(instance.data, key, {
          enumerable: true,
          configurable: true,
          value: unref(value)
        })
      } else {
        Object.defineProperty(instance, key, {
          enumerable: true,
          configurable: true,
          value: effectDecorator(instance, value)
        })
      }
    });
    instance.setData(instance.data)
  }
}

/**
 * @todo: 如果回调没有赋值操作，不会收集依赖
 * 
 * @param {*} instance 
 * @param {*} fn 
 */
function effectDecorator(instance, fn) {
  return function effectBinding() {
    if (!fn.effect) {
      fn.effect = effect(() => {
        fn.apply(null, arguments)
      }, {
        lazy: true
      })
    }
    fn.effect()
    
    if (fn.effect.deps.length) {
      instance.setData(instance.data)
    }
  }
}

function bindLifetime(instance) {
  lifetimes.forEach(l => {
    if (lifetimeMap.has(l)) {
      const origin = instance[l]
      const lifes = lifetimeMap.get(l)
      const fn = (...args) => {
        lifes.forEach(life => {
          life.apply(null, args)
        })
        //origin && origin.apply(this, args)
      }
      Object.defineProperty(instance, l, {
        configurable: true,
        enumerable: true,
        value: function(...args) {
          lifes.forEach(life => {
            const a = effectDecorator(instance, life)
            
            a.apply(null, args)
          })
        }
      })
    }
  })
}

function createComponent(config) {
  // 1. 最先执行的生命周期函数执行
  config.methods = {}

  Object.defineProperty(config.methods, 'onLoad', {
    enumerable: true,
    configurable: true,
    value: function() {
      // 当前实例
      initialSetup(this, config)
      bindLifetime(this)
    }
  })

  return Component(config)
}

function plusHandler() {
  const state = reactive({
    count: 0
  }) // { value: count }

  const handlerClick = () => {
    console.log('click123')
    state.count++
  }
  return {
    state,
    handlerClick
  }
}

function changeBackground() {
  const state = reactive({
    color: 'red'
  });

  onPullDownRefresh(() => {
    console.log(state.color)
    state.color = 'yellow'
  });

  return {
    state
  }

}

createComponent({
  setup() {
    const { state, handlerClick } = plusHandler()
    const { state: colors } = changeBackground()

    console.log(colors)

    return {
      state,
      colors,
      handlerClick
    }
  }
})
