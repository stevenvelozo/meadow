// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/
var libMySQL = require('mysql2');

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
		if (_Fable.settings.MySQL)
		{
			 _GlobalLogLevel = _Fable.settings.MySQL.GlobalLogLevel || 0;
		}
		
		/**
		 * Build a connection pool, shared within this provider.
		 * This may be more performant as a shared object.
		 */
		var getSQLPool = function()
		{
			if (typeof(_Fable.MeadowMySQLConnectionPool) !== 'object')
			{
				// This is going to be problematic.
				_Fable.log.fatal('Meadow is trying to perform queries without a valid [Fable.MeadowMySQLConnectionPool] object.  See the documentation for how to initialize one.');
				return false;
			}

			return _Fable.MeadowMySQLConnectionPool;
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

			pQuery.setDialect('MySQL').buildCreateQuery();

			// TODO: Test the query before executing
			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			getSQLPool().getConnection(function(pError, pDBConnection)
			{
				pDBConnection.query(
					pQuery.query.body,
					pQuery.query.parameters,
					// The MySQL library also returns the Fields as the third parameter
					function(pError, pRows)
					{
						pDBConnection.release();
						tmpResult.error = pError;
						tmpResult.value = false;
						try
						{
							tmpResult.value = pRows.insertId;
						}
						catch(pErrorGettingRowcount)
						{
							_Fable.log.warn('Error getting insert ID during create query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
						}

						tmpResult.executed = true;
						return fCallback();
					}
				);
			});
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var Read = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildReadQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			getSQLPool().getConnection(function(pError, pDBConnection)
			{
				pDBConnection.query(
					pQuery.query.body,
					pQuery.query.parameters,
					// The MySQL library also returns the Fields as the third parameter
					function(pError, pRows)
					{
						pDBConnection.release();
						tmpResult.error = pError;
						tmpResult.value = pRows;
						tmpResult.executed = true;
						return fCallback();
					}
				);
			});
		};

		var Update = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildUpdateQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			getSQLPool().getConnection(function(pError, pDBConnection)
			{
				pDBConnection.query(
					pQuery.query.body,
					pQuery.query.parameters,
					// The MySQL library also returns the Fields as the third parameter
					function(pError, pRows)
					{
						pDBConnection.release();
						tmpResult.error = pError;
						tmpResult.value = pRows;
						tmpResult.executed = true;
						return fCallback();
					}
				);
			});
		}

		var Delete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildDeleteQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			getSQLPool().getConnection(function(pError, pDBConnection)
			{
				pDBConnection.query
				(
					pQuery.query.body,
					pQuery.query.parameters,
					// The MySQL library also returns the Fields as the third parameter
					function(pError, pRows)
					{
						pDBConnection.release();
						tmpResult.error = pError;
						tmpResult.value = false;
						try
						{
							tmpResult.value = pRows.affectedRows;
						}
						catch(pErrorGettingRowcount)
						{
							_Fable.log.warn('Error getting affected rowcount during delete query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
						}
						tmpResult.executed = true;
						return fCallback();
					}
				);
			});
		};

		var Undelete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildUndeleteQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			getSQLPool().getConnection(function(pError, pDBConnection)
			{
				pDBConnection.query
				(
					pQuery.query.body,
					pQuery.query.parameters,
					// The MySQL library also returns the Fields as the third parameter
					function(pError, pRows)
					{
						pDBConnection.release();
						tmpResult.error = pError;
						tmpResult.value = false;
						try
						{
							tmpResult.value = pRows.affectedRows;
						}
						catch(pErrorGettingRowcount)
						{
							_Fable.log.warn('Error getting affected rowcount during delete query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
						}
						tmpResult.executed = true;
						return fCallback();
					}
				);
			});
		};

		var Count = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MySQL').buildCountQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			getSQLPool().getConnection(function(pError, pDBConnection)
			{
				pDBConnection.query(
					pQuery.query.body,
					pQuery.query.parameters,
					// The MySQL library also returns the Fields as the third parameter
					function(pError, pRows)
					{
						pDBConnection.release();
						tmpResult.executed = true;
						tmpResult.error = pError;
						tmpResult.value = false;
						try
						{
							tmpResult.value = pRows[0].RowCount;
						}
						catch(pErrorGettingRowcount)
						{
							_Fable.log.warn('Error getting rowcount during count query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
						}
						return fCallback();
					}
				);
			});
		};

		var tmpNewProvider = (
		{
			marshalRecordFromSourceToObject: marshalRecordFromSourceToObject,

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
