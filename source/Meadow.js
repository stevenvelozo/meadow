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

var libFoxHound = require('foxhound');

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
		_Fable.settingsManager.fill({MeadowProvider:'None'});

		// The scope of this broker.
		var _Scope = (typeof(pScope) === 'string') ? pScope : 'Unknown';

		// The schema for this broker
		var _Schema = require('./Meadow-Schema.js').new(pSchema);
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
		 */
		var doCreate = function(pQuery, fCallBack)
		{
			// Read the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider create code complexity
						_Provider.Create(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQuery.parameters.result.executed == false) || 
								// The value is not set (it should be set to the value for our DefaultIdentifier)
								(pQuery.parameters.result.value === false)
							)
						{
							return fStageComplete(pQuery.result.error, false, pQuery);
						}

						var tmpIDRecord = pQuery.result.value;
						fStageComplete(pQuery.result.error, tmpIDRecord, pQuery);
					},
					// Step 3: Read the record
					function (pIDRecord, pQuery, fStageComplete)
					{
						var tmpQueryRead = pQuery.clone().addFilter(_DefaultIdentifier, pIDRecord);
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
					},
					// Step 4: Marshal the record into a POJO
					function (pQuery, pQueryRead, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQueryRead.parameters.result.executed == false) || 
								// The value is not an array
								(!Array.isArray(pQueryRead.parameters.result.value)) ||
								// There is not at least one record returned
								(pQueryRead.parameters.result.value.length < 1)
							)
						{
							return fStageComplete(pQueryRead.result.error, false, pQuery, pQueryRead);
						}

						var tmpRecord = marshalRecordFromSourceToObject(pQueryRead.result.value[0]);
						// TODO: Add error handling for marshaling
						fStageComplete(pQuery.result.error, tmpRecord, pQuery, pQueryRead);
					}
				],
				function(pError, pRecord, pQuery, pQueryRead)
				{
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pRecord, pQuery, pQueryRead);
				}
			);

			return this;
		}

		/**
		 * Read a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doRead = function(pQuery, fCallBack)
		{
			// Read the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQuery.parameters.result.executed == false) || 
								// The value is not an array
								(!Array.isArray(pQuery.parameters.result.value)) ||
								// There is not at least one record returned
								(pQuery.parameters.result.value.length < 1)
							)
						{
							return fStageComplete(pQuery.result.error, false, pQuery);
						}

						var tmpRecord = marshalRecordFromSourceToObject(pQuery.result.value[0]);
						// TODO: Add error handling for marshaling
						fStageComplete(pQuery.result.error, tmpRecord, pQuery);
					}
				],
				function(pError, pRecord, pQuery)
				{
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pRecord, pQuery);
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
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the records into a POJO asynchronously
					function (pQuery, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQuery.parameters.result.executed == false) || 
								// The value is not an array
								(!Array.isArray(pQuery.parameters.result.value)) ||
								// There is not at least one record returned
								(pQuery.parameters.result.value.length < 1)
							)
						{
							return fStageComplete(pQuery.result.error, false, pQuery);
						}

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
								fStageComplete(pQuery.result.error, tmpRecords, pQuery);
							}
						);
					}
				],
				function(pError, pRecord, pQuery)
				{
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pRecord, pQuery);
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
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						var tmpQuery = pQuery;

						if (!pQuery.query.records)
						{
							return fStageComplete('No record submitted', false, pQuery);
						}
						tmpQuery.addFilter(_DefaultIdentifier, pQuery.query.records[0][_DefaultIdentifier]);
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Update(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQuery.parameters.result.executed == false) || 
								// The value is not an object
								(typeof(pQuery.parameters.result.value) !== 'object')
							)
						{
							return fStageComplete(pQuery.result.error, false, pQuery);
						}

						// TODO: Add error handling for marshaling
						fStageComplete(pQuery.result.error, pQuery);
					},
					// Step 3: Read the record
					function (pQuery, fStageComplete)
					{
						var tmpQueryRead = pQuery.clone();
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
					},
					// Step 4: Marshal the record into a POJO
					function (pQuery, pQueryRead, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQueryRead.parameters.result.executed == false) || 
								// The value is not an array
								(!Array.isArray(pQueryRead.parameters.result.value)) ||
								// There is not at least one record returned
								(pQueryRead.parameters.result.value.length < 1)
							)
						{
							return fStageComplete(pQueryRead.result.error, false, pQuery, pQueryRead);
						}

						var tmpRecord = marshalRecordFromSourceToObject(pQueryRead.result.value[0]);
						// TODO: Add error handling for marshaling
						fStageComplete(pQuery.result.error, tmpRecord, pQuery, pQueryRead);
					}
				],
				function(pError, pRecord, pQuery, pQueryRead)
				{
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pRecord, pQuery, pQueryRead);
				}
			);

			return this;
		}


		/**
		 * Delete a record asynchronously, calling fCallBack with the marshalled record(s) or error in them at end
		 */
		var doDelete = function(pQuery, fCallBack)
		{
			// Delete the record(s) from the source
			libAsync.waterfall(
				[
					// Step 1: Get the record from the data source
					function (fStageComplete)
					{
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Delete(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery.result.value, tmpQuery); });
					}
				],
				function(pError, pRecord, pQuery)
				{
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pRecord, pQuery);
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
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Count(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQuery.parameters.result.executed == false) || 
								// The value is not a number
								(typeof(pQuery.parameters.result.value) !== 'number')
							)
						{
							return fStageComplete(pQuery.result.error, false, pQuery);
						}

						// TODO: Add error handling for marshaling
						fStageComplete(pQuery.result.error, pQuery.result.value, pQuery);
					}
				],
				function(pError, pCount, pQuery)
				{
					// Call the callback passed in with the record as the first parameter, query second.
					fCallBack(pError, pCount, pQuery);
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
			// Create an object from the query and fill out its values
			// By default create an object from the default prototype and then clone in each value defined in the schema.
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

			setScope: setScope,
			setProvider: setProvider,

			// Schema management functions
			setSchema: setSchema,
			setDefault: setDefault,
			setDefaultIdentifier: setDefaultIdentifier,
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

		/**
		 * Query
		 *
		 * @property query
		 * @type object
		 */
		Object.defineProperty(tmpNewMeadowObject, 'query',
			{
				get: function() { return _Query; },
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
