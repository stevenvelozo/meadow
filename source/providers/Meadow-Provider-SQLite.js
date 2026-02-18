/**
* Meadow Provider - SQLite (via better-sqlite3)
*
* @license MIT
* @author <steven@velozo.com>
*/
var MeadowProvider = function ()
{
	function createNew(pFable)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if (typeof (pFable) !== 'object')
		{
			return { new: createNew };
		}
		var _Fable = pFable;

		/**
		 * Get the better-sqlite3 database instance from the connection provider.
		 *
		 * The connection provider (meadow-connection-sqlite) stores the database
		 * instance on .db after connectAsync() completes.
		 */
		var getDB = function ()
		{
			if (typeof (_Fable.MeadowSQLiteProvider) == 'object' && _Fable.MeadowSQLiteProvider.connected)
			{
				return _Fable.MeadowSQLiteProvider.db;
			}

			return false;
		};

		var getProvider = function ()
		{
			if (typeof (_Fable.MeadowSQLiteProvider) == 'object')
			{
				return _Fable.MeadowSQLiteProvider;
			}

			return false;
		};

		/**
		 * Replace NOW() with SQLite-compatible datetime('now') in query bodies.
		 *
		 * The FoxHound SQLite dialect generates NOW() for date stamps, but SQLite
		 * does not support NOW().  We replace it at the provider level so the
		 * dialect can stay consistent with the other providers.
		 */
		var fixDateFunctions = function (pQueryBody)
		{
			if (typeof (pQueryBody) !== 'string')
			{
				return pQueryBody;
			}
			// Replace NOW() and NOW(3) with SQLite's datetime function
			return pQueryBody.replace(/NOW\(\d*\)/g, "datetime('now')");
		};

		/**
		 * Convert FoxHound named parameters (:name) to better-sqlite3 format.
		 *
		 * better-sqlite3 uses @name, $name, or :name for named parameters,
		 * but expects them passed as an object.  FoxHound generates :name syntax
		 * which better-sqlite3 supports natively.
		 */

		/**
		 * Coerce query parameter values so they are safe for better-sqlite3.
		 *
		 * better-sqlite3 only accepts numbers, strings, bigints, buffers and null.
		 * Booleans (e.g. Deleted: false) must be converted to integers.
		 * Undefined values must be converted to null.
		 */
		var coerceParameters = function (pParams)
		{
			if (typeof (pParams) !== 'object' || pParams === null)
			{
				return pParams;
			}
			var tmpKeys = Object.keys(pParams);
			for (var i = 0; i < tmpKeys.length; i++)
			{
				var tmpValue = pParams[tmpKeys[i]];
				if (Array.isArray(tmpValue))
				{
					// SQLite (better-sqlite3) cannot bind arrays.
					// For single-element arrays (e.g. from FBL~Field~LT~10),
					// unwrap to the scalar value.
					if (tmpValue.length === 1)
					{
						pParams[tmpKeys[i]] = tmpValue[0];
					}
				}
				else if (typeof (tmpValue) === 'boolean')
				{
					pParams[tmpKeys[i]] = tmpValue ? 1 : 0;
				}
				else if (typeof (tmpValue) === 'undefined')
				{
					pParams[tmpKeys[i]] = null;
				}
			}
			return pParams;
		};

		// The Meadow marshaller also passes in the Schema as the third parameter, but this is a blunt function ATM.
		var marshalRecordFromSourceToObject = function (pObject, pRecord)
		{
			// For now, crudely assign everything in pRecord to pObject
			for (var tmpColumn in pRecord)
			{
				pObject[tmpColumn] = pRecord[tmpColumn];
			}
		};

		var Create = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('SQLite').buildCreateQuery();

			var tmpQueryBody = fixDateFunctions(pQuery.query.body);
			coerceParameters(pQuery.query.parameters);

			if (pQuery.logLevel > 0)
			{
				_Fable.log.trace(tmpQueryBody, pQuery.query.parameters);
			}

			try
			{
				var tmpDB = getDB();
				if (!tmpDB)
				{
					tmpResult.error = new Error('No SQLite database connection available.');
					tmpResult.executed = true;
					return fCallback();
				}

				var tmpStatement = tmpDB.prepare(tmpQueryBody);
				var tmpInfo = tmpStatement.run(pQuery.query.parameters);

				tmpResult.error = null;
				tmpResult.value = false;
				try
				{
					tmpResult.value = Number(tmpInfo.lastInsertRowid);
				}
				catch (pErrorGettingRowcount)
				{
					_Fable.log.warn('Error getting insert ID during create query', { Body: tmpQueryBody, Parameters: pQuery.query.parameters });
				}

				tmpResult.executed = true;
				return fCallback();
			}
			catch (pError)
			{
				tmpResult.error = pError;
				tmpResult.value = false;
				tmpResult.executed = true;
				return fCallback();
			}
		};

		var Read = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('SQLite').buildReadQuery();

			var tmpQueryBody = fixDateFunctions(pQuery.query.body);
			coerceParameters(pQuery.query.parameters);

			if (pQuery.logLevel > 0)
			{
				_Fable.log.trace(tmpQueryBody, pQuery.query.parameters);
			}

			try
			{
				var tmpDB = getDB();
				if (!tmpDB)
				{
					tmpResult.error = new Error('No SQLite database connection available.');
					tmpResult.executed = true;
					return fCallback();
				}

				var tmpStatement = tmpDB.prepare(tmpQueryBody);
				var tmpRows = tmpStatement.all(pQuery.query.parameters);

				tmpResult.error = null;
				tmpResult.value = tmpRows;
				tmpResult.executed = true;
				return fCallback();
			}
			catch (pError)
			{
				tmpResult.error = pError;
				tmpResult.value = false;
				tmpResult.executed = true;
				return fCallback();
			}
		};

		var Update = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('SQLite').buildUpdateQuery();

			var tmpQueryBody = fixDateFunctions(pQuery.query.body);
			coerceParameters(pQuery.query.parameters);

			if (pQuery.logLevel > 0)
			{
				_Fable.log.trace(tmpQueryBody, pQuery.query.parameters);
			}

			try
			{
				var tmpDB = getDB();
				if (!tmpDB)
				{
					tmpResult.error = new Error('No SQLite database connection available.');
					tmpResult.executed = true;
					return fCallback();
				}

				var tmpStatement = tmpDB.prepare(tmpQueryBody);
				var tmpInfo = tmpStatement.run(pQuery.query.parameters);

				tmpResult.error = null;
				tmpResult.value = tmpInfo;
				tmpResult.executed = true;
				return fCallback();
			}
			catch (pError)
			{
				tmpResult.error = pError;
				tmpResult.value = false;
				tmpResult.executed = true;
				return fCallback();
			}
		};

		var Delete = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('SQLite').buildDeleteQuery();

			var tmpQueryBody = fixDateFunctions(pQuery.query.body);
			coerceParameters(pQuery.query.parameters);

			if (pQuery.logLevel > 0)
			{
				_Fable.log.trace(tmpQueryBody, pQuery.query.parameters);
			}

			try
			{
				var tmpDB = getDB();
				if (!tmpDB)
				{
					tmpResult.error = new Error('No SQLite database connection available.');
					tmpResult.executed = true;
					return fCallback();
				}

				var tmpStatement = tmpDB.prepare(tmpQueryBody);
				var tmpInfo = tmpStatement.run(pQuery.query.parameters);

				tmpResult.error = null;
				tmpResult.value = false;
				try
				{
					tmpResult.value = tmpInfo.changes;
				}
				catch (pErrorGettingRowcount)
				{
					_Fable.log.warn('Error getting affected rowcount during delete query', { Body: tmpQueryBody, Parameters: pQuery.query.parameters });
				}
				tmpResult.executed = true;
				return fCallback();
			}
			catch (pError)
			{
				tmpResult.error = pError;
				tmpResult.value = false;
				tmpResult.executed = true;
				return fCallback();
			}
		};

		var Undelete = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('SQLite').buildUndeleteQuery();

			var tmpQueryBody = fixDateFunctions(pQuery.query.body);
			coerceParameters(pQuery.query.parameters);

			if (pQuery.logLevel > 0)
			{
				_Fable.log.trace(tmpQueryBody, pQuery.query.parameters);
			}

			try
			{
				var tmpDB = getDB();
				if (!tmpDB)
				{
					tmpResult.error = new Error('No SQLite database connection available.');
					tmpResult.executed = true;
					return fCallback();
				}

				var tmpStatement = tmpDB.prepare(tmpQueryBody);
				var tmpInfo = tmpStatement.run(pQuery.query.parameters);

				tmpResult.error = null;
				tmpResult.value = false;
				try
				{
					tmpResult.value = tmpInfo.changes;
				}
				catch (pErrorGettingRowcount)
				{
					_Fable.log.warn('Error getting affected rowcount during undelete query', { Body: tmpQueryBody, Parameters: pQuery.query.parameters });
				}
				tmpResult.executed = true;
				return fCallback();
			}
			catch (pError)
			{
				tmpResult.error = pError;
				tmpResult.value = false;
				tmpResult.executed = true;
				return fCallback();
			}
		};

		var Count = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('SQLite').buildCountQuery();

			var tmpQueryBody = fixDateFunctions(pQuery.query.body);
			coerceParameters(pQuery.query.parameters);

			if (pQuery.logLevel > 0)
			{
				_Fable.log.trace(tmpQueryBody, pQuery.query.parameters);
			}

			try
			{
				var tmpDB = getDB();
				if (!tmpDB)
				{
					tmpResult.error = new Error('No SQLite database connection available.');
					tmpResult.executed = true;
					return fCallback();
				}

				var tmpStatement = tmpDB.prepare(tmpQueryBody);
				var tmpRows = tmpStatement.all(pQuery.query.parameters);

				tmpResult.executed = true;
				tmpResult.error = null;
				tmpResult.value = false;
				try
				{
					tmpResult.value = tmpRows[0].RowCount;
				}
				catch (pErrorGettingRowcount)
				{
					_Fable.log.warn('Error getting rowcount during count query', { Body: tmpQueryBody, Parameters: pQuery.query.parameters });
				}
				return fCallback();
			}
			catch (pError)
			{
				tmpResult.error = pError;
				tmpResult.value = false;
				tmpResult.executed = true;
				return fCallback();
			}
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

				getProvider: getProvider,
				providerCreatesSupported: true,

				new: createNew
			});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();
