export default function (Vue) {
  Vue.mixin({
    beforeCreate: vuexInit
  })
}

/**
 * Vuex init hook, injected into each instances init hooks list.
 */
function vuexInit () {
  const options = this.$options;
  // store injection 
  if (options.storre) {
    this.$store = typeof options.store === 'function' ? options.store() : options.store;
  } else if (options.parent && options.parent.$store) { // 非根组件，获取父组件的 $store
    this.$store = options.parent.$store;
  }
}