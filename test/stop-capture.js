#!/usr/bin/env node

module.exports = function(){

	const Captor = require('../captor')
	const captor = new Captor()
	const videoDeviceName = 'Capture screen 0'

	var p = captor.listDevices().then(deviceList => {
		// console.log(deviceList)
		
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

		// stop capture after 5s
		setTimeout(() => {captor.stopCapture()}, 5000)

		var imagesPath = `./tmp/image_${Date.now()}_%04d.jpg`
		return captor.startCapture({
			videoDevice: deviceIndex,
			output: imagesPath,
		})

	}).then(imagesPath => {

		return captor.encodeVideo({
			input: imagesPath,
			output: `out_${Date.now()}.mp4`
		})

	}).then(e => {

		// console.log('RECORDING COMPLETE!!')

	}).catch(e => { console.error('ERROR CODE:', e) })

	return p
}
