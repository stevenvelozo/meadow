/**
* Meadow Data Broker Library
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/

/**
* Meadow Data Broker Library
*
* @class Meadow
* @constructor
*/
var Meadow = function()
{
	function createNew(pFable, pScope, pSchema)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pFable) !== 'object') || (!pFable.hasOwnProperty('fable')))
		{
			return {new: createNew};
		}
		var _Fable = pFable;
		// Make sure there is a valid data broker set
		_Fable.settingsManager.fill({FableDefaultBroker:'None'});

		// The scope of this broker.
		var _Scope = (typeof(pScope) === 'string') ? pScope : 'Unknown';

		// The schema for this broker
		var _Schema = require('./Meadow-Schema.js').new(pSchema);

		// The data provider
		var _Provider = false;

		// The default identifier for this broker.
		// This is what is used for the automated endpoint queries
		// For example the 198 in GET http://myapi.com/Widget/198
		//
		// Our development model prefers IDWidget as the column name for the default identifier.
		var _DefaultIdentifier = 'ID'+_Scope;


		/**
		* Set the scope to be something else
		*
		* @method setScope
		* @return {Object} Returns a cloned Meadow.  This is chainable.
		*/
		var setScope = function(pScope)
		{
			_Scope = pScope;
			return this;
		};


		/**
		* Set the schema to be something else
		*
		* @method setSchema
		* @return {Object} Returns a cloned Meadow.  This is chainable.
		*/
		var setSchema = function(pSchema)
		{
			_Schema.setSchema(pSchema);
			return this;
		};


		/**
		* Container Object for our Factory Pattern
		*/
		var tmpNewMeadowObject = (
		{
			setScope: setScope,

			// Schema management functions
			setSchema: setSchema,
			validateObject: _Schema.validateObject,

			// Factory
			new: createNew
		});


		/**
		 * Entity Scope -- usually the name of the entity it represents
		 *
		 * @property scope
		 * @type string
		 */
		Object.defineProperty(tmpNewMeadowObject, 'scope',
			{
				get: function() { return _Scope; },
				enumerable: true
			});


		/**
		 * Entity Schema
		 *
		 * @property schema
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'schema',
			{
				get: function() { return _Schema.schema; },
				enumerable: true
			});

		return tmpNewMeadowObject;
	}

	return createNew();
};

module.exports = new Meadow();
