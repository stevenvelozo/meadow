// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
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
		var _GlobalLogLevel = 0;
		if (_Fable.settings.MSSQL)
		{
			_GlobalLogLevel = _Fable.settings.MSSQL.GlobalLogLevel || 0;
		}

		/**
		 * Build a connection pool, shared within this provider.
		 * This may be more performant as a shared object.
		 */
		var getSQLPool = function ()
		{
			// New-style default connection pool provider
			// There are no legacy MSSQL open source connectors.
			if (typeof (_Fable.MeadowMSSQLProvider) == 'object' && _Fable.MeadowMSSQLProvider.connected)
			{
				return _Fable.MeadowMSSQLProvider.pool;
			}
			return false;
		};

		var getProvider = function ()
		{
			if (typeof (_Fable.MeadowMSSQLProvider) == 'object' && _Fable.MeadowMSSQLProvider.connected)
			{
				return _Fable.MeadowMSSQLProvider;
			}
			return false;
		}

		// The Meadow marshaller also passes in the Schema as the third parameter, but this is a blunt function ATM.
		var marshalRecordFromSourceToObject = function (pObject, pRecord)
		{
			// For now, crudely assign everything in pRecord to pObject
			// This is safe in this context, and we don't want to slow down marshalling with millions of hasOwnProperty checks
			for (var tmpColumn in pRecord)
			{
				pObject[tmpColumn] = pRecord[tmpColumn];
			}
		};

		var getPreparedStatementFromQuery = function (pQuery)
		{
			// Create the MS SQL Prepared Statement class
			let tmpPreparedStatement = _Fable.MeadowMSSQLProvider.preparedStatement;
			// Map the Parameters to Types
			let tmpParameterTypeKeys = Object.keys(pQuery.query.parameterTypes)
			for (let i = 0; i < tmpParameterTypeKeys.length; i++)
			{
				let tmpParameterType = pQuery.query.parameterTypes[tmpParameterTypeKeys[i]];
				if (_Fable.MeadowMSSQLProvider.MSSQL[tmpParameterType] === undefined)
				{
					tmpParameterType = 'Char';
				}
				// TODO: Decide how to filter better cleansing to this layer from the schema; we have access to proper lengths.
				//       BEFORE WE ADD THIS BEHAVIOR, DECIDE CONCISTENCY WITH OTHER PROVIDERS WHO ALLOW OVERFLOWING STRINGS
				let tmpParameterEntry = false;
				if ((tmpParameterType === 'Char') || (tmpParameterType === 'VarChar'))
				{
					tmpParameterEntry = _Fable.MeadowMSSQLProvider.MSSQL[tmpParameterType](64);
				}
				else
				{
					tmpParameterEntry = _Fable.MeadowMSSQLProvider.MSSQL[tmpParameterType];
				}
				tmpPreparedStatement.input(tmpParameterTypeKeys[i], tmpParameterEntry);
			}

			return tmpPreparedStatement;
		};

		var Create = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MSSQL').buildCreateQuery();

			// TODO: Test the query before executing
			if (pQuery.logLevel > 0 || _GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			let tmpPreparedStatement = getPreparedStatementFromQuery(pQuery);

			let tmpQueryBody = `${pQuery.query.body} \nSELECT @@IDENTITY AS value;`

			tmpPreparedStatement.prepare(tmpQueryBody,
				(pPrepareError) =>
				{
					// TODO: This will likely blow up the world.  It will definitely happen when the schema doesn't generate good constraints from the inputs.
					if (pPrepareError)
					{
						_Fable.log.error(`CREATE Error preparing prepared statement: ${pPrepareError}`, pPrepareError);
					}

					tmpPreparedStatement.execute(pQuery.query.parameters,
						(pPreparedExecutionError, pPreparedResult) =>
						{
							// release the connection after queries are executed
							tmpPreparedStatement.unprepare(
								(pPreparedStatementUnprepareError) =>
								{
									if (pPreparedStatementUnprepareError)
									{
										_Fable.log.error(`CREATE Error unpreparing prepared statement: ${pPreparedStatementUnprepareError}`, pPreparedStatementUnprepareError);
									}

									tmpResult.error = pPreparedExecutionError;
									if (pPreparedResult
										&& Array.isArray(pPreparedResult.recordset)
										&& (pPreparedResult.recordset.length > 0)
										&& (pPreparedResult.recordset[0].value))
									{
										tmpResult.value = pPreparedResult.recordset[0].value;
									}
									tmpResult.executed = true;

									// TODO: Fix very old pattern by es6-izing this whole bash
									return fCallback();
								});
						});
				});
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var Read = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MSSQL').buildReadQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			let tmpPreparedStatement = getPreparedStatementFromQuery(pQuery);
			tmpPreparedStatement.prepare(pQuery.query.body,
				(pPrepareError) =>
				{
					// TODO: This will likely blow up the world.  It will definitely happen when the schema doesn't generate good constraints from the inputs.
					if (pPrepareError)
					{
						_Fable.log.error(`READ Error preparing prepared statement: ${pPrepareError}`, pPrepareError);
					}

					tmpPreparedStatement.execute(pQuery.query.parameters,
						(pPreparedExecutionError, pPreparedResult) =>
						{
							// release the connection after queries are executed
							tmpPreparedStatement.unprepare(
								(pPreparedStatementUnprepareError) =>
								{
									if (pPreparedStatementUnprepareError)
									{
										_Fable.log.error(`READ Error unpreparing prepared statement: ${pPreparedStatementUnprepareError}`, pPreparedStatementUnprepareError);
									}

									//_Fable.log.info(`Prepared statement returned...`, pPreparedResult);
									tmpResult.error = pPreparedExecutionError;
									try
									{
										tmpResult.value = pPreparedResult.recordset;
									}
									catch(pMarshalError)
									{
										_Fable.log.error(`READ Error marshaling prepared statement result: ${pMarshalError}`, pMarshalError);
									}
									tmpResult.executed = true;
									return fCallback();
								});
						})
				});
		};

		var Update = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MSSQL').buildUpdateQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			let tmpPreparedStatement = getPreparedStatementFromQuery(pQuery);
			tmpPreparedStatement.prepare(pQuery.query.body,
				(pPrepareError) =>
				{
					// TODO: This will likely blow up the world.  It will definitely happen when the schema doesn't generate good constraints from the inputs.
					if (pPrepareError)
					{
						_Fable.log.error(`UPDATE Error preparing prepared statement: ${pPrepareError}`, pPrepareError);
					}

					tmpPreparedStatement.execute(pQuery.query.parameters,
						(pPreparedExecutionError, pPreparedResult) =>
						{
							// release the connection after queries are executed
							tmpPreparedStatement.unprepare(
								(pPreparedStatementUnprepareError) =>
								{
									if (pPreparedStatementUnprepareError)
									{
										_Fable.log.error(`UPDATE Error unpreparing prepared statement: ${pPreparedStatementUnprepareError}`, pPreparedStatementUnprepareError);
									}

									//_Fable.log.info(`Prepared statement returned...`, pPreparedResult);
									tmpResult.error = pPreparedExecutionError;
									tmpResult.value = pPreparedResult;
									tmpResult.executed = true;
									return fCallback();
								});
						})
				});
		}

		var Delete = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MSSQL').buildDeleteQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			let tmpPreparedStatement = getPreparedStatementFromQuery(pQuery);
			tmpPreparedStatement.prepare(pQuery.query.body,
				(pPrepareError) =>
				{
					// TODO: This will likely blow up the world.  It will definitely happen when the schema doesn't generate good constraints from the inputs.
					if (pPrepareError)
					{
						_Fable.log.error(`DELETE Error preparing prepared statement: ${pPrepareError}`, pPrepareError);
					}

					tmpPreparedStatement.execute(pQuery.query.parameters,
						(pPreparedExecutionError, pPreparedResult) =>
						{
							// release the connection after queries are executed
							tmpPreparedStatement.unprepare(
								(pPreparedStatementUnprepareError) =>
								{
									if (pPreparedStatementUnprepareError)
									{
										_Fable.log.error(`DELETE Error unpreparing prepared statement: ${pPreparedStatementUnprepareError}`, pPreparedStatementUnprepareError);
									}

									//_Fable.log.info(`Prepared statement returned...`, pPreparedResult);
									tmpResult.error = pPreparedExecutionError;
									tmpResult.value = false;
									try
									{
										tmpResult.value = pPreparedResult.rowsAffected[0];
									}
									catch (pErrorGettingRowcount)
									{
										_Fable.log.warn('Error getting affected rowcount during delete query', { Body: pQuery.query.body, Parameters: pQuery.query.parameters });
									}
									tmpResult.executed = true;
									return fCallback();
								});
						})
				});
		};

		var Undelete = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MSSQL').buildUndeleteQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			let tmpPreparedStatement = getPreparedStatementFromQuery(pQuery);
			tmpPreparedStatement.prepare(pQuery.query.body,
				(pPrepareError) =>
				{
					// TODO: This will likely blow up the world.  It will definitely happen when the schema doesn't generate good constraints from the inputs.
					if (pPrepareError)
					{
						_Fable.log.error(`UNDELETE Error preparing prepared statement: ${pPrepareError}`, pPrepareError);
					}

					tmpPreparedStatement.execute(pQuery.query.parameters,
						(pPreparedExecutionError, pPreparedResult) =>
						{
							// release the connection after queries are executed
							tmpPreparedStatement.unprepare(
								(pPreparedStatementUnprepareError) =>
								{
									if (pPreparedStatementUnprepareError)
									{
										_Fable.log.error(`UNDELETE Error unpreparing prepared statement: ${pPreparedStatementUnprepareError}`, pPreparedStatementUnprepareError);
									}

									//_Fable.log.info(`Prepared statement returned...`, pPreparedResult);
									tmpResult.error = pPreparedExecutionError;
									tmpResult.value = false;
									try
									{
										tmpResult.value = pPreparedResult.rowsAffected[0];
									}
									catch (pErrorGettingRowcount)
									{
										_Fable.log.warn('Error getting affected rowcount during undelete query', { Body: pQuery.query.body, Parameters: pQuery.query.parameters });
									}
									tmpResult.executed = true;
									return fCallback();
								});
						})
				});
		};

		var Count = function (pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			pQuery.setDialect('MSSQL').buildCountQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			}

			let tmpPreparedStatement = getPreparedStatementFromQuery(pQuery);
			tmpPreparedStatement.prepare(pQuery.query.body,
				(pPrepareError) =>
				{
					// TODO: This will likely blow up the world.  It will definitely happen when the schema doesn't generate good constraints from the inputs.
					if (pPrepareError)
					{
						_Fable.log.error(`COUNT Error preparing prepared statement: ${pPrepareError}`, pPrepareError);
					}

					tmpPreparedStatement.execute(pQuery.query.parameters,
						(pPreparedExecutionError, pPreparedResult) =>
						{
							// release the connection after queries are executed
							tmpPreparedStatement.unprepare(
								(pPreparedStatementUnprepareError) =>
								{
									if (pPreparedStatementUnprepareError)
									{
										_Fable.log.error(`COUNT Error unpreparing prepared statement: ${pPreparedStatementUnprepareError}`, pPreparedStatementUnprepareError);
									}

									//_Fable.log.info(`Prepared statement returned...`, pPreparedResult);
									tmpResult.error = pPreparedExecutionError;
									tmpResult.value = false;
									try
									{
										tmpResult.value = pPreparedResult.recordset[0].Row_Count;
									}
									catch (pErrorGettingRowcount)
									{
										_Fable.log.warn('Error getting affected rowcount during count query', { Body: pQuery.query.body, Parameters: pQuery.query.parameters });
									}
									tmpResult.executed = true;
									return fCallback();
								});
						})
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

				getProvider: getProvider,
				providerCreatesSupported: true,

				new: createNew
			});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();
