FROM resin/rpi-raspbian:stretch-20180626

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	make g++ python-pip python-setuptools 
	
RUN apt-get install -y --no-install-recommends libraspberrypi-bin net-tools
	
RUN curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash
RUN apt-get install nodejs
	
RUN pip install wheel
RUN pip install picamera

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8090
EXPOSE 8888

CMD ["node", "app.js"]
