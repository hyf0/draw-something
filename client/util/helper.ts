import { KeyboardEvent } from 'react';

export function getIsDevelopment() {
  const devlopmentPaths = ['localhost', '127.0.0.1', '192.168'];
  return devlopmentPaths.some(p => window.location.origin.includes(p));
}

export function getToken() {
  const token = localStorage.getItem('__token');;
  if (token == null) return undefined;
  return token;
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
  }
}

