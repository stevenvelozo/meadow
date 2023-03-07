/**
* @license MIT
* @author <steven@velozo.com>
*/

class MeadowProviderBase
{
	constructor(pMeadow)
	{
		this.Meadow = pMeadow;
		this.Fable = this.Meadow.fable;

		this._Dialect = `English`;
	}

	marshalRecordFromSourceToObject(pRecord)
	{
		// Do nothing ... this is the base provider after all
		return pRecord;
	};

	createTableDynamically()
	{
		return false;
	};

	Create(pQuery, fCallback)
	{
		// No operation -- base class!
		pQuery.parameters.result.executed = true;
		return fCallback();
	};

	// This is a synchronous read, good for a few records.
	// TODO: Add a pipe-able read for huge sets
	Read(pQuery, fCallback)
	{
		// No operation -- base class!
		pQuery.parameters.result.executed = true;
		pQuery.parameters.result.value = [true];
		return fCallback();
	};

	Update(pQuery, fCallback)
	{
		// No operation -- base class!
		pQuery.parameters.result.executed = true;
		return fCallback();
	};

	Delete(pQuery, fCallback)
	{
		// No operation -- base class!
		pQuery.parameters.result.executed = true;
		return fCallback();
	};

	Undelete(pQuery, fCallback)
	{
		// No operation -- base class!
		pQuery.parameters.result.executed = true;
		return fCallback();
	};

	Count(pQuery, fCallback)
	{
		// No operation -- base class!
		pQuery.parameters.result.executed = true;
		return fCallback();
	};
}

module.exports = MeadowProviderBase;
