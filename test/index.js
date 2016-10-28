#!/usr/bin/env node

const duration = require('./duration')
const stopCap = require('./stop-capture')
const fs = require('fs-extra')

fs.mkdirSync('./tmp')

duration()
	.then(stopCap)
	.then(() => {
		console.log('ALL TESTS PASSED!')
		fs.remove('./tmp/')
	})
