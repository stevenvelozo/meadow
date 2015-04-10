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

		// The scope for this broker.
		var _Scope = (typeof(pScope) === 'string') ? pScope : 'Unknown';

		/* The container object JsonSchema
		 * http://json-schema.org/examples.html
		 * http://json-schema.org/latest/json-schema-core.html
		 *
		 * An example:
			{
				"$schema": "http://json-schema.org/draft-04/schema#",
				"title": "Product",
				"description": "A product from Acme's catalog",
				"type": "object",
				"properties": {
					"id": {
						"description": "The unique identifier for a product",
						"type": "integer"
					},
					"name": {
						"description": "Name of the product",
						"type": "string"
					},
					"price": {
						"type": "number",
						"minimum": 0,
						"exclusiveMinimum": true
					},
					"tags": {
						"type": "array",
						"items": {
							"type": "string"
						},
						"minItems": 1,
						"uniqueItems": true
					}
				},
				"required": ["id", "name", "price"]
			}
		*/
		var _Schema = (typeof(pSchema) === 'object') ? pSchema : (
			{
				title: _Scope,
				type: 'object',
				required: []
			});




		/**
		* Container Object for our Factory Pattern
		*/
		var tmpNewMeadowObject = (
		{
			new: createNew
		});



		/**
		 * Universally Unique Identifier
		 *
		 * @property uuid
		 * @type string
		 */
		Object.defineProperty(tmpNewMeadowObject, 'scope',
			{
				get: function() { return _UUID; },
				enumerable: true
			});



		return tmpNewMeadowObject;
	}

	return createNew();
};

module.exports = Meadow();
