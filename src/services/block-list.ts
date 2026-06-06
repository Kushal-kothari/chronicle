import { StorageParams } from '../storage/storage-params';
import { asArray, isDomainEquals } from '../utils/common';
import { extractHostname } from '../utils/url';
import { Settings } from './settings';

export async function isInBlackList(url: string): Promise<boolean> {
  const blackList = await Settings.getInstance().getSetting(StorageParams.BLACK_LIST);
  const array = asArray<string>(blackList);
  return array.find(x => isDomainEquals(extractHostname(x), extractHostname(url))) !== undefined;
}
