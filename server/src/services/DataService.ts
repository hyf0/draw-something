import path from 'path';
import fs from 'fs';

import nicknames from "../util/nicknames";

const projectSrcPath = path.resolve(__dirname, '../');
const wordData = fs.readFileSync(`${projectSrcPath}/word.txt`, 'utf-8');

type Keyword = [string, string];
const gameKeywords = wordData.split('\n').map(w => w.split(':') as Keyword);

export default class DataService {
  static nameIndex = 0;
  static keywordIndex = 0;
  static getRandomName() {
    const name = nicknames[this.nameIndex % nicknames.length];
    this.nameIndex += 1;
    return name;
  }
  static getRandomGameKeyword() {
    const k = gameKeywords[this.keywordIndex % gameKeywords.length];
    this.keywordIndex += 1;
    return k;
  }
}
