
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
				// reject(`child process exited with code ${code}`)
			// }
		})
		
	})}
	
	startCapture(opts){ return new Promise((resolve, reject) => {
		console.log('startCapture')
		// ffmpeg -t 60 -f avfoundation -i "2:0" -r 6.0 -f image2 tmp/image%04d.jpg

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
			opts.output
		])

		// console.log(args)
		var ffmpegProcess = spawn(ffmpegPath, args)
		this.captureProc = ffmpegProcess // cache so we can kill later
		ffmpegProcess.stderr.on('data', err => {
			console.error(`stderr: ${err}`)
		})
		ffmpegProcess.stdout.on('data', data => {
			// console.log(`stdout: ${data}`)
		})
		ffmpegProcess.on('close', code => {
			// console.log(`child process exited with code ${code}`)
			if(code === 0){
				resolve(opts.output)
			}else{
				reject(code)
			}
		})
		ffmpegProcess.on('error', err => {
			reject('Failed to start capture.')
		})
	})}
	
	/*
		kill the process
		return a promise. reject if there's nothing to kill	
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

		var args = [
			'-i', opts.input,
			'-pix_fmt', 'yuv422p',
			opts.output
		]
		var ffmpegProcess = spawn(ffmpegPath, args)
		ffmpegProcess.stderr.on('data', err => {
			console.error(`stderr: ${err}`)
		})
		ffmpegProcess.stdout.on('data', data => {
			// console.log(`stdout: ${data}`)
		})
		ffmpegProcess.on('close', (code) => {
			// console.log(`child process exited with code ${code}`)
			if(code === 0){
				resolve()
			}else{
				reject(code)
			}
		})
		ffmpegProcess.on('error', (err) => {
			reject('Failed to encode video.')
		})
	})}

}

/*

ffmpeg -f avfoundation -list_devices true -i ""

Record 60 second timelapse

ffmpeg -t 60 -f avfoundation -i "2:0" -r 6.0 -f image2 tmp/image%04d.jpg

Encode video

ffmpeg -i tmp/image%04d.jpg -pix_fmt yuv422p out.mp4

http://lukemiller.org/index.php/2014/10/ffmpeg-time-lapse-notes/

*/

module.exports = Captor