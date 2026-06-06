export function isEmpty(obj: any): boolean {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

/**
 * Coerce a value read from storage into a real array.
 *
 * Block / restriction / white lists are persisted as arrays, but older
 * builds (and some storage round-trips) can hand them back as plain objects
 * keyed by index. Calling array methods like `.filter` / `.push` on those
 * throws "x.filter is not a function" — so normalise everything on read.
 */
export function asArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'object') return Object.values(value) as T[];
  return [];
}

export function isDomainEquals(first: string, second: string) {
  if (first === second) return true;
  else {
    var resultUrl = function (url: string) {
      if (url.indexOf('www.') > -1) return url.split('www.')[1];
      return url;
    };

    if (resultUrl(first) === resultUrl(second)) return true;
    else return false;
  }
}

export function getPercentage(time: number, totalTime: number) {
  return ((time / totalTime) * 100).toFixed(2);
}
