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
	function createNew(pOriginalJsonSchema, pOriginalSchema)
	{
		// The schema
		/*
		 * An example:
			[
				{ "Column": "IDAnimal", "Type":"AutoIdentity" },
				{ "Column": "GUIDAnimal", "Type":"AutoGUID" },
				{ "Column": "Created", "Type":"CreateDate" },
				{ "Column": "CreatingIDUser", "Type":"CreateIDUser" },
				{ "Column": "Modified", "Type":"UpdateDate" },
				{ "Column": "ModifyingIDUser", "Type":"UpdateIDUser" },
				{ "Column": "Deleted", "Type":"Deleted" },
				{ "Column": "DeletingIDUser", "Type":"DeleteIDUser" },
				{ "Column": "DeleteDate", "Type":"DeleteDate" }
			]
		 */
		var _Schema = false;
		// The JSONSchema spec schema
		/* http://json-schema.org/examples.html
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
		var _JsonSchema = false;
		// The "default" empty object
		var _Default = false;
		// The cached validator
		var _Validate = false;


		/**
		* Set the schema to be something else after the object is created.
		*
		* Our schemas are really instructions for what to do when.  We track:
		*   - Column
		*   - Type (e.g. AutoIdentity, AutoGUID, CreateDate, CreateIDUser, UpdateDate, UpdateIDUser, DeleteDate, Deleted, DeleteIDUser)
		*   - Optionally Special Instractions
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
		};
		setSchema(pOriginalSchema);

		/**
		* Set the json schema to be something else after the object is created.
		*
		* @method setJsonSchema
		*/
		var setJsonSchema = function(pJsonSchema)
		{
			_JsonSchema = (typeof(pJsonSchema) === 'object') ? pJsonSchema : (
			{
				title: 'Unknown',
				type: 'object',
				required: []
			});
			_Validate = libValidator(_JsonSchema, { greedy:true, verbose:true });
		};
		setJsonSchema(pOriginalJsonSchema);

		var setDefault = function(pDefault)
		{
			_Default = (typeof(pDefault) === 'object') ? pDefault : {};
		};
		setDefault();

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
			setJsonSchema: setJsonSchema,
			setDefault: setDefault,
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


		/**
		 * JsonSchema
		 *
		 * @property jsonSchema
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowSchemaObject, 'jsonSchema',
			{
				get: function() { return _JsonSchema; },
				enumerable: true
			});


		/**
		 * Default Object
		 *
		 * @property defaultObject
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowSchemaObject, 'defaultObject',
			{
				get: function() { return _Default; },
				enumerable: true
			});


		return tmpNewMeadowSchemaObject;
	}

	return createNew();
};

module.exports = new MeadowSchema();
