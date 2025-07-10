// src/types/nearest-neighbor.d.ts
declare module 'nearest-neighbor' {
  /**
   * Given an array of vectors and a query vector,
   * returns the indexes of the k nearest vectors.
   */
  function nearest(
    corpus: number[][],
    query: number[],
    k: number
  ): number[];
  export default nearest;
}
