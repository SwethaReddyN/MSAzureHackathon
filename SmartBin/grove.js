/***
 * Process results results from 'ImageProcessing' module. 
 */
 
'use strict';

var GrovePi = require('node-grovepi').GrovePi
var execute = require('child_process').exec;
var DetectViolation = require('./detect_objects.js');
var FileSystem = require("fs");
var BinInfo = require('./bin_info.js');
var SmartBin = require('./smart_bin.js');

// put ultrasonic in port D3 
var ultrasonic_ranger = new GrovePi.sensors.UltrasonicDigital(3);
var board;
var distanceThreshold = 30;
var bufMaxSize = 32768;

var ContaminantsInfo = require('./contaminants_info.js'); 
 
var GrovePiBoard = {
	
	ultrasonic_ranger:ultrasonic_ranger,
	board: board,
	distanceThreshold: distanceThreshold,
	bufMaxSize: bufMaxSize,
		
	initializeBoard: function() {
	
		board = new GrovePi.board({
			debug: true,
		
			onError: function(err) {
				console.log('GROVE ERROR' + err);
			},
      
			onInit: function(res) { 
				console.log("GrovePi init complete");
			}
		})

		board.init();
		setInterval(function() {
			var distance = ultrasonic_ranger.read();
			if(typeof distance === "number" && distance < distanceThreshold) {
				console.log("Event detected: " + distance + " (distance)");
				var fileName = BinInfo.createNewImageFileName();
				var child = execute("python ./python/get_photo.py " + fileName, 
					{encoding: "binary", maxBuffer: 10000000}, function(error, stdout, stderr) {
					
					if(error != null) {
						
						console.log("error while taking the picture");
						FileSystem.unlink("pic_" + error.toString(
						).split("pic_")[1].split(".jpg")[0] + ".jpg", function (err) {
										if(err)
											throw err;
						});
						
					} else {
							
						fileName = stdout.trim();
						currentEvents[fileName] = [];
						currentEvents[fileName]["timestamp"] = BinInfo.getCurrentTimeStamp();
						DetectViolation.isContaminantPresent(fileName, BinInfo.getBinType(),
							function(contaminants) {
								//handle a violation event
								if(contaminants && contaminants.length > 0) {
									
									currentEvents[fileName]["violations"] = contaminants;
									SmartBin.uploadViolationImage(fileName, function(isComplete) {
										if(isComplete)
											SmartBin.deleteViolationImage(fileName);
									});
								} else {
									console.log("no violations");
									BinInfo.cleanupEventDetails(fileName);
									SmartBin.deleteViolationImage(fileName);
								}
							}
						);
					}
				});
			}
				
		}, 400);
		//setInterval(toggle, 100);
	},
	
	//set distance threshold (bin width)	
	setThreshold: function(threshold) {
		
		distanceThreshold = threshold;
		console.log("set binWidth to: " + distanceThreshold);
	}
}

module.exports = GrovePiBoard;
