import * as Noble from "noble";
import * as NobleBase from "noble_base";
import * as Smartblocks from "ble-smartblocks";
import { PmSensorDevice } from "./pmSensorDevice";
import { MqttHelper } from "./mqttHelper";

const mqttHelper=new MqttHelper("demo.thingsboard.io","kV55Mtc4JoiZBkrdThEd","PMSensor_");

const scanHelper = new NobleBase.ScanHelper<PmSensorDevice>(PmSensorDevice, async (device) => {

	console.log("Discovered device: " + device.getDeviceId());

	device.pthService.on("temperature", (data) => {
		console.log(device.getDeviceId() + " temperature: " + data.toString() + " Centigrade");
		mqttHelper.sendTelemetry(device.getDeviceId(),{"temperature": data});
	});

	device.pthService.on("humidity", (data) => {
		console.log(device.getDeviceId() + " humidity: " + data.toString() + "% Rh");
		mqttHelper.sendTelemetry(device.getDeviceId(),{"humidity": data});
	});

	device.pthService.on("pressure", (data) => {
		console.log(device.getDeviceId() + " pressure: " + data.toString() + " Pa");
		mqttHelper.sendTelemetry(device.getDeviceId(),{"pressure": data});
	});

	device.pmSensorService.on("pm25", (data) => {
		console.log(device.getDeviceId() + " pm25: " + data.toString() + " ppm");
		mqttHelper.sendTelemetry(device.getDeviceId(),{"pm25": data});
	});

	device.pmSensorService.on("pm10", (data) => {
		console.log(device.getDeviceId() + " pm10: " + data.toString() + " ppm");
		mqttHelper.sendTelemetry(device.getDeviceId(),{"pm10": data});
	});

	device.on("disconnect",()=>{
		console.log("BLE connection lost!");
		mqttHelper.sendAttribute(device.getDeviceId(),"state","disconnected");
		mqttHelper.sendDeviceDisconnect(device.getDeviceId());
	});

	mqttHelper.sendDeviceConnect(device.getDeviceId());
	mqttHelper.sendAttribute(device.getDeviceId(),"state","connected");
	


	let temperature = await device.pthService.readTemperature();
	let pressure = await device.pthService.readPressure();
	let humidity = await device.pthService.readHumidity();

	console.log(device.getDeviceId() + " initial values: T: " + temperature + "C P: " + pressure + " Pa H: " + humidity + "%Rh");

	let pm25 = await device.pmSensorService.readPm25();
	let pm10 = await device.pmSensorService.readPm10();

	console.log(device.getDeviceId() + " initial values: PM2.5: " + pm25 + " ppm PM10: " + pm10 + " ppm");

	mqttHelper.sendTelemetry(device.getDeviceId(),{
		"temperature": temperature,
		"pressure": pressure,
		"humidity": humidity,
		"pm25":pm25,
		"pm10":pm10
	});
});

mqttHelper.mqttClient.on("connect", ()=>{
	scanHelper.discoverAll();
});

mqttHelper.mqttClient.on("error",(error)=>{
	console.log("Mqtt server error: "+error.message);
});

