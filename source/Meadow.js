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
var libUnderscore = require('underscore')

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
		 * Create a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 *
		 * TODO: Add a second behavior that creates records without returning them and takes an array of records.
		 */
		var doCreate = function(pQuery, fCallBack)
		{
			libAsync.waterfall(
				[
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						pQuery.query.IDUser = _IDUser;
						// Make sure the user submitted a record
						if (!pQuery.query.records)
						{
							return fStageComplete('No record submitted', pQuery, false);
						}
						// Merge in the default record with the passed-in record for completeness
						pQuery.query.records[0] = libUnderscore.extend(_Schema.defaultObject, pQuery.query.records[0]);
						// This odd lambda is to use the async waterfall without spilling logic into the provider create code 
						_Provider.Create(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (pQuery.parameters.result.value === false)
						{
							// The value is not set (it should be set to the value for our DefaultIdentifier)
							return fStageComplete('Creation failed', pQuery, false);
						}
						var tmpIDRecord = pQuery.result.value;
						fStageComplete(pQuery.result.error, pQuery, tmpIDRecord);
					},
					// Step 3: Read the record
					function (pQuery, pIDRecord, fStageComplete)
					{
						var tmpQueryRead = pQuery.clone().addFilter(_DefaultIdentifier, pIDRecord);
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
					},
					// Step 4: Marshal the record into a POJO
					function (pQuery, pQueryRead, fStageComplete)
					{
						if (pQueryRead.parameters.result.value.length < 1)
						{
							// There is not at least one record returned
							return fStageComplete('No record found after create.', pQuery, pQueryRead, false);
						}

						var tmpRecord = marshalRecordFromSourceToObject(pQueryRead.result.value[0]);
						fStageComplete(pQuery.result.error, pQuery, pQueryRead, tmpRecord);
					}
				],
				function(pError, pQuery, pQueryRead, pRecord)
				{
					if (pError)
					{
						_Fable.log.warn('Error during the create waterfall', {Error:pError, Query: pQuery.query});
					}
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pQuery, pQueryRead, pRecord);
				}
			);

			return this;
		}

		/**
		 * Read a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doRead = function(pQuery, fCallBack)
		{
			// Read the record from the source
			libAsync.waterfall(
				[
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code 
						_Provider.Read(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (pQuery.parameters.result.value.length < 1)
						{
							// The value is not an array
							return fStageComplete(false, pQuery, false);
						}

						var tmpRecord = marshalRecordFromSourceToObject(pQuery.result.value[0]);
						fStageComplete(pQuery.result.error, pQuery, tmpRecord);
					}
				],
				function(pError, pQuery, pRecord)
				{
					if (pError)
					{
						_Fable.log.warn('Error during the read waterfall', {Error:pError, Query: pQuery.query});
					}
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pQuery, pRecord);
				}
			);

			return this;
		}

		/**
		 * Read many records asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doReads = function(pQuery, fCallBack)
		{
			// Read the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Get a record from the data source
					function (fStageComplete)
					{
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code 
						_Provider.Read(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
					},
					// Step 2: Marshal all the records into a POJO asynchronously
					function (pQuery, fStageComplete)
					{
						var tmpRecords = [];

						libAsync.each
						(
							pQuery.parameters.result.value,
							function(pRow, pQueueCallback)
							{
								tmpRecords.push(marshalRecordFromSourceToObject(pRow));
								pQueueCallback();
							},
							function()
							{
								// Now complete the waterfall
								fStageComplete(pQuery.result.error, pQuery, tmpRecords);
							}
						);
					}
				],
				function(pError, pQuery, pRecords)
				{
					if (pError)
					{
						_Fable.log.warn('Error during the read multiple waterfall', {Error:pError, Query: pQuery.query});
					}
					fCallBack(pError, pQuery, pRecords);
				}
			);

			return this;
		}


		/**
		 * Update a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doUpdate = function(pQuery, fCallBack)
		{
			// Update the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Update the record
					function (fStageComplete)
					{
						pQuery.query.IDUser = _IDUser;
						// Make sure the user submitted a record
						if (!pQuery.query.records)
						{
							return fStageComplete('No record submitted', pQuery, false);
						}
						// Make sure there is a default identifier
						if (!pQuery.query.records[0].hasOwnProperty(_DefaultIdentifier))
						{
							return fStageComplete('Automated update missing default identifier', pQuery, false);
						}

						// Now see if there is anything in the schema that is an Update action that isn't in this query
						for (var i = 0; i < _Schema.schema.length; i++)
						{
							switch (_Schema.schema[i].Type)
							{
								case 'UpdateIDUser':
								case 'UpdateDate':
									pQuery.query.records[0][_Schema.schema[i].Column] = false;
									break;
							}
						}
						// Set the update filter
						pQuery.addFilter(_DefaultIdentifier, pQuery.query.records[0][_DefaultIdentifier]);
						// Sanity check on update
						if ((pQuery.parameters.filter === false) || (pQuery.parameters.filter.length < 1))
						{
							return fStageComplete('Automated update missing filters... aborting!', pQuery, false);
						}
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code 
						_Provider.Update(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
					},
					// Step 2: Check that the record was updated
					function (pQuery, fStageComplete)
					{
						if (typeof(pQuery.parameters.result.value) !== 'object')
						{
							// The value is not an object
							return fStageComplete('No record updated.', pQuery, false);
						}

						fStageComplete(pQuery.result.error, pQuery);
					},
					// Step 3: Read the record
					function (pQuery, fStageComplete)
					{
						// We can clone the query, since it has the criteria for the update in it already (filters survive a clone)
						var tmpQueryRead = pQuery.clone();
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code 
						_Provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
					},
					// Step 4: Marshal the record into a POJO
					function (pQuery, pQueryRead, fStageComplete)
					{
						var tmpRecord = marshalRecordFromSourceToObject(pQueryRead.result.value[0]);
						// TODO: Add error handling for marshaling
						fStageComplete(pQuery.result.error, pQuery, pQueryRead, tmpRecord);
					}
				],
				function(pError, pQuery, pQueryRead, pRecord)
				{
					if (pError)
					{
						_Fable.log.warn('Error during Update waterfall', {Error:pError, Query: pQuery.query});
					}
					fCallBack(pError, pQuery, pQueryRead, pRecord);
				}
			);

			return this;
		}


		/**
		 * Delete a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doDelete = function(pQuery, fCallBack)
		{
			// TODO: Check if this recordset has implicit delete tracking
			// Delete the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Delete the record
					function (fStageComplete)
					{
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Delete(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery, pQuery.result.value); });
					}
				],
				function(pError, pQuery, pRecord)
				{
					fCallBack(pError, pQuery, pRecord);
				}
			);

			return this;
		}

		/**
		 * Count a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doCount = function(pQuery, fCallBack)
		{
			// Count the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Count(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (typeof(pQuery.parameters.result.value) !== 'number')
						{
							// The value is not a number
							return fStageComplete('Count did not return valid results.', pQuery, false);
						}

						fStageComplete(pQuery.result.error, pQuery, pQuery.result.value);
					}
				],
				function(pError, pQuery, pCount)
				{
					fCallBack(pError, pQuery, pCount);
				}
			);

			return this;
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
			//_Fable.log.trace('Validation', {Value:tmpNewObject, Validation:_Schema.validateObject(tmpNewObject)})
			// Now return the new object
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

			setProvider: setProvider,
			setIDUser: setIDUser,

			// Schema management
			loadFromPackage: loadFromPackage,
			//
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
