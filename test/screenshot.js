#!/usr/bin/env node

module.exports = function (){

	const Captor = require('../captor')
	const captor = new Captor()
	const videoDeviceName = 'Capture screen 0'

	var p = captor.listDevices().then(deviceList => {
		// match a device name
		var deviceIndex = -1
		Object.keys(deviceList).forEach(index => {
			if(deviceList[index] === videoDeviceName){
				deviceIndex = index
			}
		})

		return new Promise((resolve, reject) => { 
			if(deviceIndex !== -1){
				resolve(deviceIndex)
			}else{
				reject(`${videoDeviceName} not found in deviceList: ${JSON.stringify(deviceList)}`)
			}
		})

	}).then(deviceIndex => {

		return captor.screenshot({
			output: `./tmp/screenshot_${Date.now()}.jpg`,
			videoDevice: deviceIndex,
		})

	}).then(imagePath => {

		console.log('SCREENSHOT COMPLETE!!', imagePath)

	}).catch(e => { console.error('ERROR CODE:', e) })

	return p
}