/***
 * 'SmartBin' module detects an event and captures images, sends the
 * image to Image Processing module. Compares the results with configuration 
 * and if a contaminant is present then forwards it to 'IoTClient' module.
 * Sends event details to azure function
 */
 
'use strict';

var GrovePiBoard = require('./grove.js');
var BinInfo = require('./bin_info.js');
var FileSystem = require("fs");
var IO = require('socket.io-client');
var ContaminantsInfo = require('./contaminants_info.js'); 

global.currentEvents = [];

GrovePiBoard.initializeBoard();
BinInfo.setupBin();

var socket = IO('http://127.0.0.1:8090');

global.iotClient = socket;

//receive desired properties
socket.on('desiredproperties', function(data) {
	
	//set bin width
	if(data.binWidth)
		GrovePiBoard.setThreshold(data.binWidth - 5);
	//set bin type
	if(data.binType)
		BinInfo.setBinType(data.binType);
});

//receive violation image url
socket.on('violationInfo', function(data) {
	
	BinInfo.updateViolationInfo(BinInfo.getBinId(), data.url, data.blobName);
	BinInfo.cleanupEventDetails(data.blobName);
});

//receive configuration/customization
socket.on('configurationInfo', function(data) {
	
	var tags = data.config.split(",");
	console.log("update configuration");
	console.log(tags);
	ContaminantsInfo.setContaminantsList(tags);
});
