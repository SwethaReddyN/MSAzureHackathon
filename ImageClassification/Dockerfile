FROM resin/rpi-raspbian:stretch-20180626

COPY . /app

RUN apt-get update &&  apt-get install -y \
        python3 python3-pip libatlas-base-dev libjpeg-dev libopenjp2-7 \
        libtiff5 python3-dev wget python3-setuptools

RUN pip3 install wheel 
RUN pip3 install pillow numpy flask

RUN pip3 install tensorflow

# Expose the port
EXPOSE 8888

# Set the working directory
WORKDIR /app

# Run the flask server for the endpoints
CMD python3 app.py
