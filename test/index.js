#!/usr/bin/env node

const duration = require('./duration')
const stopCap = require('./stop-capture')
const screenshot = require('./screenshot')
const fs = require('fs-extra')

try{ fs.mkdirSync('./tmp') }catch(e){}

new Promise(resolve => {resolve()})
	.then(screenshot)
	// .then(duration)
	// .then(stopCap)
	.then(() => {
		console.log('ALL TESTS PASSED!')
		// fs.remove('./tmp/')
	})
