import * as Mqtt from "mqtt";

export class MqttHelper {

	public readonly mqttClient : Mqtt.MqttClient;
	private isMqttConnected: boolean=false;

	private readonly telemetryTopic:string="v1/gateway/telemetry";
	private readonly attributeTopic:string="v1/gateway/attributes";
	private readonly connectTopic:string="v1/gateway/connect";
	private readonly disconnectTopic:string="v1/gateway/disconnect";

	private deviceIdPrefix="";

	public get IsMqttConnnected():boolean { 
		return this.isMqttConnected;
	}

	public constructor(serverAddress: string, authToken:string, deviceIdPrefix:string="") {
		this.deviceIdPrefix=deviceIdPrefix;

		this.mqttClient=Mqtt.connect('mqtt://'+serverAddress,{
			username: authToken
		});

		this.mqttClient.on("connect", ()=>{
			console.log("Connected to MQTT server");
			this.isMqttConnected=true;
		});

		this.mqttClient.on("disconnect", ()=>{
			console.log("Disconnected from MQTT server");
			this.isMqttConnected=false;
		});
	}

	public sendDeviceConnect(deviceId:string)
	{
		this.mqttClient.publish(this.connectTopic, '{"device":"'+this.deviceIdPrefix+deviceId+'"}');
	}

	public sendDeviceDisconnect(deviceId:string)
	{
		this.mqttClient.publish(this.disconnectTopic, '{"device":"'+this.deviceIdPrefix+deviceId+'"}');
	}

	public sendTelemetry(deviceId:string, data:{[index: string]: number})
	{
		const msgHead='{ "'+this.deviceIdPrefix+deviceId+'": [ { "ts":'+Date.now()+', "values":';
		const msgTail='}]}';

		const msg=msgHead+JSON.stringify(data)+msgTail;
		this.mqttClient.publish(this.telemetryTopic, msg);

	}

	public sendAttribute(deviceId:string, parameterName:string, value:string)
	{
		const msg='{'+this.deviceIdPrefix+deviceId+':{"'+parameterName+'":"'+value+'"}}';
		this.mqttClient.publish(this.attributeTopic, msg);
	}
}
