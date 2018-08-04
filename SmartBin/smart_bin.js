/***
 * module to handle violation image files
 */
 
'use strict';

var FileSystem = require("fs");

var SmartBin = {
	
	uploadViolationImage: function(fileName, callbackFunction) {
		
		FileSystem.readFile(fileName, function(err, buff) {
	
			if(err)
				console.log("error while reading file" + err);
			console.log("uploading violation image file");
			//send file to server
			var buffString = buff.toString('base64');
			iotClient.emit('uploadfile', {fileName: fileName, 
				buffer: buffString, size:buffString.length});
			callbackFunction(true);
		});
	},
	
	deleteViolationImage: function(fileName) {
		
		FileSystem.unlink(fileName, function (err) {
			if(err)
				throw err;
		});
	}
}

module.exports = SmartBin;
