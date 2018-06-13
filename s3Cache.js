const path = require('path')
const moment = require('moment')
const S3 = require('aws-sdk').S3

const defaultOptions = {
	expiry: false,
	expiryUnits: 'hours',
	acl: 'private',
	contentType: 'text/html;charset=UTF-8',
	pathPrefix: '',
}

class S3Cache {
	constructor(options = {}) {
		this.options = Object.assign({}, defaultOptions, options)

		const validateOption = param => {
			if( !(param in this.options) || !this.options[param] ) {
				throw new Error(`Did not get required parameter: ${param} in constructor`)
			}
		}

		validateOption('accessKey')
		validateOption('secretKey')
		validateOption('bucket')

		this.s3 = new S3({
			accessKeyId: this.options.accessKey,
			secretAccessKey: this.options.secretKey,
			params: {
				Bucket: this.options.bucket,
			},
		})
	}

	getPath(pathName) {
		return path.join(this.options.pathPrefix, pathName)
	}

	get(key, callback) {
		this.s3.getObject({
			Key: this.getPath(key),
		}, callback)
	}

	set(key, value, callback) {
		const requestOptions = {
			Key: this.getPath(key),
			ACL: this.options.acl,
			ContentType: this.options.contentType,
			Body: value,
		}

		if( this.options.expiry ) {
			requestOptions.Expires = moment().add(this.options.expiry, this.options.expiryUnits).unix()
			if( this.options.debug ) {
				console.log('Putting object expires at ' + requestOptions.Expires)
			}
		}

		const request = this.s3.putObject(requestOptions, callback)

		if(!callback) {
			request.send()
		}
	}
}

module.exports = S3Cache
