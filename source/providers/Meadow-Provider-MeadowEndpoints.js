/**
* @license MIT
* @author <steven@velozo.com>
*/
let libMeadowProviderBase = require('./Meadow-Provider-Base.js');

const libSimpleGet = require('simple-get');

class MeadowProviderMeadowEndpoints extends libMeadowProviderBase
{
	constructor(pMeadow)
	{
		super(pMeadow);

		this._GlobalLogLevel = 0;

		this._Dialect = 'MeadowEndpoints';

		this._Headers = {};
		this._Cookies = [];

		this._EndpointSettings = (this.Fable.settings.hasOwnProperty('MeadowEndpoints')) ? JSON.parse(JSON.stringify(this.Fable.settings.MeadowEndpoints)) : (
			{
				ServerProtocol: 'http',
				ServerAddress: '127.0.0.1',
				ServerPort: '8086',
				ServerEndpointPrefix: '1.0/'
			});
	}

	buildURL(pAddress)
	{
		return `${this._EndpointSettings.ServerProtocol}://${this._EndpointSettings.ServerAddress}:${this._EndpointSettings.ServerPort}/${this._EndpointSettings.ServerEndpointPrefix}${pAddress}`;
	};

	buildRequestOptions(pQuery)
	{
		if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
		{
			this.Meadow.log.trace(pQuery.query.body, pQuery.query.records);
		}

		let tmpURL = this.buildURL(pQuery.query.body);

		let tmpRequestOptions = (
		{
			url: tmpURL,
			headers: this.Fable.Utility.extend({cookie: ''}, this._Headers)
		});

		tmpRequestOptions.headers.cookie = this._Cookies.join(';');

		if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
		{
			this.Meadow.log.debug(`Request options built...`, tmpRequestOptions);
		}

		return tmpRequestOptions;
	};

	// The Meadow marshaller also passes in the Schema as the third parameter, but this is a blunt function ATM.
	marshalRecordFromSourceToObject(pObject, pRecord)
	{
		for(let tmpColumn in pRecord)
		{
			pObject[tmpColumn] = pRecord[tmpColumn];
		}
	};

	Create(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;

		pQuery.setDialect(this._Dialect).buildCreateQuery();

		let tmpRequestOptions = this.buildRequestOptions(pQuery);

		// TODO: Should this test for exactly one?
		if (!pQuery.query.records.length > 0)
		{
			tmpResult.error = 'No records passed for proxying to Meadow-Endpoints.';
			return fCallback();
		}

		tmpRequestOptions.body = pQuery.query.records[0];
		tmpRequestOptions.json = true;

		libSimpleGet.post(tmpRequestOptions,
			(pError, pResponse) =>
			{
				tmpResult.error = pError;
				tmpResult.executed = true;

				if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
				{
					this.Meadow.log.debug(`--> POST request connected`);
				}

				if (pError)
				{
					return fCallback(tmpResult);
				}

				let tmpData = '';

				pResponse.on('data', (pChunk)=>
					{
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`--> POST data chunk size ${pChunk.length}b received`);
						}
						tmpData += pChunk;
					});

				pResponse.on('end', ()=>
					{
						if (tmpData)
						{
							tmpResult.value = JSON.parse(tmpData);
						}

						// TODO Because this was proxied, read happens at this layer too.  Inefficient -- fixable
						let tmpIdentityColumn = `ID${pQuery.parameters.scope}`;
						if (tmpResult.value.hasOwnProperty(tmpIdentityColumn))
						{
							tmpResult.value = tmpResult.value[tmpIdentityColumn];
						}

						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`==> POST completed data size ${tmpData.length}b received`,tmpResult);
						}

						return fCallback();
					});
			});
	};

	// This is a synchronous read, good for a few records.
	// TODO: Add a pipe-able read for huge sets
	Read(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;
		pQuery.setDialect(this._Dialect).buildReadQuery();

		let tmpRequestOptions = this.buildRequestOptions(pQuery);

		libSimpleGet.get(tmpRequestOptions, (pError, pResponse)=>
			{
				tmpResult.error = pError;
				tmpResult.executed = true;

				if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
				{
					this.Meadow.log.debug(`--> GET request connected`);
				}

				if (pError)
				{
					return fCallback(tmpResult);
				}

				let tmpData = '';

				pResponse.on('data', (pChunk)=>
					{
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`--> GET data chunk size ${pChunk.length}b received`);
						}
						tmpData += pChunk;
					});

				pResponse.on('end', ()=>
					{
						if (tmpData)
						{
							tmpResult.value = JSON.parse(tmpData);
						}

						if (pQuery.query.body.startsWith(`${pQuery.parameters.scope}/`))
						{
							// If this is not a plural read, make the result into an array.
							tmpResult.value = [tmpResult.value];
						}

						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`==> GET completed data size ${tmpData.length}b received`,tmpResult);
						}

						fCallback();
					});
			});
	};

	Update(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;
		pQuery.setDialect(this._Dialect).buildUpdateQuery();

		let tmpRequestOptions = this.buildRequestOptions(pQuery);

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

				if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
				{
					this.Meadow.log.debug(`--> PUT request connected`);
				}

				if (pError)
				{
					return fCallback(tmpResult);
				}

				let tmpData = '';

				pResponse.on('data', (pChunk)=>
					{
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`--> PUT data chunk size ${pChunk.length}b received`);
						}
						tmpData += pChunk;
					});

				pResponse.on('end', ()=>
					{
						if (tmpData)
						{
							tmpResult.value = JSON.parse(tmpData);
						}

						// TODO Because this was proxied, read happens at this layer too.  Inefficient -- fixable
						let tmpIdentityColumn = `ID${pQuery.parameters.scope}`;
						if (tmpResult.value.hasOwnProperty(tmpIdentityColumn))
						{
						tmpResult.value = tmpResult.value[tmpIdentityColumn];
						}
						
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`==> PUT completed data size ${tmpData.length}b received`,tmpResult);
						}
						return fCallback();
					});
			});
	};

	Delete(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;
		pQuery.setDialect(this._Dialect).buildDeleteQuery();

		let tmpRequestOptions = this.buildRequestOptions(pQuery);

		libSimpleGet.delete(tmpRequestOptions, (pError, pResponse)=>
			{
				tmpResult.error = pError;
				tmpResult.executed = true;

				if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
				{
					this.Meadow.log.debug(`--> DEL request connected`);
				}

				if (pError)
				{
					return fCallback(tmpResult);
				}

				let tmpData = '';

				pResponse.on('data', (pChunk)=>
					{
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`--> DEL data chunk size ${pChunk.length}b received`);
						}
						tmpData += pChunk;
					});

				pResponse.on('end', ()=>
					{
						if (tmpData)
						{
							tmpResult.value = JSON.parse(tmpData);
						}
						
						if (tmpResult.value.hasOwnProperty('Count'))
						{
							tmpResult.value = tmpResult.value.Count;
						}


						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`==> DEL completed data size ${tmpData.length}b received`,tmpResult);
						}
						fCallback();
					});
			});
	};

	Count(pQuery, fCallback)
	{
		let tmpResult = pQuery.parameters.result;
		pQuery.setDialect(this._Dialect).buildCountQuery();

		let tmpRequestOptions = this.buildRequestOptions(pQuery);

		libSimpleGet.get(tmpRequestOptions, (pError, pResponse)=>
			{
				tmpResult.error = pError;
				tmpResult.executed = true;

				if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
				{
					this.Meadow.log.debug(`--> GET request connected`);
				}

				if (pError)
				{
					return fCallback(tmpResult);
				}

				let tmpData = '';

				pResponse.on('data', (pChunk)=>
					{
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`--> GET data chunk size ${pChunk.length}b received`);
						}
						tmpData += pChunk;
					});

				pResponse.on('end', ()=>
					{
						if (tmpData)
						{
							tmpResult.value = JSON.parse(tmpData);
						}

						try
						{
							tmpResult.value = tmpResult.value.Count;
						}
						catch(pErrorGettingRowcount)
						{
							// This is an error state...
							tmpResult.value = -1;
							this.Meadow.log.warn('Error getting rowcount during count query',{Body:pQuery.query.body, Parameters:pQuery.query.parameters});
						}
	
						if (pQuery.logLevel > 0 || this._GlobalLogLevel > 0)
						{
							this.Meadow.log.debug(`==> GET completed data size ${tmpData.length}b received`,tmpResult);
						}

						fCallback();
					});
			});
	};
};

module.exports = MeadowProviderMeadowEndpoints;
