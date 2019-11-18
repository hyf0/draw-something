import path from 'path';
import fs from 'fs';

import nicknames from "../util/nicknames";
import { randomIntBetween } from '../../server/util/helper';

const projectSrcPath = path.resolve(__dirname, '../');
const wordData = fs.readFileSync(`${projectSrcPath}/word.txt`, 'utf-8');

type Keyword = [string, string];
const gameKeywords = wordData.split('\n').map(w => w.split(':') as Keyword);

export default class DataService {
  // static nameIndex = 0;
  // static keywordIndex = 0;
  static getRandomName() {
    const name = nicknames[randomIntBetween(0, nicknames.length)];
    // this.nameIndex += 1;
    return name;
  }
  static getRandomGameKeyword() {
    const k = gameKeywords[randomIntBetween(0, gameKeywords.length)];
    // this.keywordIndex += 1;
    return k;
  }
}
