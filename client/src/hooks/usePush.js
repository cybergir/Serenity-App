import { useEffect, useState } from 'react'
import api from '../services/api'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePush() {
  const [permission, setPermission] = useState(Notification.permission)
  const [subscribed, setSubscribed] = useState(false)

  const VAPID_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEeBkwex1sNKU8oT05WIV-itfGCEUsQUXE8f20Gin5jmEoE4OrtlCkAuCy4qHx7s4qeJoad7gaUXccP6-wKMHnWg'

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setSubscribed(!!subscription)
        })
      })
    }
  }, [])

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported on this device.')
      return
    }

    const perm = await Notification.requestPermission()
    setPermission(perm)

    if (perm !== 'granted') {
      alert('Notifications were denied. You can enable them in your browser settings.')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        })
      }

      await api.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth
        }
      })

      setSubscribed(true)
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }

  const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await api.post('/push/unsubscribe', {
        endpoint: subscription.endpoint,
        keys: {}
      })
      await subscription.unsubscribe()
      setSubscribed(false)
    }
  }

  return { permission, subscribed, subscribe, unsubscribe }
}