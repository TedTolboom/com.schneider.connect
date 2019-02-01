'use strict';

const Homey = require('homey');

class SchneiderConnect extends Homey.App {
  onInit() {
    require('inspector').open(9229, '0.0.0.0', false)
    this.log('Schneider Connect is running...');

    // Action Cards
    this.actionStartDimLevelChange = new Homey.FlowCardAction('schneider_dim_startLevelChange')
      .register()
      .registerRunListener(this._actionStartDimLevelChangeRunListener.bind(this));

    this.actionStopDimLevelChange = new Homey.FlowCardAction('schneider_dim_stopLevelChange')
      .register()
      .registerRunListener(this._actionStopDimLevelChangeRunListener.bind(this));

    this.actionStartDimToggleLevelChange = new Homey.FlowCardAction('schneider_dim_startToggleLevelChange')
      .register()
      .registerRunListener(this._actionStartDimToggleLevelChangeRunListener.bind(this));

    // TODO: Remove this? SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE can be used instead? It works.. verify.
    this.actionStopDimToggleLevelChange = new Homey.FlowCardAction('schneider_dim_stopToggleLevelChange')
      .register()
      .registerRunListener(this._actionStopDimToggleStopLevelChangeRunListener.bind(this));
  }

  // Dim Level Change
  async _actionStartDimLevelChangeRunListener(args, state) {
    if (!args.hasOwnProperty('direction')) return Promise.reject('direction_property_missing');
    args.device.log('FlowCardAction triggered for', args.device.getName(), 'to start dim level change. Direction:', args.direction === "0" ? "Increase": "Decrease");

    if (args.device.node.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL) {
      return await args.device.node.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL
        .SWITCH_MULTILEVEL_START_LEVEL_CHANGE(Buffer.from([args.direction === '1' ? 0x60 : 0x20, 0x0]));
    }
    return Promise.reject('unknown_error');
  }

  // Dim Level Change, Stop
  async _actionStopDimLevelChangeRunListener(args, state) {
    args.device.log('FlowCardAction triggered for', args.device.getName(),'to stop dim level change');

    if (args.device.node.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL) {
      return await args.device.node.CommandClass.COMMAND_CLASS_SWITCH_MULTILEVEL
        .SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE({});
    }
    return Promise.reject('unknown_error');
  }

  // Dim Level Change Toggle, Start
  async _actionStartDimToggleLevelChangeRunListener(args, state) {
    // if (!args.hasOwnProperty('roll_over')) return Promise.reject('roll_over_property_missing');
    args.device.log('FlowCardAction triggered for', args.device.getName(),'to start dim toggle level change');

    if (args.device.node.CommandClass.COMMAND_CLASS_SWITCH_TOGGLE_MULTILEVEL) {
      return await args.device.node.CommandClass.COMMAND_CLASS_SWITCH_TOGGLE_MULTILEVEL
      // Always ignores level change. Roll over is user selected in action card.
        .SWITCH_TOGGLE_MULTILEVEL_START_LEVEL_CHANGE(Buffer.from([args.roll_over === "1" ? 0xA0: 0x20]));
    }
    return Promise.reject('unknown_error');
  }

  // Dim Level Change Toggle Up/Down, Stop
  // TODO: Remove?
  async _actionStopDimToggleStopLevelChangeRunListener(args, state) {
    args.device.log('FlowCardAction triggered for', args.device.getName(),'to stop dim toggle level change');

    if (args.device.node.CommandClass.COMMAND_CLASS_SWITCH_TOGGLE_MULTILEVEL) {
      return await args.device.node.CommandClass.COMMAND_CLASS_SWITCH_TOGGLE_MULTILEVEL
        .SWITCH_TOGGLE_MULTILEVEL_STOP_LEVEL_CHANGE({});
    }
    return Promise.reject('unknown_error');
  }

}

module.exports = SchneiderConnect;
