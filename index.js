class PrerenderCacheManager {
	constructor(inputCache) {
		this.cache = inputCache
	}

	returnFromCacheIfAvailable(req, res, next) {
		if(req.method !== 'GET') {
			return next()
		}

		const cacheKey = req.prerender.url

		this.cache.get(cacheKey, (error, result) => {
			if( error ) {
				console.error('Cache Error:', error.message, cacheKey)
			} else if( result ) {
				res.send(200, result.Body)
				return
			}
			next()
		})
	}

	saveToCache(req, res, next) {
		const cacheKey = req.prerender.url

		let content
		if( 'documentHTML' in req.prerender ) {
			content = req.prerender.documentHTML
		} else {
			content = req.prerender.content
		}

		this.cache.set(cacheKey, content, (error, result) => {
			if(error) {
				console.error('Cache Error on Saving:', error, cacheKey)
			}
			next()
		})
	}

	beforePhantomRequest(req, res, next) {
		return this.returnFromCacheIfAvailable(req, res, next)
	}

	requestReceived(req, res, next) {
		return this.returnFromCacheIfAvailable(req, res, next)
	}

	afterPhantomRequest(req, res, next) {
		return this.saveToCache(req, res, next)
	}

	beforeSend(req, res, next) {
		return this.saveToCache(req, res, next)
	}
}

module.exports = PrerenderCacheManager
