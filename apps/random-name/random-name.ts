import { adjectives } from "./adjectives.ts";
import { nouns } from "./nouns.ts";

function getRandomElement(array: string[]) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function getRandomName() {
  const randomAdjective = getRandomElement(adjectives);
  const randomNoun = getRandomElement(nouns);

  return `${randomAdjective}-${randomNoun}`;
}
