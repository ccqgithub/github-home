import { useState, useRef } from "react";

// 使用 useRef 的引用特质， 同时保持 useState 的响应性
type StateRefObj<T> = {
  value: T;
};
export default function useStateRef<T>(
  initialState: T | (() => T)
): StateRefObj<T> {
  const [state, setState] = useState(() => {
    if (typeof initialState === "function") {
      return (initialState as () => T)();
    }
    return initialState;
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const [ref] = useState<StateRefObj<T>>(() => {
    return {
      set value(v: T) {
        setState(v);
      },
      get value() {
        return stateRef.current;
      },
    };
  });
  return ref;
}
