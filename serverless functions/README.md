# Please Note: The functions interact with SQL Database and IoT hub. 

## The Password to connect to database and SharedAccessKey of Connectionstring is not shared,if you want access to them, 

## please email me to richajain44@gmail.com



This ReadMe file gives a brief intro on the 7 functions used in the App and also gives a qucik tutorial on creating necessary resources

for them to function.



This folder contains 7 Azure Serverless Functions. Below is the snapshot of all functionalities of each of them



1. smartbincreation - This function is invoked when Raspberry Pi is installed in the Bin for the first time.

The function saves bin detials to the Azure SQL Database. Bin details -BinId, BinLatitute,BinLongitude, BinType



2. smartbintransactions - This function is triggered whenever there is violation detected at the Bin(Raspberry Pi).

The function saves the bin transactions detials to the Azure SQL Database. 

Transactions details - BinId, Violation Type, Timestamp, ImageURL of the violation



3. smartconfiguration - This function is triggered whenever the entire system is installed for the first time. 

The admin can set what is recyclable in his/her division. The parameters are saved to Azure SQL Database as well as passed 

as message to Azure Service Bus Queue.



4. smartqueuetrigger - This function is triggered when a new message is present in the Service Bus Queue. 

The message is passed to the IoT hub and then delivered to the IoT Edge devices. These are then set to identify the violation



5. smartwebapp - This function is triggered when the WebApp is used. It displays all the Bin on the Web Map.



6. smartwebbindetials - This function is triggered when a particular Bin on the WebMap is accessed. It displays the specific

BinType and analytics of different type of violatins that occured.



7. smartimageurl - This function is triggered when a particular Bin on the WebApp is accessed. 

It dispalys the latest violation image for that Bin.



Creating Azure Serverless Functions.  To create Azure Serverless Functions please follow below instructions:

1. Login to Azure Protal

2. Click on Create Resource

3. Click on Serverless Function App

4. Add details like appname, subscription, resource group, OS, Hosting plan(I used Application plan),location,storage (I didnt create any

new storage for any function and used already exisitng sotrage)

5. CLick on create

6. After the function is deployed, click on it and add Functions. I created HTTP Triggered and IoT Service Bus Queue Triggered functions

7. You can select either exisitng template or create a new one by using appropriate language.



Below is the link to the tutorial that I used:

https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function



These functions interact with Azure SQL Database. To create a database, please follow below instructions:

1. Login to Azure protal

2. Click on Create Resource -> SQL Database

3. Add Databasename (for this setup database name is -bindb, SQL server userName is smartwasteadmin, SQL server name is smartwastebin.database.windows.net),

subscription-free tier, resource group-smartwastebin (used across all the functions, database, IoT hub)

4. Under server- > configure details with serverName, password, subscription, resource group, location. Click on select which will create SQL server\

5. Choose appripritate storage and click apply

6. Click on 'CREATE' to create the database



Below is the link to the tutorial for creation of SQL Database which I referred: 

https://docs.microsoft.com/en-us/azure/sql-database/sql-database-get-started-portal



The function smartqueuetrigger interacts with Azure IoT Hub. Below is the instruction to create IoT Hub:

1. Login to Azure Portal

2. Click on Create Resource -> Internet of Things -> IoT Hub

3. Add details of subscription, resource group, region, IoTHub Name. 

I used free tier, smartwastebin, West US 2, smartconfigurationdetails respectively.

4. Select appropriate Scale and Size option. Click on Review and Create.

5. Click on Create. The IoT Hub is created. 

The function uses connection string found in IoTHub (here configurationdetails -> Shared Access Policies ->iothubowner) to connect to IoThub



Below is the link to the tutorial :

https://docs.microsoft.com/en-us/azure/iot-hub/quickstart-send-telemetry-node
