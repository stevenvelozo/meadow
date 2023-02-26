/**
* Simple browser shim loader - assign the npm module to a window global automatically
*
* @license MIT
* @author <steven@velozo.com>
*/
var libNPMModuleWrapper = require('./Meadow.js');

if ((typeof(window) === 'object') && !window.hasOwnProperty('Meadow'))
{
	window.Meadow = libNPMModuleWrapper;
}

module.exports = libNPMModuleWrapper;