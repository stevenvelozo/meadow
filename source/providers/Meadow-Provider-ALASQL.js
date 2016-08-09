// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

var MeadowProvider = function()
{
	function createNew(pFable)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if (typeof(pFable) !== 'object')
		{
			return {new: createNew};
		}
		var _Fable = pFable;
		var _GlobalLogLevel = 0;
		if (_Fable.settings.ArrayStorage)
		{
			 _GlobalLogLevel = _Fable.settings.ArrayStorage.GlobalLogLevel || 0;
		}
		
		if (!_Fable.hasOwnProperty('ALASQL'))
		{
			// Initialize the ALASQL driver for this fable instance.
			_Fable.ALASQL = require('alasql');
		}
		
		var libALASQL = _Fable.ALASQL;

		var _Schema = {};
		var _DefaultIdentifier = 'ID';
		var _DefaultGUIDentifier = 'GUID';
		var setSchema = (pSchema, pDefaultIdentifier, pDefaultGUIdentifier) => 
		{
			_Schema = pSchema;
			_DefaultIdentifier = pDefaultIdentifier;
			_DefaultGUIDentifier = pDefaultGUIdentifier;
		};
		
		// Create a table for this schema on the fly
		// This is ripped off from https://github.com/stevenvelozo/stricture/blob/master/source/Stricture-Generate-MySQL.js
		var createTableDynamically = (pParameters) =>
		{
			var tmpCreateStatement = '';
			var tmpTable = (pParameters.scope === 'undefined') ? 'Storage' : pParameters.scope;
			var tmpSchema = (_Schema.length < 1) ? [{Column:'ID', Type:'AutoIdentity'}] : _Schema;
			
			// Check if the schema does not contain all columns in the query, and add them if it doesn't.
			//for (var i = 0; i < pQuery.)
		
			tmpCreateStatement += "\nCREATE TABLE IF NOT EXISTS\n    "+tmpTable+"\n    (";
			for (var j = 0; j < tmpSchema.length; j++)
			{
				// If we aren't the first element, append a comma.
				if (j > 0)
					tmpCreateStatement += ",";
	
				tmpCreateStatement += "\n";
				// Dump out each column......
				switch (tmpSchema[j].Type)
				{
					case 'AutoIdentity':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` INT UNSIGNED NOT NULL AUTO_INCREMENT";
						_DefaultIdentifier = tmpSchema[j].Column;
						break;
					case 'AutoGUID':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'";
						_DefaultGUIDentifier = tmpSchema[j].Column;
						break;
					case 'Boolean':
					case 'Deleted':
					case 'CreateIDUser':
					case 'UpdateIDUser':
					case 'DeleteIDUser':
					case 'Numeric':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` INT NOT NULL DEFAULT '0'";
						break;
					case 'Decimal':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` DECIMAL("+tmpSchema[j].Size+")";
						break;
					case 'String':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` VARCHAR NOT NULL DEFAULT ''";
						break;
					case 'Text':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` TEXT";
						break;
					case 'CreateDate':
					case 'UpdateDate':
					case 'DeleteDate':
					case 'DateTime':
						tmpCreateStatement += "        `"+tmpSchema[j].Column+"` DATETIME";
						break;
					default:
						break;
				}
			}
			tmpCreateStatement += "\n    );";
			
			_Fable.log.info('Auto Creating ALASQL database `'+tmpTable+'`', {CreateStatement:tmpCreateStatement});

			libALASQL(tmpCreateStatement);
		};

		// Determine if the table has been created in ALASQL.  If not, create it.
		var checkDataExists = (pParameters) =>
		{
			// Per https://github.com/agershun/alasql/wiki/How-to-insert-data-into-the-table
			if (!_Fable.ALASQL.tables.hasOwnProperty(pParameters.scope))
			{
				// Create the table with the schema
				createTableDynamically(pParameters);
			}
		};

		// The Meadow marshaller also passes in the Schema as the third parameter, but this is a blunt function ATM.
		var marshalRecordFromSourceToObject = function(pObject, pRecord)
		{
			// For now, crudely assign everything in pRecord to pObject
			// This is safe in this context, and we don't want to slow down marshalling with millions of hasOwnProperty checks
			for(var tmpColumn in pRecord)
			{
				pObject[tmpColumn] = pRecord[tmpColumn];
			}
		};

		var Create = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			checkDataExists(pQuery.parameters);

			pQuery.setDialect('ALASQL').buildCreateQuery();

			// Compile the ALASQL query
			// Per https://github.com/agershun/alasql/wiki/Compile
			var fQuery = libALASQL.compile(pQuery.query.body);

			// TODO: Test the query before executing
			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			// No iops so this is not async
			try
			{
				tmpResult.error = undefined;
				tmpResult.executed = false;

				var tmpQueryResponse = fQuery(pQuery.query.parameters);

				tmpResult.value = libALASQL.autoval(pQuery.parameters.scope, _DefaultIdentifier);
				tmpResult.executed = true;
			}
			catch (pError)
			{
				tmpResult.error = pError;
			}

			fCallback();
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var Read = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			checkDataExists(pQuery.parameters);

			pQuery.setDialect('ALASQL').buildReadQuery();
			var fQuery = libALASQL.compile(pQuery.query.body);

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			try
			{
				tmpResult.error = undefined;
				tmpResult.executed = false;

				tmpResult.value = fQuery(pQuery.query.parameters);

				tmpResult.executed = true;
			}
			catch (pError)
			{
				tmpResult.error = pError;
			}
			fCallback();
		};

		var Update = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			checkDataExists(pQuery.parameters);

			pQuery.setDialect('ALASQL').buildUpdateQuery();
			var fQuery = libALASQL.compile(pQuery.query.body);

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}


			try
			{
				tmpResult.error = undefined;
				tmpResult.executed = false;

				tmpResult.value = {affectedRows: fQuery(pQuery.query.parameters)};

				tmpResult.executed = true;
			}
			catch (pError)
			{
				tmpResult.error = pError;
			}

			fCallback();
		};

		var Delete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			checkDataExists(pQuery.parameters);

			pQuery.setDialect('ALASQL').buildDeleteQuery();
			var fQuery = libALASQL.compile(pQuery.query.body);

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			try
			{
				tmpResult.error = undefined;
				tmpResult.executed = false;

				tmpResult.value =  {affectedRows: fQuery(pQuery.query.parameters)};

				tmpResult.executed = true;
			}
			catch (pError)
			{
				tmpResult.error = pError;
			}

			fCallback();
		};

		var Count = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			checkDataExists(pQuery.parameters);

			pQuery.setDialect('ALASQL').buildCountQuery();
			var fQuery = libALASQL.compile(pQuery.query.body);

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			// No iops so this is not async
			var tmpRecords = fQuery(pQuery.query.parameters);

			tmpResult.error = undefined;
			tmpResult.value = tmpRecords;
			tmpResult.executed = true;
			fCallback();
		};

		var tmpNewProvider = (
		{
			setSchema: setSchema,

			marshalRecordFromSourceToObject: marshalRecordFromSourceToObject,

			Create: Create,
			Read: Read,
			Update: Update,
			Delete: Delete,
			Count: Count,

			new: createNew
		});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();
