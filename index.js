class PrerenderCacheManager {
	constructor(inputCache) {
		this.cache = inputCache

		// Track cache hits, so that we don't set on a hit.
		// Prerender provides the saveToCache with a new res object, so we can't use props on that.
		this.cacheHitsInFlight = {}
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
				this.cacheHitsInFlight[cacheKey] = true
				res.send(200, result)
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

		if( cacheKey in this.cacheHitsInFlight && this.cacheHitsInFlight[cacheKey] ) {
			delete this.cacheHitsInFlight[cacheKey]
			next()
			return
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
