// this.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open('any-time-wall-static').then(function(cache) {
//       return cache.addAll([
//     	// '/index.html',
// 		// '/dist/css/style.css',
// 		// '/dist/js/app.js'
// 		// '/videos/1917-1.mov',
// 		// '/videos/1917-2.mov',
// 		// '/videos/1917-3.mov',
// 		// '/videos/2117-1.mov',
// 		// '/videos/2117-2.mov',
// 		// '/videos/2117-3.mov',
// 		// '/mosaic_anim.json'
//       ]);
//     })
//   );
// });

this.addEventListener('fetch', (event) => {
  let request = event.request;

  	// if (request.method === 'GET' && /https?:\/\/(dev\.)?api(-dev)?\..*\/images\/.*\.gif/.test(request.url)) {
	if (request.method === 'GET') {
		event.respondWith(
			caches.open('lets-meet-wall').then((cache) => {
				return cache.match(request).then((response) => {
					if (response) {
						return response;
					}

					return new Promise((resolve) => {
						var fetchRequest = fetch(request)
						fetchRequest.then((response) => {
							cache.put(request, response.clone());
							resolve(response);
						});
						fetchRequest.catch((error) => {
							return cache.keys().then((keys) => {

								const randomCachedRequest = keys[Math.round(Math.random()*(keys.length-1))];
								if ( ! randomCachedRequest) {
									resolve(new Response('', {
										status: 408,
										statusText: 'Request timed out.'
									}));
								}
								return cache.match(randomCachedRequest.url).then((response) => {
									if (response) resolve(response);
								})
					  		});
						});
					});
				})
			})
		)
		return
	}
	// else if (request.method === 'GET' && !/https?:\/\/(dev\.)?api\./.test(request.url)) {
	// 	event.respondWith(
	// 		caches.open('any-time-wall-static').then((cache) => {
	// 			return cache.match(request).then((response) => {
	// 				if (response) return response;
	// 				return fetch(request).then((response) => {
	// 					return response;
	// 				});
	// 			})
	// 		})
	// 	)
	// 	return
	// }
	else {
		event.respondWith(
			fetch(request)
		);
	}
});
