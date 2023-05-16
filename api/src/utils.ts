export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomlyReplaceArrayElements<T>(array: T[]): T[] {
  const newArray: T[] = [...array];

  for (let i = 0; i < newArray.length; i++) {
    const randomIndex = Math.floor(Math.random() * newArray.length);
    const temp = newArray[i];
    newArray[i] = newArray[randomIndex];
    newArray[randomIndex] = temp;
  }

  return newArray;
}
