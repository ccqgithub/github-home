import { useState } from "react";

// 使用 useRef 的引用特质， 同时保持 useState 的响应性
type StateRefObj<T> = {
  _state: T;
  value: T;
};
export default function useStateRef<T>(
  initialState: T | (() => T)
): StateRefObj<T> {
  const [init] = useState(() => {
    if (typeof initialState === "function") {
      return (initialState as () => T)();
    }
    return initialState;
  });

  const [, setState] = useState(init);

  const [ref] = useState<StateRefObj<T>>(() => {
    return {
      _state: init,
      set value(v: T) {
        this._state = v;
        setState(v);
      },
      get value() {
        return this._state;
      },
    };
  });
  return ref;
}
