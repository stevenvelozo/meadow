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
var libAsync = require('async');
var libUnderscore = require('underscore');

// Multi server query generation
var libFoxHound = require('foxhound');

var Meadow = function()
{
	function createNew(pFable, pScope, pJsonSchema, pSchema)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pFable) !== 'object') || (!pFable.hasOwnProperty('fable')))
		{
			return {new: createNew};
		}
		var _Fable = pFable;
		// Make sure there is a valid data broker set
		_Fable.settingsManager.fill({MeadowProvider:'None'});

		var _IDUser = 0;

		// The scope of this broker.
		var _Scope = (typeof(pScope) === 'string') ? pScope : 'Unknown';

		// The schema for this broker
		var _Schema = require('./Meadow-Schema.js').new(pJsonSchema, pSchema);
		// The query for this broker
		var _Query = libFoxHound.new(_Fable).setScope(_Scope);
		// The custom query loader
		var _RawQueries = require('./Meadow-RawQuery.js').new(_Fable);

		// The data provider
		var _Provider = false;
		var _ProviderName = false;

		// The default identifier for this broker.
		// This is what is used for the automated endpoint queries
		// For example the 198 in GET http://myapi.com/Widget/198
		//
		// Our development model prefers IDWidget as the column name for the default identifier.
		var _DefaultIdentifier = 'ID'+_Scope;


		/**
		* Load the schema and metadata from a package file
		*
		* @method loadFromPackage
		* @return {Object} Returns a new Meadow, or false if it failed
		*/
		var loadFromPackage = function(pPackage)
		{
			// Use the package loader to grab the configuration objects and clone a new Meadow.
			var tmpPackage = false;
			try
			{
				tmpPackage = require(pPackage);
			}
			catch(pError)
			{
				_Fable.log.error('Error loading Fable package', {Package:pPackage});
				return false;
			}

			// Spool up a new Meadow object
			var tmpNewMeadow = createNew(_Fable);

			// Safely set the parameters
			if (typeof(tmpPackage.Scope) === 'string')
			{
				tmpNewMeadow.setScope(tmpPackage.Scope);
			}
			if (typeof(tmpPackage.DefaultIdentifier) === 'string')
			{
				tmpNewMeadow.setDefaultIdentifier(tmpPackage.DefaultIdentifier);
			}
			if (Array.isArray(tmpPackage.Schema))
			{
				tmpNewMeadow.setSchema(tmpPackage.Schema);
			}
			if (typeof(tmpPackage.JsonSchema) === 'object')
			{
				tmpNewMeadow.setJsonSchema(tmpPackage.JsonSchema);
			}
			if (typeof(tmpPackage.DefaultObject) === 'object')
			{
				tmpNewMeadow.setDefault(tmpPackage.DefaultObject)
			}

			return tmpNewMeadow;
		}


		/**
		* Set the scope
		*
		* @method setScope
		* @return {Object} Returns the current Meadow for chaining.
		*/
		var setScope = function(pScope)
		{
			_Scope = pScope;
			_Query.setScope(pScope);
			return this;
		};


		/**
		* Set the user ID for inserts and updates
		*
		* @method setIDUser
		* @return {Object} Returns the current Meadow for chaining.
		*/
		var setIDUser = function(pIDUser)
		{
			_IDUser = pIDUser;
			return this;
		};


		/**
		* Set the Provider for Query execution.
		*
		* This function expects a string, case sensitive, which matches the 
		* provider filename
		*
		* @method setProvider
		* @param {String} pProviderName The provider for query generation.
		* @return {Object} Returns the current Meadow for chaining.
		*/
		var setProvider = function(pProviderName)
		{
			if (typeof(pProviderName) !== 'string')
			{
				return setProvider('None');
			}

			var tmpProviderModuleFile = './providers/Meadow-Provider-'+pProviderName+'.js';

			try
			{
				var tmpProviderModule = require(tmpProviderModuleFile).new(_Fable);
				_ProviderName = pProviderName;
				_Provider = tmpProviderModule;
			}
			catch (pError)
			{
				_Fable.log.error({ProviderModuleFile:tmpProviderModuleFile, InvalidProvider:pProviderName, error:pError}, 'Provider not set - require load problem');
				//setProvider('None');
			}

			return this;
		};
		setProvider(_Fable.settings.MeadowProvider);

		/**
		* Set the schema to be something else
		*
		* @method setSchema
		* @return {Object} This is chainable.
		*/
		var setSchema = function(pSchema)
		{
			_Schema.setSchema(pSchema);
			return this;
		};

		/**
		* Set the Jsonschema to be something else
		*
		* @method setJsonSchema
		* @return {Object} This is chainable.
		*/
		var setJsonSchema = function(pJsonSchema)
		{
			_Schema.setJsonSchema(pJsonSchema);
			return this;
		};

		/**
		* Set the default object to be something else
		*
		* @method setDefault
		* @return {Object} This is chainable.
		*/
		var setDefault = function(pDefault)
		{
			_Schema.setDefault(pDefault);
			return this;
		};

		/**
		* Set the default identifier
		*
		* @method setDefaultIdentifier
		* @return {Object} This is chainable.
		*/
		var setDefaultIdentifier = function(pDefaultIdentifier)
		{
			_DefaultIdentifier = pDefaultIdentifier;
			return this;
		}

		/**
		 * Create a record
		 */
		var _CreateBehavior = require('./behaviors/Meadow-Create.js');
		var doCreate = function(pQuery, fCallBack)
		{
			return _CreateBehavior(this, pQuery, fCallBack);
		}

		/**
		 * Read a record
		 */
		var _ReadBehavior = require('./behaviors/Meadow-Read.js');
		var doRead = function(pQuery, fCallBack)
		{
			return _ReadBehavior(this, pQuery, fCallBack);
		}

		/**
		 * Read multiple records
		 */
		var _ReadsBehavior = require('./behaviors/Meadow-Reads.js');
		var doReads = function(pQuery, fCallBack)
		{
			return _ReadsBehavior(this, pQuery, fCallBack);
		}


		/**
		 * Update a record
		 */
		var _UpdateBehavior = require('./behaviors/Meadow-Update.js');
		var doUpdate = function(pQuery, fCallBack)
		{
			return _UpdateBehavior(this, pQuery, fCallBack);
		}


		/**
		 * Delete a record
		 */
		var _DeleteBehavior = require('./behaviors/Meadow-Delete.js');
		var doDelete = function(pQuery, fCallBack)
		{
			return _DeleteBehavior(this, pQuery, fCallBack);
		}

		/**
		 * Count multiple records
		 */
		var _CountBehavior = require('./behaviors/Meadow-Count.js');
		var doCount = function(pQuery, fCallBack)
		{
			return _CountBehavior(this, pQuery, fCallBack);
		}

		/**
		 * Take the stored representation of our object and stuff the proper values 
		 * into our record, translating where necessary.
		 */
		var marshalRecordFromSourceToObject = function(pRecord)
		{
			// Create an object from the default schema object
			var tmpNewObject = libUnderscore.extend({}, _Schema.defaultObject);
			// Now marshal the values from pRecord into tmpNewObject, based on schema
			_Provider.marshalRecordFromSourceToObject(tmpNewObject, pRecord, _Schema.schema);
			// This turns on magical validation
			//_Fable.log.trace('Validation', {Value:tmpNewObject, Validation:_Schema.validateObject(tmpNewObject)})
			return tmpNewObject;
		}

		/**
		* Container Object for our Factory Pattern
		*/
		var tmpNewMeadowObject = (
		{
			doCreate: doCreate,
			doRead: doRead,
			doReads: doReads,
			doUpdate: doUpdate,
			doDelete: doDelete,
			doCount: doCount,

			validateObject: _Schema.validateObject,
			marshalRecordFromSourceToObject: marshalRecordFromSourceToObject,

			setProvider: setProvider,
			setIDUser: setIDUser,

			loadFromPackage: loadFromPackage,
			setScope: setScope,
			setSchema: setSchema,
			setJsonSchema: setJsonSchema,
			setDefault: setDefault,
			setDefaultIdentifier: setDefaultIdentifier,

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

		/**
		 * Entity Schema
		 *
		 * @property schema
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'schemaFull',
			{
				get: function() { return _Schema; },
				enumerable: true
			});

		/**
		 * Default Identifier
		 *
		 * @property schema
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'defaultIdentifier',
			{
				get: function() { return _DefaultIdentifier; },
				enumerable: true
			});

		/**
		 * Json Schema
		 *
		 * @property schema
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'jsonSchema',
			{
				get: function() { return _Schema.jsonSchema; },
				enumerable: true
			});

		/**
		 * User Identifier
		 *
		 * Used to stamp user identity into Create/Update operations.
		 *
		 * @property userIdentifier
		 * @type string
		 */
		Object.defineProperty(tmpNewMeadowObject, 'userIdentifier',
			{
				get: function() { return _IDUser; },
				enumerable: true
			});

		/**
		 * Query (FoxHound) object
		 *
		 * This always returns a cloned query, so it's safe to get queries with a simple:
		 *   var tmpQuery = libSomeFableObject.query;
		 *
		 * and not expect leakage of basic (cap, begin, filter, dataelements) cloned values.
		 *
		 * @property query
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'query',
			{
				get: function()
						{
							var tmpQuery = _Query.clone();
							// Set the default schema
							tmpQuery.query.schema = _Schema.schema;
							return tmpQuery;
						},
				enumerable: true
			});

		/**
		 * Raw Queries
		 *
		 * @property rawQueries
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'rawQueries',
			{
				get: function()
						{
							return _RawQueries;
						},
				enumerable: true
			});

		/**
		 * Provider
		 *
		 * @property provider
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'provider',
			{
				get: function() { return _Provider; },
				enumerable: true
			});

		/**
		 * Provider Name
		 *
		 * @property providerName
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'providerName',
			{
				get: function() { return _ProviderName; },
				enumerable: true
			});

		_Fable.addServices(tmpNewMeadowObject);

		return tmpNewMeadowObject;
	}

	return createNew();
};

module.exports = new Meadow();
