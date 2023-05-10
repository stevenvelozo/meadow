/**
* @license MIT
* @author <steven@velozo.com>
*/
/* ^ An Example Meadow Schema Object
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

/* #### A JSONSchema Description
	*
	* http://json-schema.org/examples.html
	*
	* http://json-schema.org/latest/json-schema-core.html
	*/
/* ^ An Example JSONSchema Object:
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

var libValidator = require('is-my-json-valid');

/**
* @class MeadowSchema
*/
class MeadowSchema
{
	constructor(pOriginalJsonSchema, pOriginalSchema)
	{
		this.schema = false;
		this.jsonSchema = false;

		this.defaultObject = false;

		// Default to everything being invalid
		this.validateFunction = ()=>{ return false; };

		this.setSchema(pOriginalSchema);
		this.setJsonSchema(pOriginalJsonSchema);

		this.setDefault();
	}

	/*
	* Set the Meadow schema
	*
	* Our schemas are really instructions for *what* to do *when*.  We track:
	*   - Column
	*   - Type _(e.g. AutoIdentity, AutoGUID, CreateDate, CreateIDUser, UpdateDate, UpdateIDUser, DeleteDate, Deleted, DeleteIDUser)_
	*   - Optionally Special Instractions
	*
	*/
	setSchema(pSchema)
	{
		this.schema = (typeof(pSchema) === 'object') ? pSchema : (
		{
			title: 'Unknown',
			type: 'object',
			required: []
		});
	};

	setJsonSchema(pJsonSchema)
	{
		this.jsonSchema = (typeof(pJsonSchema) === 'object') ? pJsonSchema : (
		{
			title: 'Unknown',
			type: 'object',
			required: []
		});
		this.validateFunction = libValidator(jsonSchema, { greedy:true, verbose:true });
	};

	setDefault(pDefaultObject)
	{
		this.defaultObject = (typeof(pDefaultObject) === 'object') ? pDefaultObject : {};
	};

	validateObject(pObject)
	{
		var tmpValidation = { Valid:this.validateFunction(pObject) };

		// Stuff the errors in if it is invalid
		// TODO: Research if there is a more modern way to do this that is less thread unsafe seeming
		if (!tmpValidation.Valid)
		{
			tmpValidation.Errors = this.validateFunction.errors;
		}

		return tmpValidation;
	};
}

module.exports = MeadowSchema;