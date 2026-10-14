import { Alert, Platform } from 'react-native';

// React Native Web's Alert.alert is a complete no-op (see
// react-native-web/src/exports/Alert/index.js — an empty static method), so
// every confirm/notify dialog needs a web fallback or it silently does
// nothing when running in the web preview.

export function confirmAsync({ title, message, confirmLabel, cancelLabel }) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm([title, message].filter(Boolean).join('\n')));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export function notify(message, title) {
  if (Platform.OS === 'web') {
    window.alert([title, message].filter(Boolean).join('\n'));
    return;
  }

  Alert.alert(title ?? '', message);
}
