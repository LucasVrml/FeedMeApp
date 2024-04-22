export function levenshtein(a: string, b: string): number {
  const cost: number[] = [];

  // Initialize the cost array
  for (let i = 0; i <= a.length; i++) {
    cost[i] = i;
  }

  for (let j = 1; j <= b.length; j++) {
    let prevCost = cost[0];
    cost[0] = j;

    for (let i = 1; i <= a.length; i++) {
      let currentCost = cost[i];

      if (a[i - 1] === b[j - 1]) {
        cost[i] = prevCost;
      } else {
        cost[i] = Math.min(
          prevCost + 1, // Substitution
          Math.min(
            cost[i - 1] + 1, // Insertion
            currentCost + 1 // Deletion
          )
        );
      }

      prevCost = currentCost;
    }
  }

  return cost[a.length];
}

export function findMostSimilarString(input: string, list: string[]): string {
  let minDistance = Infinity;
  let mostSimilarString = "";

  for (const str of list) {
    const distance = levenshtein(input, str);
    if (distance < minDistance) {
      minDistance = distance;
      mostSimilarString = str;
    }
  }

  return mostSimilarString;
}
