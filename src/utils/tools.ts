import { useCallback } from "react";

export function useDebounce<A extends Array<any>, R = void>(
  fn: (..._args: A) => R, 
  delay: number) {
  let timer: null  | NodeJS.Timeout = null;

  function debounce(..._args: A) {
    if(timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(function(){
        fn.apply(null, _args);
    }, delay);
  }
  return useCallback(debounce, []);
}