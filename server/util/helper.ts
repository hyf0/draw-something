export function getIsDevelopment() {
    if (process.env.NODE_ENV === 'production') return false;
    return process.env.NODE_ENV === 'development';
}

export function createIncreaseIdGetter(start: number = 0) {
  return function increaseId() {
    const res = start;
    start += 1;
    return res;
  }
}

// console.log('\033[42;30m DONE \033[40;32m Compiled successfully in 19987ms\033[0m')


export function log(...args: unknown[]) {
  // const time = new Date().toLocaleTimeString();
  // console.log('\033[43;33m LOG \033[40;32m  123 \033[0m', ...args);
  console.log(`LOG-${new Date().toLocaleTimeString()}:`, ...args);
}

export function logError(...args: unknown[]) {
  console.error(`ERROR-${new Date().toLocaleTimeString()}:`, ...args);
}

export function randomIntBetween(start: number, toButNotIncluded: number):number {
  start |= start;
  toButNotIncluded |= toButNotIncluded;
  if (toButNotIncluded < start) throw new Error(`toButNotIncluded: ${toButNotIncluded} is bigger than start: ${start}`);
  const diff = toButNotIncluded - start;
  const result = Math.floor(Math.random() * diff) + start;
  return result;
}
