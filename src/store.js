import vuexMixin from './mixin';
import { assert, unifyObjectStyle } from './util';

let Vue;

export class Store {
  constructor (options = {}) {
    const { strict = false, mutations, actions, getters } = options;
    this._committing = false;
    this.strict = strict;
    this._wrappedGetters = Object.create(null);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);

    const store = this;
    const { dispatch, commit } = store;
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload);
    } 
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options);
    }

    registerMutations(store, mutations);
    registerActions(store, actions);
    registerGetters();
  }

  get state () {
    return this._vm._data.$$state;
  }

  set state () {
    assert(false, `use store.replaceState() to explicit replace store state.`);
  }

  commit (_type, _payload) { // 省略非主要参数 options
    const { type, payload } = unifyObjectStyle(_type, _payload);
    const entry = this._mutations[type];
    if (entry) {
      this._withCommit(() => {
        entry(payload); // 忽略entry为数组的情况
      })
    }
  }

  dispatch (_type, _payload) {
    const { type, payload } = unifyObjectStyle(_type, _payload);
    const entry = this._actions[type];
    let result;
    if (entry) {
      result = entry(payload); // 忽略entry为数组的情况
    }

    return new Promise((resolve, reject) => {
      result.then(res => resolve(res), error => reject(error));
    })
  }

  _withCommit (fn) {
    const committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  }

  /**
   * 注册mutations
   * @param {*} store 
   * @param {*} mutations 
   */
  registerMutations (store, mutations) {
    Object.entries(mutations).forEach(([type, handler]) => {
      this.registerMutation(store, type, handler);
    })
  }

  registerMutation (store, type, handler) {
    const entry = store._mutations[type] || (store._mutations[type] = []);
    entry.push(function wrappedMutationHandler (payload) {
      handler.call(store, store.state, payload);
    })
  }

  registerActions (store, actions) {
    Object.entries(actions).forEach(([type, handler]) => {
      this.registerAction(store, type, handler);
    })
  }

  registerAction (store, type, handler) {
    const entry = store._actions[type] || (store._actions[type] = []);
    entry.push(function wrappedActionHandler (payload) {
      handler.call(store, store, payload);
    })
  }
}

function enableStrictMode (store) {
  store._vm.$watch(function () {
    return this._data.$$state;
  }, () => {
    assert(store._committing, `do not mutate vuex store state outside mutation handlers.`);
  }, { deep: true, sync: true })
}

export function install (_Vue) {
  if (Vue && _Vue === Vue) {
    console.error('[vuex] already installed. Vue.use(Vuex) should be called only once.');
    return;
  }

  Vue = _Vue;
  vuexMixin(Vue);
}