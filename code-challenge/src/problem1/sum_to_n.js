'use strict';

/**
 * Way 1
 * Straightforward iterative approach that works for positive and negative n.
 */
const sum_to_n_way1 = function (n) {
    let total = 0;
    const step = n >= 1 ? 1 : -1;

    for (let i = 1; step > 0 ? i <= n : i >= n; i += step) {
        total += i;
    }

    return total;
};

/**
 * Way 2
 * Uses the arithmetic series formula. Handles negative n by leveraging the same formula.
 */
const sum_to_n_way2 = function (n) {
    return (n * (n + 1)) / 2;
};

/**
 * Way 3
 * Recursively sums numbers while memoizing intermediate results to avoid repeated work.
 * This provides a distinct approach emphasizing recursion.
 */
const memo = {};
const sum_to_n_way3 = function (n) {
    if (n === 0) {
        return 0;
    }

    if (memo[n] !== undefined) {
        return memo[n];
    }

    const result = n > 0 ? n + sum_to_n_way3(n - 1) : n + sum_to_n_way3(n + 1);
    memo[n] = result;
    return result;
};

module.exports = {
    sum_to_n_way1,
    sum_to_n_way2,
    sum_to_n_way3
};

