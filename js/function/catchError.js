export default function catchError(fn) {
  return function(...args) {
    try {
      return fn.bind(this)(...args);
    } catch (e) {
      console.error(e);
    }
  }
}
