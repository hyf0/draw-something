export function getIsDevelopment() {
    if (process.env.NODE_ENV === 'production') return false;
    return process.env.NODE_ENV !== 'development';
}

export function createIncreaseIdGetter(start: number = 0) {
  return function increaseId() {
    const res = start;
    start += 1;
    return res;
  }
}
