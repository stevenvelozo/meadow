/**
* Meadow Data Broker Library
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/

// We use Underscore.js for utility
var libUnderscore = require('underscore');
// The logger uses Bunyan to write logs
var libLog = require('./Logger.js');
// Each query object gets a UUID, using flake-idgen and biguint-format
var libFlakeIDGen = require('flake-idgen');
var flakeIDGen = new libFlakeIDGen();
var libIntFormat = require('biguint-format')
// TODO: Load parameters for FlakeID generation from a .json config if it exists

// FoxHound is the default query generator
var libFoxHound = require('foxhound');

/**
* Meadow Data Broker Library
*
* @class Meadow
* @constructor
*/
var Meadow = function()
{
	function createNew(pScope, pSchema)
	{
		// A universally unique identifier for this object
		var _UUID = libIntFormat(flakeIDGen.next(), 'hex', { prefix: '0x' });

		// The scope for this broker.  This is the only internal state for this object.
		var _Scope = 'Unknown';

		/**
		* Clone the current FoxHound Query into a new Query object, copying all 
		* parameters as the new default.  Clone also copies the log level.
		*
		* @method createQuery
		* @return {Object} Returns a Query object.  This is chainable.
		*/
		var createQuery = function()
		{
			return libFoxHound.clone().setScope(_Scope);
		}

		/**
		* Container Object for our Factory Pattern
		*/
		var tmpNewMeadowObject = (
		{
			createQuery: createQuery,

			new: createNew
		});



		/**
		 * Scope
		 *
		 * @property scope
		 * @type String
		 */
		Object.defineProperty(tmpNewMeadowObject, 'scope',
			{
				get: function() { return _Scope; },
				set: function(pScope) { _Scope = pScope; },
				enumerable: true
			});



		/**
		 * Universally Unique Identifier
		 *
		 * @property uuid
		 * @type string
		 */
		Object.defineProperty(tmpNewMeadowObject, 'uuid',
			{
				get: function() { return _UUID; },
				enumerable: true
			});



		var __initialize = function ()
		{
			// TODO: Load a json file with any necessary config settings.
		};
		__initialize();

		return tmpNewMeadowObject;
	}

	return createNew();
};

module.exports = Meadow();
