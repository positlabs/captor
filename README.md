# Captor

ffmpeg screen capture utility for nodejs.

npm install --save captor

```javascript

	const Captor = require('captor')
	const captor = new Captor()

	// get a list of available capture devices

	captor.listDevices().then(deviceList => {
		
		// match a device name
		var deviceIndex = -1
		Object.keys(deviceList).forEach(index => {
			if(deviceList[index] === 'Capture screen 0'){
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

		// run screen capture for 10s, capturing 6 frames per second

		var imagesPath = `./tmp/image_${Date.now()}_%04d.jpg`
		return captor.startCapture({
			videoDevice: deviceIndex,
			output: imagesPath,
			duration: 10,
			fps: 6
		})

	}).then(imagesPath => {

		// pass the frames onto the video encoder

		return captor.encodeVideo({
			input: imagesPath,
			output: `out_${Date.now()}.mp4`
		})

	}).then(e => {

		// console.log('RECORDING COMPLETE!!')

	}).catch(e => { console.error('ERROR CODE:', e) })
```

