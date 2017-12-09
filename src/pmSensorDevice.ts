import * as Noble from "noble";
import * as NobleBase from "noble_base";
import * as Smartblocks from "ble-smartblocks";

export class PmSensorDevice extends NobleBase.Base {
	public readonly pthService: Smartblocks.PTHService = new Smartblocks.PTHService(this);
	public readonly pmSensorService: Smartblocks.PmSensorService = new Smartblocks.PmSensorService(this);

	protected async onConnectAndSetupDone() {
		try {
			await this.pthService.subscribeAll();
			await this.pmSensorService.subscribeAll();

		} catch (error) {
			console.log(error);
		}
	}
	is(peripheral: Noble.Peripheral): boolean {
		return (peripheral.advertisement.manufacturerData[0] == 0xAC &&
			peripheral.advertisement.manufacturerData[1] == 0x03 &&
			peripheral.advertisement.manufacturerData[2] == 0xD9);
	}
}