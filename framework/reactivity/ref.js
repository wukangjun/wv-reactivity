

class RefImpl {
    constructor(value) {
        this.__isRef = true;
        this._raw = value;
        this._value = value;
    }

    get value() {
        // 收集依赖
        //track()
        return this._value;
    }

    set value(newVal) {
        if (newVal !== this._value) {
            this._raw = newVal;
            this._value = newVal;
            // 触发依赖
            //trigger()
        }
    }
}


/**
 * @example:
 * const count = ref(0)
 * count.value = 2
 * 
 * @param {Boolean|String|number|undefined|null|Symbol} value 
 */
export function ref(value) {
    return new RefImpl(value)
}