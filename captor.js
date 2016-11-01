
const EventEmitter = require('events')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const spawn = require('child_process').spawn
const _ = require('lodash')

class Captor extends EventEmitter {

	constructor(){
		super()
	}

	listDevices(){ return new Promise((resolve, reject) => {

		var results = ''

		//TODO: add support for windows, linux
		// https://trac.ffmpeg.org/wiki/Capture/Desktop
		
		var proc = spawn('ffmpeg', [
			'-f', 'avfoundation',
			'-list_devices', 'true',
			'-i', '""'
		])
		proc.stderr.on('data', data => {
			// console.error(`stderr: ${data}`)
			results += data
		})
		proc.stdout.on('data', data => {
			// console.log(`stdout: ${data}`)
			// results += data
		})
		proc.on('error', (err) => {
			reject('Failed to list devices.')
		})
		proc.on('close', code => {
			// console.log(`child process exited with code ${code}`)
			// if(code === 0){
				// console.log('===========================')
				// console.log(results)
				// console.log('===========================')
				var videoInputIndex = 0
				var output = {}
				var split = results.split('] [')
				split = split.slice(1)

				split = split.map(str => {
					return str.split('\n[')[0].split('] ')
				})
				// console.log(split)
				split.map(kvp => {
					var key = parseInt(kvp[0])
					var val = kvp[1]
					console.log(key, val)

					if(key >= videoInputIndex){
						videoInputIndex = key
						output[key] = val
					}else{
						// quit loop. don't need audio devices
						videoInputIndex = 99999999
					}

				})
				resolve(output)
			// }else{
				// FIXME: I'm seeing exit codes that suggest an error, but the device list comes back just fine.
				// try uninstalling soundflower
				// reject(`child process exited with code ${code}`)
			// }
		})
		
	})}
	
	capture(opts){ return new Promise((resolve, reject) => {

		opts = _.defaults(opts, {
			duration: undefined,
			videoDevice: 0,
			fps: 6,
			output: 'image%04d.jpg'
		})

		var args = []
		if(opts.duration) {
			args.push(`-t`,`${opts.duration}`)
		}

		//TODO: add support for windows, linux
		// https://trac.ffmpeg.org/wiki/Capture/Desktop

		args = args.concat([
			`-f`,`avfoundation`, 
			`-i`,`${opts.videoDevice}:0`,
			`-r`,`${opts.fps}`,
			`-f`,`image2`,
		])

		// passed in from screenshot
		if(opts.vframes) {
			args.push('-vframes')
			args.push('1')
		}

		args.push(opts.output)

		// console.log(args)
		var proc = spawn(ffmpegPath, args)
		this.captureProc = proc // cache so we can kill later
		proc.stderr.on('data', err => {
			console.error(`stderr: ${err}`)
		})
		proc.stdout.on('data', data => {
			// console.log(`stdout: ${data}`)
		})
		proc.on('close', code => {
			// console.log(`child process exited with code ${code}`)
			if(code === 0){
				resolve(opts.output)
			}else{
				reject(code)
			}
		})
		proc.on('error', err => {
			reject('Failed to start capture.')
		})
	})}
	
	/*
		kill the capture process.
		useful for stopping a capture that has undefined duration, or cancelling any capture.
		return a promise. rejects if there's nothing to kill	
	*/ 
	stopCapture(){ return new Promise((resolve, reject) => {

		if(this.captureProc){
			this.captureProc.on('close', code => {
				delete this.captureProc
				resolve(code)
			})
			this.captureProc.kill()
		}else{
			reject('There is no capture process to stop.')
		}
		
		delete this.captureProc
	})}
	
	encodeVideo(opts){ return new Promise((resolve, reject) => {

		opts = _.defaults(opts, {
			input: 'image%04d.jpg',
			output: 'out.mp4'
		})

		//TODO: probably need to test this on other OSs. maybe omit pix_fmt?
		var args = [
			'-i', opts.input,
			'-pix_fmt', 'yuv422p',
			opts.output
		]
		var proc = spawn(ffmpegPath, args)
		proc.stderr.on('data', err => {
			console.error(`stderr: ${err}`)
		})
		proc.stdout.on('data', data => {
			// console.log(`stdout: ${data}`)
		})
		proc.on('close', (code) => {
			// console.log(`child process exited with code ${code}`)
			if(code === 0){
				resolve(opts.output)
			}else{
				reject(code)
			}
		})
		proc.on('error', (err) => {
			reject('Failed to encode video.')
		})
	})}

	/*
		screenshot({
			videoDevice: int
			output: path
		})
	*/
	screenshot(opts){ 
		var options = {
			videoDevice: 0,
			output: `screenshot_${Date.now()}.jpg`,
			fps: 1,
			duration: 0,
			'vframes': 1
		}
		options.videoDevice = opts.videoDevice || options.videoDevice
		options.output = opts.output || options.output
		return this.startCapture(options)
	}
}

module.exports = Captor