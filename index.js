const S3Cache = require('./s3Cache')
const cacheManager = require('cache-manager')

class S3CacheManager {
	constructor(options = {}) {
		this.s3Cache = new S3Cache(options)
		this.cache = cacheManager.caching({store: this.s3Cache})
		if( options.debug ) {
			this.debug = true
		}
	}

	log(message) {
		if( this.debug ) {
			console.log(message)
		}
	}

	getCacheFormattedKey(path) {
		const sanitizedKey = path.replace(/[:/\\`~!@#$%^&*()[\]{}|;'",?<>]/g, '-')
		if( !sanitizedKey.endsWith('.html') ) {
			return sanitizedKey + '.html'
		}
		return sanitizedKey
	}

	returnFromCacheIfAvailable(req, res, next) {
		if(req.method !== 'GET') {
			return next()
		}

		const cacheKey = this.getCacheFormattedKey(req.prerender.url)

		this.cache.get(cacheKey, (error, result) => {
			if(error && error.message !== 'The specified key does not exist.' ) {
				console.error('S3 Cache Error:', error.message, cacheKey)
			} else if( result ) {
				this.log('S3 Cache Hit: ', cacheKey)
				res.send(200, result.Body)
				return
			}
			this.log('S3 Cache Miss:')
			next()
		})
	}

	saveToCache(req, res, next) {
		const cacheKey = this.getCacheFormattedKey(req.prerender.url)

		let content
		if( 'documentHTML' in req.prerender ) {
			content = req.prerender.documentHTML
		} else {
			content = req.prerender.content
		}

		// Should I avoid setting the cache with the same content?
		// I've noticed that if a request is a hit, req.prerender.requestSent is true

		this.cache.set(cacheKey, content, (error, result) => {
			if(error) {
				console.error('S3 Cache Error on Saving:', error, cacheKey)
			} else {
				this.log('S3 Cache Saved:', cacheKey)
			}
		})

		next()
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

module.exports = S3CacheManager
