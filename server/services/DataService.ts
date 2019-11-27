import path from 'path';
import fs from 'fs';

import nicknames from "../util/nicknames";
import RandomizedSet from '../util/RandomizedSet';

const projectSrcPath = path.resolve(__dirname, '../');
const wordData = fs.readFileSync(`${projectSrcPath}/word.txt`, 'utf-8');

type Keyword = [string, string];
const gameKeywords = wordData.split('\n').map(w => w.split(':') as Keyword);

const randomizedNames = new RandomizedSet(nicknames);
const randomizeGameKeywords = new RandomizedSet(gameKeywords);

export default class DataService {
  static getRandomName() {
    const name = randomizedNames.getRandom();
    return name;
  }
  static getRandomGameKeyword() {
    const k = randomizeGameKeywords.getRandom();
    return k;
  }
}
