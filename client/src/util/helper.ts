import { KeyboardEvent } from 'react';

export function getToken() {
  const token = localStorage.getItem('__token');
  if (token == null) return undefined;
  return token;
}

export function throttle<T extends (...args: any[]) => any>(
  cb: T,
  frequency: number,
): (...args: Parameters<T>) => ReturnType<T> {
  let lastTime = -1; // 这是为了保证第一次会被触发
  const result = function (...args: Parameters<T>) {
    const curTime = Date.now();
    if (curTime - lastTime >= frequency) {
      lastTime = curTime;
      return cb(...args);
    }
  };
  return result;
}

export function setToken(token: string) {
  localStorage.setItem('__token', token);
}

export function createHandleOnKeyEnterUp(cb: () => void) {
  return function handleOnKeyEnterUp(evt: KeyboardEvent) {
    const KEY_ENTER_CODE = 13;
    if (evt.keyCode === KEY_ENTER_CODE) {
      cb();
    }
  };
}
