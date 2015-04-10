/**
* Meadow Schema Module
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow-Schema
*/

/**
* Meadow Schema Library
*
* @class MeadowSchema
* @constructor
*/
var libValidator = require('is-my-json-valid');

var MeadowSchema = function()
{
	function createNew(pOriginalSchema)
	{
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
		var _Schema = false;
		var _Validate = false;


		/**
		* Set the schema to be something else after the object is created.
		*
		* @method setSchema
		*/
		var setSchema = function(pSchema)
		{
			_Schema = (typeof(pSchema) === 'object') ? pSchema : (
			{
				title: 'Unknown',
				type: 'object',
				required: []
			});
			_Validate = libValidator(_Schema, { greedy:true, verbose:true });
		};
		setSchema(pOriginalSchema);


		/**
		* Validate an object against the current schema
		*
		* @method setSchema
		*/
		var validateObject = function(pObject)
		{
			var tmpValidation = { Valid:_Validate(pObject) };

			// Stuff the errors in if it is invalid
			if (!tmpValidation.Valid)
			{
				tmpValidation.Errors = _Validate.errors;
			}

			return tmpValidation;
		};


		var tmpNewMeadowSchemaObject = (
		{
			setSchema: setSchema,
			validateObject: validateObject,

			new: createNew
		});

		/**
		 * Schema
		 *
		 * @property schema
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowSchemaObject, 'schema',
			{
				get: function() { return _Schema; },
				enumerable: true
			});


		return tmpNewMeadowSchemaObject;
	}

	return createNew();
};

module.exports = new MeadowSchema();
