// import some dependencies like polyfills, etc...
// require('@webcomponents/webcomponentsjs');
// require('@webcomponents/webcomponentsjs/custom-elements-es5-adapter');
require("babel-polyfill");
require('webcomponents.js/webcomponents-lite');
// import cssua from 'cssuseragent';
require('fastclick');

// main application entry point
require('./webcomponent-import');
require('./webcomponent-props');
require('./main');


import __jquery from 'jquery'
import __axios from 'axios'
import __config from './config'
import __bodymovin from 'bodymovin'

/*if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js', {scope:'/'})
	.then(function(reg) {
		// registration worked
		console.log('Registration succeeded. Scope is ' + reg.scope);
	}).catch(function(error) {
		// registration failed
		console.log('Registration failed with ' + error);
	});
}*/

(() => {

	// [].forEach.call(document.querySelectorAll('.grid__item'), (gridItem) => {

	// });

/*	[].forEach.call(document.querySelectorAll('.grid__item-logo'), (itemLogo) => {
		var animData = {
	        wrapper: itemLogo,
	        animType: 'svg',
	        loop: false,
	        prerender: true,
	        autoplay: false,
	        path: 'mosaic_anim.json'
	    }
	    var anim = __bodymovin.loadAnimation(animData)
		itemLogo._bodywin = anim
	});*/

	// get refs
	const refs = {};
	[].forEach.call(document.querySelectorAll('[ref]'), (item) => {
		refs[item.getAttribute('ref')] = item
	})

	// ensure we are on grid 1 on startup
	setTimeout(() => {
		document.location.hash = ''
		// load the app first
		fetchGifs().then((result) => {
			// start app
			document.location.hash = 'grid1'
		});
	});

	// list the pages
	let pages = [
		'grid1',
		'video1',
		'grid2',
		'video2',
		'grid3',
		'video3'
	];

	let pageChangeTimeout = null

	// mobile detection
	let gifs = [];

	// get the wall
	function fetchGifs(lastCode = 0) {

		/*https://dev.lets-meet.ch/api/wall?code=*/

		const request = __jquery.get( "https://api.lets-meet.it/api/wall?code="+lastCode, function( result ) {
			// save the new datas
			gifs = [].concat(result.data, gifs);
			// interval before loading again new gifs
			setTimeout(() => {
				fetchGifs(gifs[0].code)
			}, __config.newGifsFetchInterval);
		});

		return request;
	}

	function getNextPage() {
		const currentPageIdx = pages.indexOf(document.location.hash.substr(1))
		if (currentPageIdx + 1 >= pages.length) {
			return pages[0]
		} else {
			return pages[currentPageIdx + 1]
		}
	}

	// go to next page
	function nextPage() {
			// go to new page
		document.location.hash = getNextPage()
	}

	window.addEventListener('hashchange', (e) => {

		// stop if no hash
		if ( ! document.location.hash) return;

		// get page from url
		const page = document.location.hash.substr(1)

		// listen when page is loaded
		const pageElm = refs[page]

		// clear page change timeout
		clearTimeout(pageChangeTimeout)

		// if page is a grid
		if (page.substr(0,4) === 'grid') {
			// populate new grid
			populateGrid(refs[page]).then(() => {
				pageChangeTimeout = setTimeout(() => {
					nextPage()
				}, __config.gifsPageDisplayTime)
			})
			/*const logo = refs[page].querySelector('.grid__item-logo');
			if (logo && logo._bodywin) {
				logo._bodywin.goToAndStop(1, false)
				setTimeout(() => {
					logo._bodywin.play()
				}, Math.random() * 2000)
			}*/
		} else {
			const videoElm = pageElm.querySelector('video')
			if (videoElm) {
				videoElm.currentTime = 0;
				videoElm.play()
				pageChangeTimeout = setTimeout(() => {
					nextPage()
				}, 7000)
			} else {
				nextPage()
			}
		}
	})

	// populate grid
	function populateGrid(gridElm) {

		return new Promise((resolve, reject) => {

			if ( ! gifs.length) {
				resolve();
				return;
			}

			// loop on each grid childs
			let loadedImages = 0;
			const files = [];
			const forcedIdxElms = gridElm.querySelectorAll('[gif-idx]');
			const forcedGifsCount = forcedIdxElms.length || 0;
			const usedGifsIdx = [];

			[].forEach.call(gridElm.children, (gridItemElm, index) => {

				if (gridItemElm.classList.contains('grid__item-logo')) return;

				// clear previous image
				gridItemElm.innerHTML = '';

				// get next gif to display
				let gifObjToDisplay;

				if (gridItemElm.hasAttribute('gif-idx')) {
				 	const gifIdx = parseInt(gridItemElm.getAttribute('gif-idx'));
					if (gifs[gifIdx]) {
						gifObjToDisplay = gifs[gifIdx];
					} else {
						gifObjToDisplay = gifs[0];
					}
				} else {
					let idx;
					if (gifs.length <= 10) {
						idx = Math.round(Math.random() * (gifs.length - 1));
					} else {
						let found = false;
						while( ! found) {
							idx = Math.round(Math.random() * (gifs.length - 1 - forcedGifsCount)) + forcedGifsCount;
							if (usedGifsIdx.indexOf(idx) === -1) {
								found = true;
								usedGifsIdx.push(idx);
							}
						}
					}
					gifObjToDisplay = gifs[idx];
				}

				// const gifObjToDisplay = getNextGifObjToDisplay();

				if ( ! gifObjToDisplay) return;

				((gifObjToDisplay, gridItemElm, index) => {

					function displayImg(url) {

						// preload image
						const image = new Image();
						image.addEventListener('load', (e) => {

							setTimeout(() => {
								const imgElm = document.createElement('img');
								imgElm.addEventListener('load', (e) => {
									setTimeout(() => {
										imgElm.classList.add('loaded')
									}, 50);
								});
								imgElm.setAttribute('src', gifObjToDisplay.url);
								gridItemElm.appendChild(imgElm);

								for(let i=0; i<25; i++) {
									const pxElm = document.createElement('div');
									pxElm.classList.add('pixel');
									gridItemElm.appendChild(pxElm);
								}

							}, Math.random() * __config.gifsDisplayRandomTimeout);

							// resolve promise
							resolve()
						})
						image.addEventListener('error', (e) => {
							// resolve promise
							resolve()
						})
						image.src = url
					}
					displayImg(gifObjToDisplay.url)

				})(gifObjToDisplay, gridItemElm, index);
			})
		})
	}
})();
