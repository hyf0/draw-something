function addSlashToHeadIfNotExist(str: string): string {
  if (str.length === 0 || str[0] !== '/') {
    return `/${str}`;
  }
  return str;

}

function removeSlashFromEndIfExsit(str: string): string {
  if (str.length === 0 || str[str.length - 1] !== '/') {
    return str;
  }
  return str.slice(0, str.length - 1);
}

export function formatPath(path: string): string {
  // path = removeSlashFromEndIfExsit(path); // 注意这里的顺序不能调换，考虑输入是/的情况
  path = addSlashToHeadIfNotExist(path);
  return path;
}
