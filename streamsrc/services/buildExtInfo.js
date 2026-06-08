import {Dimensions, PixelRatio, Platform, NativeModules} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';

const getLocale = () => {
  try {
    const locales = RNLocalize.getLocales();

    if (locales.length > 0) {
      const {languageCode, countryCode} = locales[0];

      if (languageCode && countryCode) {
        return `${languageCode}_${countryCode}`;
      }
    }

    return 'en_US';
  } catch (e) {
    return 'en_US';
  }
};

const getTimezoneAbbrFallback = () => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    }).formatToParts(new Date());

    const tz = parts.find(part => part.type === 'timeZoneName')?.value || '';
    return tz;
  } catch (e) {
    return '';
  }
};

const bytesToGbInt = bytes => {
  if (!bytes || Number.isNaN(bytes)) return 0;
  return Math.round(bytes / 1024 / 1024 / 1024);
};

export const buildExtInfo = async () => {
  const {width, height} = Dimensions.get('screen');

  const bundleId = DeviceInfo.getBundleId();
  const version = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const osVersion = DeviceInfo.getSystemVersion();
  const model = DeviceInfo.getModel();

  const locale = getLocale();

  const carrier = await DeviceInfo.getCarrier();
  const totalDisk = await DeviceInfo.getTotalDiskCapacity();
  const freeDisk = await DeviceInfo.getFreeDiskStorage();

  const cores =
    typeof DeviceInfo.getNumberOfCores === 'function'
      ? DeviceInfo.getNumberOfCores()
      : '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const timezoneAbbr = getTimezoneAbbrFallback();

  const extInfo = [
    Platform.OS === 'ios' ? 'i2' : 'a2', // 0 version / platform type
    bundleId, // 1 bundle id /com.lcatlaceland.cerimertyvn
    version, // 2 short version /1.1
    buildNumber, // 3 long version /6
    osVersion, // 4 os version /18.0
    model, // 5 device model /iPhone 15 Pro Max
    locale, // 6 locale /en_US
    timezoneAbbr, // 7 timezone abbr /GMT
    carrier || '', // 8 carrier /ччч
    Math.round(width), // 9 screen width /430
    Math.round(height), // 10 screen height /932
    String(PixelRatio.get()), // 11 screen density /3
    cores, // 12 CPU cores /0
    bytesToGbInt(Number(totalDisk)), // 13 storage total /460
    bytesToGbInt(Number(freeDisk)), // 14 storage free /56
    timezone, // 15 device timezone. /Europe/Kiev
  ];

  return extInfo;
};

export default buildExtInfo;
