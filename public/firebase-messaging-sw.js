importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// We need the config, but we can't easily import json from public.
// Wait, we can fetch it or hardcode. Actually, we just need messagingSenderId, projectId, appId, apiKey.
// The applet environment serves everything from root, so we can fetch /firebase-applet-config.json.

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/firebase-applet-config.json')
      .then((res) => res.json())
      .then((config) => {
        firebase.initializeApp(config);
        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
          console.log('[firebase-messaging-sw.js] Received background message ', payload);
          const notificationTitle = payload.notification?.title || 'Notification';
          const notificationOptions = {
            body: payload.notification?.body,
            icon: '/favicon.ico',
          };
          self.registration.showNotification(notificationTitle, notificationOptions);
        });
      })
      .catch((err) => console.error('Failed to init FCM in SW', err))
  );
});
