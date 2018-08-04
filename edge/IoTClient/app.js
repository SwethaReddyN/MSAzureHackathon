/***
 * 'IoTClient' module provides a means for recycle.io core to receive
 * messages, twin updates and file upload notification from IoT Hub. It also
 * uploads image files to blob storage
 */

'use strict';

var Message = require('azure-iot-device').Message;
var Transport = require('azure-iot-device-mqtt').Mqtt;
var IoTEdgeClient = require('azure-iot-device').ModuleClient;
var IoTDeviceClient = require('azure-iot-device-mqtt').clientFromConnectionString;
var IoTHubClient = require('azure-iothub').Client;
var FileSystem = require("fs");

var server = require('http').createServer();
var io = require('socket.io')(server);
var FileSystem = require("fs");

var IoTHubConnectionString = process.env.IoTHubConnectionString;
var IoTDeviceConnectionString = process.env.IoTDeviceConnectionString;

var desiredProperties;

//IoT Edge 
IoTEdgeClient.fromEnvironment(Transport, function (err, client) {
	if (err) {
		
		console.log('error:' + err);
	} else {
		
		client.on('error', function (err) {
			console.error(err.message);
		});
		
		//connect to the edge instance
		client.open(function (err) {
			
			if (err) {
				
				console.error('Could not connect: ' + err.message);
			} else { 
				
				//Get twin updates
				client.getTwin(function (err, twin) {
					if(err) {
						console.error('Error getting twin:' + err.message);
					} else {
						twin.on('properties.desired', function(delta) {
							desiredProperties = delta;
						});
					}
				});
			}
		});
	}
});

//Connect to IoT Device instance
var deviceClient = IoTDeviceClient(IoTDeviceConnectionString);
deviceClient.open(function(err) {
	if(err) {
		console.log("error connecting to device" + err.toString());
	} else {
		
		console.log("Iot Device client connected");
		//Recived config message
		deviceClient.on('message', function(msg) {
			var message = (msg.data.toString('utf-8'));
			message = message.replace("Recyclable: ", "");
			Gateway.sendCustomizationInfo(message);
		});
	}
});

//Connect to IoT Hub instance
var hubClient = IoTHubClient.fromConnectionString(IoTHubConnectionString);
hubClient.open(function(err) {
	if(err) {
		console.log('could not connect:' + err.message);
	} 
	else {
		console.log('service client connected');
		//Receive file upload notification from IoT Hub
		hubClient.getFileNotificationReceiver(function 
			receiveFileUploadNotification(err, receiver) {
				
				if(err) {
					console.log("could not get file notification" + err.message);
				} else {
					receiver.on('message', function(msg) {
						
						var message = JSON.parse(msg.data.toString('utf-8'));
						//extract blob name and blob uri from the received message
						var tokens = message.blobName.split("/");
						var blobUri = message.blobUri;
						var binId = tokens[0];
						var blobName = tokens[1];
						console.log("File uploaded: " + blobName);
						Gateway.sendBlobInfo(binId, blobUri, blobName);
					});
				}
			}
		);
	}
});

//When recycle.io is connected
io.on('connection', function(client) {
	
	console.log('Smart Bin connected');
	if(desiredProperties)
		Gateway.updateDesiredProperties(desiredProperties);
	
	//Receive violation image from recycle.io core
	client.on('uploadfile', function(data) {
		
		FileSystem.writeFile(data.fileName, data.buffer, 'base64', function(err) {
			
			if(err)
				console.log("Error" + err);
		}); 
		//read the file
		var fileStream = FileSystem.createReadStream(data.fileName);
		var tokens = data.fileName.split("/");
		var blobName = tokens[tokens.length - 1];
		console.log("Received upload file request");
		//upload file to blob storage
		deviceClient.uploadToBlob(blobName, fileStream, data.size, function(err) {
							
			if(err) {
				console.log('error uploading file' + err.toString());
			} 
			FileSystem.unlink(data.fileName, function (err) {
				if(err)
					throw err;
			});
			fileStream.destroy();
		});
	});
});

server.listen(8090);

var Gateway = {
	
	server: server,
	
	//send desired properties received to core
	updateDesiredProperties: function(properties) {	
		io.emit("desiredproperties", properties);
	},
	
	//send blob name and uri to core
	sendBlobInfo: function(binId, blobUrl, blobName) {
		io.emit("violationInfo", {"binId": binId, "url": blobUrl, "blobName": blobName});
	},
	
	//send config info to core
	sendCustomizationInfo: function(config) {
		io.emit("configurationInfo", {"config": config});
	}
}

module.exports = Gateway;
