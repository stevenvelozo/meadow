
const _AnimalJsonSchema = (
    {
        title: "Animal",
        description: "A creature that lives in a meadow.",
        type: "object",
        properties: {
            IDAnimal: {
                description: "The unique identifier for an animal",
                type: "integer"
            },
            Name: {
                description: "The animal's name",
                type: "string"
            },
            Type: {
                description: "The type of the animal",
                type: "string"
            }
        },
        required: ["IDAnimal", "Name", "CreatingIDUser"]
    });
const _AnimalSchema = (
    [
        { Column: "IDAnimal",        Type:"AutoIdentity" },
        { Column: "GUIDAnimal",      Type:"AutoGUID" },
        { Column: "CreateDate",      Type:"CreateDate" },
        { Column: "CreatingIDUser",  Type:"CreateIDUser" },
        { Column: "UpdateDate",        Type:"UpdateDate" },
        { Column: "UpdatingIDUser", Type:"UpdateIDUser" },
        { Column: "Deleted",         Type:"Deleted" },
        { Column: "DeletingIDUser",  Type:"DeleteIDUser" },
        { Column: "DeleteDate",      Type:"DeleteDate" },
        { "Column": "Name",      "Type":"String" },
        { "Column": "Type",      "Type":"String" }
    ]);
const _AnimalDefault = (
    {
        IDAnimal: null,
        GUIDAnimal: '',
    
        CreateDate: false,
        CreatingIDUser: 0,
        UpdateDate: false,
        UpdatingIDUser: 0,
        Deleted: 0,
        DeleteDate: false,
        DeletingIDUser: 0,
    
        Name: 'Unknown',
        Type: 'Unclassified'
    });
var libALASQL = require('alasql');

const libFable = new (require('fable'))({
	LogStreams:
	[
		{
			streamtype:'default',
		},
		{
			streamtype: 'simpleflatfile',
            path: __dirname+'/Harness.log'
		}
	]
});

libFable.ALASQL = libALASQL;

const tmpDAL = require('../source/Meadow.js')
    .new(libFable, 'Animal')
    .setProvider('ALASQL')
    .setSchema(_AnimalSchema)
    .setJsonSchema(_AnimalJsonSchema)
    .setDefaultIdentifier('IDAnimal')
    .setDefault(_AnimalDefault);

tmpDAL.fable.settings.QueryThresholdWarnTime = 1;

