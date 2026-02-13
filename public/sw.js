/**
 * Service Worker for PWA push notifications
 */

// eslint-disable-next-line no-undef
self.addEventListener('push', function onPush(event) {
  const data = event.data ? event.data.json() : {}

  const title = data.title || 'メッセンジャー'
  const options = {
    body: data.body || 'メッセージが届きました',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || '/m',
    },
  }

  event.waitUntil(
    // eslint-disable-next-line no-undef, no-restricted-globals
    self.registration.showNotification(title, options)
  )
})

// eslint-disable-next-line no-undef
self.addEventListener('notificationclick', function onClick(event) {
  event.notification.close()

  const url = event.notification.data?.url || '/m'

  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function matchClients(windowClients) {
        for (const client of windowClients) {
          if (client.url.includes('/m') && 'focus' in client) {
            return client.focus()
          }
        }
        // eslint-disable-next-line no-undef
        return clients.openWindow(url)
      })
  )
})
