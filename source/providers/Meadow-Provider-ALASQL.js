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
			// This is going to be problematic.
			_Fable.log.fatal('Meadow is trying to perform queries without a valid [Fable.ALASQL] object.  See the documentation for how to initialize one.');
			return false;
		}
		
		var libALASQL = _Fable.ALASQL;

		var _Scope = 'Unknown_Meadow_ALASQL_Scope';
		var _Schema = {};
		var _DefaultIdentifier = 'ID';
		var _DefaultGUIDentifier = 'GUID';
		var setSchema = (pScope, pSchema, pDefaultIdentifier, pDefaultGUIdentifier) => 
		{
			_Scope = pScope;
			_Schema = pSchema;
			_DefaultIdentifier = pDefaultIdentifier;
			_DefaultGUIDentifier = pDefaultGUIdentifier;
			return this;
		};
		
		// Create a table for this schema on the fly
		// This is ripped off from https://github.com/stevenvelozo/stricture/blob/master/source/Stricture-Generate-MySQL.js
		var createTableDynamically = () =>
		{
			var tmpCreateStatement = '';
			var tmpTable = _Scope;
			var tmpSchema = _Schema;
			
			// Check if the scope in the query matches the passed-in scope
			// Check if the schema does not contain all columns in the query, and add them if it doesn't.
		
			tmpCreateStatement += "CREATE TABLE IF NOT EXISTS\n    "+tmpTable+"\n";
			if (tmpSchema.length > 0)
			{
				tmpCreateStatement += "    (\n";
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
							tmpCreateStatement += "        `"+tmpSchema[j].Column+"` INT NOT NULL DEFAULT 0";
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
				tmpCreateStatement += "\n    )";
			}
			tmpCreateStatement += ";";
			
			_Fable.log.info('Auto Creating ALASQL database `'+tmpTable+'`', {CreateStatement:tmpCreateStatement});

			libALASQL(tmpCreateStatement);

			return this;
		};
		
		// Determine if the table has been created in ALASQL.  If not, create it.
		var checkDataExists = (pParameters) =>
		{
			// Check if the scope was passed in via the query and it hasn't been set yet.
			if ((_Scope == 'Unknown_Meadow_ALASQL_Scope') && (typeof(pParameters.scope) !== 'undefined'))
			{
				_Scope = pParameters.scope;
			}
			// Per https://github.com/agershun/alasql/wiki/How-to-insert-data-into-the-table
			if (!_Fable.ALASQL.tables.hasOwnProperty(_Scope))
			{
				// Create the table with the schema
				createTableDynamically();
			}
		};

		var bindObject = (pObject) =>
		{
			if (!Array.isArray(pObject))
				return false;

			// Check that the database is created in ALASQL first
			checkDataExists({});
			
			if (!_Fable.ALASQL.tables.hasOwnProperty(_Scope))
				return false;

			// Per https://github.com/agershun/alasql/wiki/How-to-insert-data-into-the-table
			_Fable.ALASQL.tables[_Scope].data = pObject;
			return true;
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
				tmpResult.value = 0;

				var tmpQueryResponse = fQuery(pQuery.query.parameters);

				if (tmpQueryResponse > 0)
				{
					// Check if there is an ALASQL autoval for this insert
					if (libALASQL.tables[pQuery.parameters.scope].identities[_DefaultIdentifier])
					{
						tmpResult.value = libALASQL.autoval(pQuery.parameters.scope, _DefaultIdentifier);
					}
					else if ((pQuery.query.records.length > 0) && (pQuery.query.records[0].hasOwnProperty(_DefaultIdentifier)))
					{
						tmpResult.value = pQuery.query.records[0][_DefaultIdentifier];
					}
				}
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

				tmpResult.value =  fQuery(pQuery.query.parameters);

				tmpResult.executed = true;
			}
			catch (pError)
			{
				tmpResult.error = pError;
			}

			fCallback();
		};

		var Undelete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			checkDataExists(pQuery.parameters);

			pQuery.setDialect('ALASQL').buildUndeleteQuery();
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

				tmpResult.value =  fQuery(pQuery.query.parameters);

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

			try
			{
				tmpResult.error = undefined;
				tmpResult.executed = false;

				tmpResult.value =  fQuery(pQuery.query.parameters)[0].RowCount;

				tmpResult.executed = true;
			}
			catch (pError)
			{
				tmpResult.error = pError;
			}

			fCallback();
		};
		
		/**
		 * Construct a new Meadow from a record prototype, optionally passing in records.
		 * 
		 * Takes an object
		 * {
		 *		Meadow:          Meadow object to use (required)
		 *      Scope:           "DATA" (string)
		 *      ObjectPrototype: {}     (the object to base the schema off of -- REQUIRED)
		 *      AuditData:       true   (boolean -- whether or not to add audit columns)
		 *      Import:          true   (boolean -- whether or not to import them using the DAL)
		 *      Data:            []     (optional array of records, one object each)
		 * }
		 */
		var constructFromObject = (pParameters) =>
		{
			if ((typeof(pParameters) !== 'object') || (typeof(pParameters.Meadow) !== 'object'))
				return false;

			// I know there are better ways to do this, but for now I want to keep it very manual
			if (!(typeof(pParameters.Scope) === 'string'))
				pParameters.Scope = 'DATA';
			if (!(typeof(pParameters.ObjectPrototype) === 'object'))
				pParameters.ObjectPrototype = {};
			if (!(typeof(pParameters.AuditData) === 'boolean'))
				pParameters.AuditData = true;
			if (!(typeof(pParameters.Import) === 'boolean'))
				pParameters.Import = true;
			if (!Array.isArray(pParameters.Data))
				pParameters.Data = [];
				
			// Construct a meadow
			var tmpMeadow = pParameters.Meadow
				.new(_Fable, pParameters.Scope)
				.setProvider('ALASQL');
			
			var tmpSchema = [];
			var tmpDefaultIdentifier;

			if (pParameters.AuditData)
			{
				// Add the audit fields to the schema
				tmpDefaultIdentifier = 'ID'+pParameters.Scope;
				tmpSchema.push({ Column: tmpDefaultIdentifier, Type:"AutoIdentity" });
				tmpSchema.push({ Column: "GU"+tmpDefaultIdentifier, Type:"AutoGUID" });
				tmpSchema.push({ Column: "CreateDate", Type:"CreateDate" });
				tmpSchema.push({ Column: "CreatingIDUser", Type:"CreateIDUser" });
				tmpSchema.push({ Column: "UpdateDate", Type:"UpdateDate" });
				tmpSchema.push({ Column: "UpdatingIDUser", Type:"UpdateIDUser" });
				tmpSchema.push({ Column: "DeleteDate", Type:"DeleteDate" });
				tmpSchema.push({ Column: "DeletingIDUser", Type:"DeleteIDUser" });
				tmpSchema.push({ Column: "Deleted", Type:"Deleted" });
			}

			// Now add the fields from the object in
			for (var tmpProperty in pParameters.ObjectPrototype)
			{
				var tmpAdded = false;

				// Add it to the schema
				switch(typeof(pParameters.ObjectPrototype[tmpProperty]))
				{
					case "undefined":
					case "object":
					case "function":
						// Do nothing with these types of properties
						break;
						
					case "boolean":
						tmpSchema.push({ Column: tmpProperty, Type:"Boolean" });
						break;

					// Because we can't tell the difference between floating point and not
					case "number":
					case "string":
						tmpSchema.push({ Column: tmpProperty, Type:"Text" });
						break;
					
					default:
						break;
				}

				if (tmpAdded && (typeof(tmpDefaultIdentifier) === 'undefined'))
					// Just use the first property of the prototype object as the default identifier
					tmpDefaultIdentifier = tmpProperty;
			}
			tmpMeadow.setSchema(tmpSchema);

			if (typeof(tmpDefaultIdentifier) === 'undefined')
				tmpMeadow.setDefaultIdentifier(tmpDefaultIdentifier);

			// Now import the data
			if(pParameters.Import)
			{
				for (var j = 0; j < pParameters.Data.length; j++)
				{
					tmpMeadow.doCreate(tmpMeadow.query.clone().addRecord(pParameters.Data[j]),
							function(pError, pQuery, pQueryRead, pRecord)
							{
								// Maybe log the error?
								_Fable.log.trace('Auto imported record', pRecord);
							}
						);
				}
			}
			else
			{
				// Just assign the object
				tmpMeadow.provider.bindObject(pParameters.Data);
			}
			
			return tmpMeadow;
		};

		var tmpNewProvider = (
		{
			setSchema: setSchema,

			marshalRecordFromSourceToObject: marshalRecordFromSourceToObject,
			
			constructFromObject: constructFromObject,

			bindObject:bindObject,

			Create: Create,
			Read: Read,
			Update: Update,
			Delete: Delete,
			Undelete: Undelete,
			Count: Count,

			new: createNew
		});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();
