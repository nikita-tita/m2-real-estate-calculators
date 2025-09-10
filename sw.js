// Service Worker для М2 Калькуляторов недвижимости
// Обеспечивает оффлайн работу и кеширование ресурсов

const CACHE_NAME = 'm2-calculators-v1.2.0';
const OFFLINE_URL = '/offline.html';

// Ресурсы для кеширования
const CACHE_URLS = [
  '/',
  '/index.html',
  '/mortgage_calculator.html',
  '/affordability_calculator.html', 
  '/rental_profitability_calculator.html',
  '/rent_vs_buy_calculator.html',
  '/airbnb_calculator.html',
  '/new_vs_secondary_calculator.html',
  '/tooltip-system.js',
  '/calculator-storage.js',
  '/manifest.json',
  OFFLINE_URL
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('SW: Установка Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Кеширование основных ресурсов');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('SW: Ресурсы закешированы успешно');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Ошибка при кешировании:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('SW: Активация Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Удаляем старые версии кеша
              return cacheName.startsWith('m2-calculators-') && cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              console.log('SW: Удаление старого кеша:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('SW: Service Worker активирован');
        return self.clients.claim();
      })
  );
});

// Обработка запросов (fetch)
self.addEventListener('fetch', event => {
  // Игнорируем запросы к внешним ресурсам
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Стратегия Cache First для HTML файлов
  if (event.request.destination === 'document') {
    event.respondWith(handleDocumentRequest(event.request));
    return;
  }

  // Стратегия Network First для API и динамических данных
  if (event.request.url.includes('/api/') || event.request.url.includes('?')) {
    event.respondWith(handleNetworkFirstRequest(event.request));
    return;
  }

  // Стратегия Cache First для статических ресурсов
  event.respondWith(handleCacheFirstRequest(event.request));
});

// Обработка запросов документов
async function handleDocumentRequest(request) {
  try {
    // Сначала пробуем сеть
    const networkResponse = await fetch(request);
    
    // Если получили ответ, кешируем его
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Сеть недоступна, ищем в кеше');
  }

  // Если сеть недоступна, ищем в кеше
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Если ничего не найдено, показываем оффлайн страницу
  const offlineResponse = await caches.match(OFFLINE_URL);
  return offlineResponse || new Response('Страница недоступна в оффлайн режиме', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// Стратегия Network First
async function handleNetworkFirstRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Кешируем успешные ответы
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Сеть недоступна, ищем в кеше');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Данные недоступны в оффлайн режиме', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Стратегия Cache First
async function handleCacheFirstRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Если ресурс в кеше, возвращаем его и обновляем в фоне
    updateCacheInBackground(request);
    return cachedResponse;
  }

  // Если не в кеше, загружаем из сети
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Ресурс недоступен:', request.url);
    return new Response('Ресурс недоступен', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Фоновое обновление кеша
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('SW: Кеш обновлен для:', request.url);
    }
  } catch (error) {
    // Игнорируем ошибки фонового обновления
    console.log('SW: Не удалось обновить кеш для:', request.url);
  }
}

// Обработка сообщений от клиента
self.addEventListener('message', event => {
  console.log('SW: Получено сообщение:', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({
          type: 'VERSION',
          version: CACHE_NAME
        });
        break;
        
      case 'CLEAR_CACHE':
        clearCache().then(() => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: true
          });
        });
        break;
        
      case 'UPDATE_CACHE':
        updateCache().then(() => {
          event.ports[0].postMessage({
            type: 'CACHE_UPDATED', 
            success: true
          });
        });
        break;
    }
  }
});

// Очистка кеша
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(cacheName => cacheName.startsWith('m2-calculators-'))
      .map(cacheName => caches.delete(cacheName))
  );
  console.log('SW: Кеш очищен');
}

// Обновление кеша
async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  
  // Обновляем основные ресурсы
  try {
    await cache.addAll(CACHE_URLS);
    console.log('SW: Кеш обновлен');
  } catch (error) {
    console.error('SW: Ошибка при обновлении кеша:', error);
  }
}

// Обработка push уведомлений (для будущего расширения)
self.addEventListener('push', event => {
  console.log('SW: Получено push уведомление');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Новое уведомление от М2 Калькуляторов',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Открыть',
          icon: '/icons/action-open.png'
        },
        {
          action: 'close',
          title: 'Закрыть',
          icon: '/icons/action-close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'М2 Калькуляторы', 
        options
      )
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  console.log('SW: Клик по уведомлению');
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Обработка синхронизации в фоне
self.addEventListener('sync', event => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Фоновая синхронизация
async function doBackgroundSync() {
  try {
    // Здесь можно добавить логику синхронизации данных
    console.log('SW: Выполняется фоновая синхронизация');
    
    // Обновляем кеш
    await updateCache();
    
    console.log('SW: Фоновая синхронизация завершена');
  } catch (error) {
    console.error('SW: Ошибка при фоновой синхронизации:', error);
  }
}