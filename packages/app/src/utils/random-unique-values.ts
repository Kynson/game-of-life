export default function getRandomUniqueValues(
  min: number,
  max: number,
  numberOfValues: number,
) {
  // All checks are only needed during development
  if (import.meta.env.DEV && max < min) {
    throw new Error(`invalid range ${max.toString()}-${min.toString()}`);
  }

  if (import.meta.env.DEV && max - min + 1 < numberOfValues) {
    throw new Error(
      `the provided range ${min.toString()}-${max.toString()} is too narrow to generate ${numberOfValues.toString()} unique values`,
    );
  }

  const result = new Set<number>();

  while (result.size < numberOfValues) {
    const randomValue = Math.floor(Math.random() * (max - min)) + min;
    result.add(randomValue);
  }

  return result;
}
