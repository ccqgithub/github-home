export const debouncePromise = <
  FN extends (...args: any[]) => Promise<T>,
  T
>(
  fn: FN,
  delay: number
) => {
  let disposeLast: (() => void) | null = null;
  let resPromise: Promise<T> | null = null;
  let waitPromises: Promise<T>[] = [];

  const call = async (...args: Parameters<FN>) => {
    // dispose last call, the last promise will be rejected
    disposeLast?.();

    // push cur call to wait list
    waitPromises.push(
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const res = fn(...args);
          res.then(resolve, reject);
        }, delay);
        disposeLast = () => {
          clearTimeout(timer);
          reject();
        };
      })
    );

    if (resPromise) return resPromise;

    resPromise = (async () => {
      while (waitPromises.length) {
        const p = waitPromises.shift()!;
        try {
          const res = await p;
          // the last item, use it as resolve
          if (!waitPromises.length) return res;
        } catch (e) {
          // the last item, use it as the reject
          if (!waitPromises.length) throw e;
        }
      }
    })() as Promise<T>;

    return resPromise.finally(() => {
      disposeLast = null;
      resPromise = null;
      waitPromises = [];
    });
  };

  return call;
};
