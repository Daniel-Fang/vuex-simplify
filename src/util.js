export function assert (condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}

/**
 * 统一化commit参数的格式
 * 
 * @param {String|Object} type 
 * @param {*} payload 
 * @param {*} options 
 */
export function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  return { type, payload, options };
}