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
						if (
								// The value is not an array
								(!Array.isArray(pQueryRead.parameters.result.value)) ||
								// There is not at least one record returned
								(pQueryRead.parameters.result.value.length < 1)
							)
						{
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
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (
								// The value is not an array
								(!Array.isArray(pQuery.parameters.result.value)) ||
								// There is not at least one record returned
								(pQuery.parameters.result.value.length < 1)
							)
						{
							return fStageComplete('Invalid query result in Read', pQuery, false);
						}

						var tmpRecord = marshalRecordFromSourceToObject(pQuery.result.value[0]);
						// TODO: Add error handling for marshaling
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
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal all the records into a POJO asynchronously
					function (pQuery, fStageComplete)
					{
						if (
								// The value is not an array
								(!Array.isArray(pQuery.parameters.result.value)) ||
								// There is not at least one record returned
								(pQuery.parameters.result.value.length < 1)
							)
						{
							return fStageComplete('No records read.', pQuery, false);
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
								fStageComplete(pQuery.result.error, pQuery, tmpRecords);
							}
						);
					}
				],
				function(pError, pQuery, pRecord)
				{
					if (pError)
					{
						_Fable.log.warn('Error during the read multiple waterfall', {Error:pError, Query: pQuery.query});
					}
					fCallBack(pError, pQuery, pRecord);
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
						var tmpQuery = pQuery;

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
						tmpQuery.addFilter(_DefaultIdentifier, pQuery.query.records[0][_DefaultIdentifier]);
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Update(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Check that the record was updated
					function (pQuery, fStageComplete)
					{
						if (
								// The query wasn't run yet
								(pQuery.parameters.result.executed == false) || 
								// The value is not an object
								(typeof(pQuery.parameters.result.value) !== 'object')
							)
						{
							return fStageComplete('No record created.', pQuery, false);
						}

						fStageComplete(pQuery.result.error, pQuery);
					},
					// Step 3: Read the record
					function (pQuery, fStageComplete)
					{
						// We can clone the query, since it has the criteria for the update in it already
						var tmpQueryRead = pQuery.clone();
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
					},
					// Step 4: Marshal the record into a POJO
					function (pQuery, pQueryRead, fStageComplete)
					{
						// This is a theoretical error ... it is pretty much impossible to simulate because 
						// the waterfall error handling in step 3 catches problems in the underlying update.
						// Therefore we'll leave the guard commented out for now.  But here for moral support.
						/*
						if (
								// The value is not an array
								(!Array.isArray(pQueryRead.parameters.result.value)) ||
								// There is not at least one record returned
								(pQueryRead.parameters.result.value.length < 1)
							)
						{
							return fStageComplete('There was an issue loading a record after save.', pQuery, pQueryRead, false);
						}
						*/

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
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Delete(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery, tmpQuery.result.value); });
					}
				],
				function(pError, pQuery, pRecord)
				{
					if (pError)
					{
						_Fable.log.warn('Error during Count waterfall', {Error:pError, Query: pQuery.query});
					}
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
						var tmpQuery = pQuery;
						// This odd lambda is to use the async waterfall without spilling logic into the provider read code complexity
						_Provider.Count(tmpQuery, function(){ fStageComplete(tmpQuery.result.error, tmpQuery); });
					},
					// Step 2: Marshal the record into a POJO
					function (pQuery, fStageComplete)
					{
						if (
								// The value is not a number
								(typeof(pQuery.parameters.result.value) !== 'number')
							)
						{
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
