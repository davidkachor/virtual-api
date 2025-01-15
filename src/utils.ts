export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(''), ms));
}

export function getRandomIndex(max: number) {
  if (max < 0) return 0;
  return Math.floor(Math.random() * max);
}
