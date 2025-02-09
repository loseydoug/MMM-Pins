/* global Module */

/* Magic Mirror
 * Module: MMM-Pins
 *
 * MIT Licensed.
 */

Module.register('MMM-Pins',{	
	requiresVersion: "2.1.0",
	defaults: {
		pinConfiguration: []		
	},
	soundIndex: 0,
	
	// Override notification handler.
	notificationReceived: function(notification, payload) {
		if(notification === "ALL_MODULES_STARTED"){
			this.sendSocketNotification('PIN_CONFIG', this.config.pinConfiguration)
			let payload = {
				module: this.name,
				path: "pins",
				actions: {}
			};
			for (let index = 0; index < this.config.pinConfiguration.length; ++index) {
				let pinConfig = this.config.pinConfiguration[index];
				payload.actions[pinConfig.notification] = {notification: pinConfig.notification, prettyName: pinConfig.prettyName};
			}
			Log.log(payload.module);
			Log.log(payload.actions);
			this.sendNotification("REGISTER_API", payload);
			return;
		}
		for (let index = 0; index < this.config.pinConfiguration.length; ++index) {
                        let pinConfig = this.config.pinConfiguration[index];
			if(pinConfig.notification === notification){
				this.sendSocketNotification("TOGGLE_PIN", pinConfig.pin);
				if(pinConfig.sound){
					this.sendNotification('PLAY_SOUND', pinConfig.sound);
				}
				break;
			}
		}
	},
	socketNotificationReceived: function(notification, payload) {
		for (let index = 0; index < this.config.pinConfiguration.length; ++index) {
            let pinConfig = {...this.config.pinConfiguration[index]};
            if (!pinConfig.sound) {
            	break;
            }
			if(pinConfig.notification === notification && pinConfig.direction === "in") {
				if (Array.isArray(pinConfig.sound)) {
					const pinConfigSounds = pinConfig.sound;
					pinConfig.sound = pinConfigSounds[this.soundIndex];
					if (payload === 0) {
					    this.soundIndex = this.soundIndex + 1 >= pinConfigSounds.length ? 0 : this.soundIndex + 1;
					}
				}
				if(payload === 0){
					this.sendNotification('PLAY_SOUND', pinConfig);
				} else {
					this.sendNotification('STOP_SOUND', pinConfig);
				}
				break;
			}
		}
	},
	start: function() {
		Log.info('Starting module: ' + this.name);
	}
});
