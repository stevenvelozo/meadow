// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/
var libSimpleGet = require('simple-get');
var libUnderscore = require('underscore');

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

		var _Dialect = 'MeadowEndpoints';

		var _Headers = {};
		var _Cookies = [];

		var _EndpointSettings = (_Fable.settings.hasOwnProperty('MeadowEndpoints')) ? JSON.parse(JSON.stringify(_Fable.settings.MedaowEndpoints)) : (
			{
				ServerProtocol: 'http',
				ServerAddress: '127.0.0.1',
				ServerPort: '8086',
				ServerEndpointPrefix: '1.0/'
			}
		)

		var buildURL = function(pAddress)
		{
			return `${_EndpointSettings.ServerProtocol}://${_EndpointSettings.ServerAddress}:${_EndpointSettings.ServerPort}/${_EndpointSettings.ServerEndpointPrefix}${pAddress}`;
		};

		// The Meadow marshaller also passes in the Schema as the third parameter, but this is a blunt function ATM.
		var marshalRecordFromSourceToObject = function(pObject, pRecord)
		{
			for(var tmpColumn in pRecord)
			{
				pObject[tmpColumn] = pRecord[tmpColumn];
			}
		};

		var Create = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;
			// pQuery.setDialect(_Dialect).buildCreateQuery();

			// // TODO: Test the query before executing
			// if (pQuery.logLevel > 0 ||
			// 	_GlobalLogLevel > 0)
			// {
			// 	_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			// }

			// getSQLPool().getConnection(function(pError, pDBConnection)
			// {
			// 	pDBConnection.query(
			// 		pQuery.query.body,
			// 		pQuery.query.parameters,
			// 		// The MySQL library also returns the Fields as the third parameter
			// 		function(pError, pRows)
			// 		{
			// 			pDBConnection.release();
			// 			tmpResult.error = pError;
			// 			tmpResult.value = false;
			// 			try
			// 			{
			// 				tmpResult.value = pRows.insertId;
			// 			}
			// 			catch(pErrorGettingRowcount)
			// 			{
			// 				_Fable.log.warn('Error getting insert ID during create query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
			// 			}

			// 			tmpResult.executed = true;
			// 			return fCallback();
			// 		}
			// 	);
			// });
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var Read = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;
			pQuery.setDialect(_Dialect).buildReadQuery();

			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
			{
				_Fable.log.trace(pQuery.query.body, pQuery.query.records);
			}

			let tmpURL = buildURL(pQuery.query.body);

			let tmpRequestOptions = (
			{
				url: tmpURL,
				headers: libUnderscore.extend({cookie: ''}, _Headers)
			});
	
			tmpRequestOptions.headers.cookie = _Cookies.join(';');
	
			if (pQuery.logLevel > 0 ||
				_GlobalLogLevel > 0)
				_Fable.log.debug(`Beginning GET request`,tmpRequestOptions);
	
			libSimpleGet.get(tmpRequestOptions, (pError, pResponse)=>
				{
					tmpResult.error = pError;
					tmpResult.executed = true;
					if (pError)
					{
						return fCallBack(tmpResult);
					}

					let tmpData = '';
	
					pResponse.on('data', (pChunk)=>
						{
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
									_Fable.log.debug(`--> GET data chunk size ${pChunk.length}b received`);
							tmpData += pChunk;
						});
	
					pResponse.on('end', ()=>
						{
							if (tmpData)
								tmpResult.value = JSON.parse(tmpData);

							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
							{
								_Fable.log.debug(`==> GET completed data size ${tmpData.length}b received`,tmpResult);
							}
							fCallBack();
						});
				});
		};

		var Update = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			// pQuery.setDialect(_Dialect).buildUpdateQuery();

			// if (pQuery.logLevel > 0 ||
			// 	_GlobalLogLevel > 0)
			// {
			// 	_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			// }

			// getSQLPool().getConnection(function(pError, pDBConnection)
			// {
			// 	pDBConnection.query(
			// 		pQuery.query.body,
			// 		pQuery.query.parameters,
			// 		// The MySQL library also returns the Fields as the third parameter
			// 		function(pError, pRows)
			// 		{
			// 			pDBConnection.release();
			// 			tmpResult.error = pError;
			// 			tmpResult.value = pRows;
			// 			tmpResult.executed = true;
			// 			return fCallback();
			// 		}
			// 	);
			// });
		}

		var Delete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			// pQuery.setDialect(_Dialect).buildDeleteQuery();

			// if (pQuery.logLevel > 0 ||
			// 	_GlobalLogLevel > 0)
			// {
			// 	_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			// }

			// getSQLPool().getConnection(function(pError, pDBConnection)
			// {
			// 	pDBConnection.query
			// 	(
			// 		pQuery.query.body,
			// 		pQuery.query.parameters,
			// 		// The MySQL library also returns the Fields as the third parameter
			// 		function(pError, pRows)
			// 		{
			// 			pDBConnection.release();
			// 			tmpResult.error = pError;
			// 			tmpResult.value = false;
			// 			try
			// 			{
			// 				tmpResult.value = pRows.affectedRows;
			// 			}
			// 			catch(pErrorGettingRowcount)
			// 			{
			// 				_Fable.log.warn('Error getting affected rowcount during delete query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
			// 			}
			// 			tmpResult.executed = true;
			// 			return fCallback();
			// 		}
			// 	);
			// });
		};

		var Count = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;

			// pQuery.setDialect(_Dialect).buildCountQuery();

			// if (pQuery.logLevel > 0 ||
			// 	_GlobalLogLevel > 0)
			// {
			// 	_Fable.log.trace(pQuery.query.body, pQuery.query.parameters);
			// }

			// getSQLPool().getConnection(function(pError, pDBConnection)
			// {
			// 	pDBConnection.query(
			// 		pQuery.query.body,
			// 		pQuery.query.parameters,
			// 		// The MySQL library also returns the Fields as the third parameter
			// 		function(pError, pRows)
			// 		{
			// 			pDBConnection.release();
			// 			tmpResult.executed = true;
			// 			tmpResult.error = pError;
			// 			tmpResult.value = false;
			// 			try
			// 			{
			// 				tmpResult.value = pRows[0].RowCount;
			// 			}
			// 			catch(pErrorGettingRowcount)
			// 			{
			// 				_Fable.log.warn('Error getting rowcount during count query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
			// 			}
			// 			return fCallback();
			// 		}
			// 	);
			// });
		};

		var tmpNewProvider = (
		{
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
