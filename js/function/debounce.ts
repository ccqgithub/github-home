export const debounce = <F extends (...args: any[]) => void>(
  fn: F,
  delay: number,
  opts?: {
    leading?: boolean;
  }
): F => {
  const { leading = false } = opts || {};
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last_exec: number | null = null;

  const func = (...args: any[]) => {
    const exec = () => {
      last_exec = Date.now();
      fn(...args);
    };
    timer && clearTimeout(timer);
    if (leading && !last_exec) {
      exec();
      return;
    }
    timer = setTimeout(exec, delay);
  };

  return func as F;
};
