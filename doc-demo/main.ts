import dayjs from 'https://esm.sh/dayjs@1.11.3';

/**
 * Format a date as a string.
 * @param {number} time
 * @returns {number} Formatted date string
 */
export const formatDate = (time: number) =>
    dayjs(time).format('YYYY | MM-DD | HH:mm:ss | SSS | A');

console.log(formatDate(Date.now()));
