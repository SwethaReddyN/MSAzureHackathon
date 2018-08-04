import os
import sys
import time
import picamera

#from datetime import datetime

fileName = sys.argv[1]

#"pic_" + str(datetime.now()).replace(" ", "") + ".jpg"

pictureFile = open(fileName, "wb");

with picamera.PiCamera() as camera:
	camera.resolution = (1280, 720)
	time.sleep(2)
	camera.exposure_mode = 'night'
	camera.iso = 800
	camera.awb_mode = 'auto'
	camera.capture(pictureFile);
	print fileName

pictureFile.close()
