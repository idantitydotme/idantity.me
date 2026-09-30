import { createSignal, createEffect, type Accessor } from "solid-js";

export function createAsyncData<T>(
  source: () => any,
  fetcher: (val: any) => Promise<T>,
  initialValue?: T,
): Accessor<T | undefined> {
  const [data, setData] = createSignal<T | undefined>(
    initialValue as Exclude<T | undefined, Function>,
  );

  createEffect(
    () => source(),
    (s) => {
      Promise.resolve(fetcher(s))
        .then((res) => setData(() => res))
        .catch((err) => {
          console.error("Async data fetch error:", err);
        });
    },
  );

  return data;
}
