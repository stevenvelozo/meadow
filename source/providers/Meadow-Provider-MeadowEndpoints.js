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

		var buildRequestOptions = function(pQuery)
		{
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
				_Fable.log.debug(`Request options built...`,tmpRequestOptions);

				return tmpRequestOptions;
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
			pQuery.setDialect(_Dialect).buildCreateQuery();

			let tmpRequestOptions = buildRequestOptions(pQuery);

			// TODO: Should this test for exactly one?
			if (!pQuery.query.records.length > 0)
			{
				tmpResult.error = 'No records passed for proxying to Meadow-Endpoints.';

				return fCallback();
			}

			tmpRequestOptions.body = pQuery.query.records[0];
			tmpRequestOptions.json = true;
	
			libSimpleGet.post(tmpRequestOptions, (pError, pResponse)=>
				{
					tmpResult.error = pError;
					tmpResult.executed = true;

					if (pQuery.logLevel > 0 ||
						_GlobalLogLevel > 0)
							_Fable.log.debug(`--> POST request connected`);

					if (pError)
					{
						return fCallback(tmpResult);
					}

					let tmpData = '';
	
					pResponse.on('data', (pChunk)=>
						{
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
									_Fable.log.debug(`--> POST data chunk size ${pChunk.length}b received`);
							tmpData += pChunk;
						});
	
					pResponse.on('end', ()=>
						{
							if (tmpData)
								tmpResult.value = JSON.parse(tmpData);

							// TODO Because this was proxied, read happens at this layer too.  Inefficient -- fixable
							let tmpIdentityColumn = `ID${pQuery.parameters.scope}`;
							if (tmpResult.value.hasOwnProperty(tmpIdentityColumn))
							tmpResult.value = tmpResult.value[tmpIdentityColumn];
							
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
							{
								_Fable.log.debug(`==> POST completed data size ${tmpData.length}b received`,tmpResult);
							}
							return fCallback();
						});
				});
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var Read = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;
			pQuery.setDialect(_Dialect).buildReadQuery();

			let tmpRequestOptions = buildRequestOptions(pQuery);
	
			libSimpleGet.get(tmpRequestOptions, (pError, pResponse)=>
				{
					tmpResult.error = pError;
					tmpResult.executed = true;

					if (pQuery.logLevel > 0 ||
						_GlobalLogLevel > 0)
							_Fable.log.debug(`--> GET request connected`);

					if (pError)
					{
						return fCallback(tmpResult);
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

							if (pQuery.query.body.startsWith(`${pQuery.parameters.scope}/`))
							{
								// If this is not a plural read, make the result into an array.
								tmpResult.value = [tmpResult.value];
							}

							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
							{
								_Fable.log.debug(`==> GET completed data size ${tmpData.length}b received`,tmpResult);
							}
							fCallback();
						});
				});
		};

		var Update = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;
			pQuery.setDialect(_Dialect).buildUpdateQuery();

			let tmpRequestOptions = buildRequestOptions(pQuery);

			// TODO: Should this test for exactly one?
			if (!pQuery.query.records.length > 0)
			{
				tmpResult.error = 'No records passed for proxying to Meadow-Endpoints.';

				return fCallback();
			}

			tmpRequestOptions.body = pQuery.query.records[0];
			tmpRequestOptions.json = true;
	
			libSimpleGet.put(tmpRequestOptions, (pError, pResponse)=>
				{
					tmpResult.error = pError;
					tmpResult.executed = true;

					if (pQuery.logLevel > 0 ||
						_GlobalLogLevel > 0)
							_Fable.log.debug(`--> PUT request connected`);

					if (pError)
					{
						return fCallback(tmpResult);
					}

					let tmpData = '';
	
					pResponse.on('data', (pChunk)=>
						{
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
									_Fable.log.debug(`--> PUT data chunk size ${pChunk.length}b received`);
							tmpData += pChunk;
						});
	
					pResponse.on('end', ()=>
						{
							if (tmpData)
								tmpResult.value = JSON.parse(tmpData);

							// TODO Because this was proxied, read happens at this layer too.  Inefficient -- fixable
							let tmpIdentityColumn = `ID${pQuery.parameters.scope}`;
							if (tmpResult.value.hasOwnProperty(tmpIdentityColumn))
							tmpResult.value = tmpResult.value[tmpIdentityColumn];
							
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
							{
								_Fable.log.debug(`==> PUT completed data size ${tmpData.length}b received`,tmpResult);
							}
							return fCallback();
						});
				});
		}

		var Delete = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;
			pQuery.setDialect(_Dialect).buildDeleteQuery();


			let tmpRequestOptions = buildRequestOptions(pQuery);
	
			libSimpleGet.delete(tmpRequestOptions, (pError, pResponse)=>
				{
					tmpResult.error = pError;
					tmpResult.executed = true;

					if (pQuery.logLevel > 0 ||
						_GlobalLogLevel > 0)
							_Fable.log.debug(`--> DEL request connected`);

					if (pError)
					{
						return fCallback(tmpResult);
					}

					let tmpData = '';
	
					pResponse.on('data', (pChunk)=>
						{
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
									_Fable.log.debug(`--> DEL data chunk size ${pChunk.length}b received`);
							tmpData += pChunk;
						});
	
					pResponse.on('end', ()=>
						{
							if (tmpData)
								tmpResult.value = JSON.parse(tmpData);
							
							if (tmpResult.value.hasOwnProperty('Count'))
								tmpResult.value = tmpResult.value.Count;
	

							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
							{
								_Fable.log.debug(`==> DEL completed data size ${tmpData.length}b received`,tmpResult);
							}
							fCallback();
						});
				});
			};

		var Count = function(pQuery, fCallback)
		{
			var tmpResult = pQuery.parameters.result;
			pQuery.setDialect(_Dialect).buildCountQuery();

			let tmpRequestOptions = buildRequestOptions(pQuery);
	
			libSimpleGet.get(tmpRequestOptions, (pError, pResponse)=>
				{
					tmpResult.error = pError;
					tmpResult.executed = true;

					if (pQuery.logLevel > 0 ||
						_GlobalLogLevel > 0)
							_Fable.log.debug(`--> GET request connected`);

					if (pError)
					{
						return fCallback(tmpResult);
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

								try
								{
									tmpResult.value = tmpResult.value.Count;
								}
								catch(pErrorGettingRowcount)
								{
									// This is an error state...
									tmpResult.value = -1;
									_Fable.log.warn('Error getting rowcount during count query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
								}
		
							if (pQuery.logLevel > 0 ||
								_GlobalLogLevel > 0)
							{
								_Fable.log.debug(`==> GET completed data size ${tmpData.length}b received`,tmpResult);
							}
							fCallback();
						});
				});
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
