// 这个其实是 https://leetcode-cn.com/problems/insert-delete-getrandom-o1/ 题的js解法，这里正好可以用

export default class RandomizedSet<T> { // o(1) 的情况下等概率随机从数组里取值，且无重复
  indexMap = new Map<T, number>();
  itemMap = new Map<number, T>();
  size = 0;
  constructor(private data: T[]) {
    if (data.length === 0) {
      throw new Error(`data: ${data} length is 0.`);
    }
    this.insertAll(data);
  }

  insertAll(items: T[]) {
    items.forEach(item => {
      this.insert(item);
    });
  }

  insert(item: T) {
    if (this.indexMap.has(item)) return false; // 插入失败
    this.indexMap.set(item, this.size);
    this.itemMap.set(this.size, item);
    this.size += 1;
    return true;
  }

  remove(item: T) {
    const targetIndex = this.indexMap.get(item);
    if (targetIndex === undefined) return false;
    // const targetItem = this.itemMap.get(targetIndex);
    const lastItem = this.itemMap.get(this.size - 1) as T; // 拿到最后一个
    this.itemMap.set(targetIndex, lastItem); // 将被remove的index值用lastItem覆盖
    this.indexMap.set(lastItem, targetIndex); // 更新 lastItem 对应的 index 值
    this.indexMap.delete(item); // 删除对应的 索引index 值
    this.itemMap.delete(this.size - 1); // 删除最后一个对应的索引值
    this.size -= 1;
    return true;
  }

  getRandom(): T {
    let result = this.itemMap.get(Math.floor(Math.random() * this.size));
    if (result === undefined) {
      this.insertAll(this.data);
      result = this.itemMap.get(Math.floor(Math.random() * this.size)) as T;
    }
    this.remove(result);
    return result;
  }
}
