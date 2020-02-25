import RandomizedSet from '../util/RandomizedSet';
import nicknames from './nicknames';
import gameKeywords from './gameKeywords';

type Keyword = [string, string];

const randomizedNames = new RandomizedSet(nicknames);
const randomizeGameKeywords = new RandomizedSet<Keyword>(
  gameKeywords as Keyword[],
);

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
