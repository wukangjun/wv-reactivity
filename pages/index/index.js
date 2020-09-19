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
          value: function(...args) {
            if (!value.effect) {
              value.effect = effect(() => {
                value.apply(null, args)
              }, {
                lazy: true
              })
            }
            value.effect()
            if (value.effect.deps.length) {
              // setData
              console.log(instance.data)
              instance.setData(instance.data)
            }
          }
        })
      }
    });
    instance.setData(instance.data)
  }
}

function bindLifetime(instance) {
  lifetimes.forEach(l => {
    if (lifetimeMap.has(l)) {
      const origin = instance[l]
      const lifetimes = lifetimeMap.get(l)
      Object.defineProperty(instance, l, {
        configurable: true,
        enumerable: true,
        value: function(...args) {
          lifetimes.forEach(life => life.apply(null, args))
          origin && origin.apply(this, args)
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
    console.log('refrehs')
    //state.color = 'yellow'
  });

  return {
    state
  }

}

createComponent({
  setup() {
    const { state, handlerClick } = plusHandler()
    const { state: colors } = changeBackground()
    onShow(() => {
      console.log('onShow1')
    })
    onShow(() => {
      console.log('onShow2')
    })

    console.log(colors)

    return {
      state,
      colors,
      handlerClick
    }
  }
})

// createApp({
//   setup() {
//     // 定义数据
//     const count = ref(0) // { __isRef: true }
//     const state = reactive({   // Proxy  { __isRetivite: true }
//       count: 0,
//       loading: true
//     })
//     const double = computed(() => count * 2) RefImplimenent

//     const clickHandler = (event) => {
//       console.log('hello', event)
//       state.count++
//     }

//     const color = ref('#fffff')
//     onShow(() => {
//       color.value = 'red'
//     })

//     onShow(() => {
//       console.log('hello world1234')
//     })

//     onPullDownRefresh(() => {
//       console.log('pulldown')
//     })

//     return {
//       state: state,
//       clickHandler: clickHandler
//     }
//   }
// })


// var updateDepth = 0
// var diffQUeue = {}
// function setState(o) {
//   updateDepth++
//   diffQUeue = { ...diffQUeue, ...o }
//   updateDepth--
//   if (updateDepth === 0) {
//     console.log(diffQUeue)
//   }
// }