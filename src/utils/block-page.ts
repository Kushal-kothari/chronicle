export enum BlockParams {
  Domain = 'domain',
  URL = 'url',
  LimitTime = 'summaryTime',
  SummaryCounter = 'summaryCounter',
  Favicon = 'favicon',
  Mode = 'mode',
}

/** How the block page was reached. */
export type BlockMode = 'limit' | 'blocked';

export function buildBlockQuery(
  domain: string,
  url: string,
  limitTime: number,
  summaryCounter: number,
  favicon: string,
  mode: BlockMode = 'limit',
) {
  return `?domain=${domain}&url=${url}&summaryTime=${limitTime}&summaryCounter=${summaryCounter}&favicon=${favicon}&mode=${mode}`;
}

export function getValueFromQuery(url: string) {
  const urlObj = new URL(url);
  const domain = urlObj.searchParams.get(BlockParams.Domain);
  const sourceUrl = urlObj.searchParams.get(BlockParams.URL);
  const favicon = urlObj.searchParams.get(BlockParams.Favicon);
  const limitTime = Number(urlObj.searchParams.get(BlockParams.LimitTime));
  const summaryCounter = Number(urlObj.searchParams.get(BlockParams.SummaryCounter));
  const mode = (urlObj.searchParams.get(BlockParams.Mode) as BlockMode) ?? 'limit';

  return {
    domain: domain,
    url: sourceUrl,
    limitTime: limitTime,
    summaryCounter: summaryCounter,
    favicon: favicon,
    mode: mode,
  };
}
