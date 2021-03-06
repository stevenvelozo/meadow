Meadow
======

A Javascript Data Broker.

[![Coverage Status](https://coveralls.io/repos/stevenvelozo/meadow/badge.svg?branch=master)](https://coveralls.io/r/stevenvelozo/meadow?branch=master)
[![Build Status](https://travis-ci.org/stevenvelozo/meadow.svg?branch=master)](https://travis-ci.org/stevenvelozo/meadow)
[![Dependency Status](https://david-dm.org/stevenvelozo/meadow.svg)](https://david-dm.org/stevenvelozo/meadow)
[![devDependency Status](https://david-dm.org/stevenvelozo/meadow/dev-status.svg)](https://david-dm.org/stevenvelozo/meadow#info=devDependencies)

Who doesn't love writing the same code over and over again? Good question. Anybody who doesn't probably wants something to do simple data access stuff. And some of the complicated interactions as well. Meadow aims to provide a simple “magic where you want it, programmability where you don't” pattern.

## Install

```sh
$ npm install meadow
```

Because meadow requires the [fable](https://github.com/stevenvelozo/fable) library, you will also need to install that dependency:

```sh
$ npm install fable
```

## Quick Start

It is pretty easy to perform CRUD access on your database.  And facilities are there to go crazy with custom queries and stored procedures.

```js
// These settings are read automatically from the fable.settings object by meadow
var databaseSettings = {
	MySQL:
		{
			Server: "localhost",
			Port: 3306,
			User: "root",
			Password: "",
			Database: "sales_data",
			ConnectionPoolLimit: 20
		}
};

var fable = require('fable').new();

// Create a MySQL connection pool (assuming MySQL is the provider you are using)
var libMySQL = require('mysql2');
fable.MeadowMySQLConnectionPool = libMySQL.createPool
	(
		{
			connectionLimit: _Fable.settings.MySQL.ConnectionPoolLimit,
			host: _Fable.settings.MySQL.Server,
			port: _Fable.settings.MySQL.Port,
			user: _Fable.settings.MySQL.User,
			password: _Fable.settings.MySQL.Password,
			database: _Fable.settings.MySQL.Database,
			namedPlaceholders: true
		}
	);


// Create a new meadow DAL object for the "Customers" data set
var meadow = require('meadow').new(fable, 'Customers')
		.setProvider('MySQL')
		.setDefaultIdentifier('customerID');

// Construct a query, filtering to a specific customer, number 17
var queryDescription = meadow.query.addFilter('customerID', 17);

// Now pass the read query into the customer DAL, with a callback
meadow.doRead(queryDescription,
		function(error, query, customer)
		{
			// The customer parameter will contain a javascript object if there is:
			//   1) a record with customerID = 17
			//   2) in the customers table
			//   3) in the sales_data database
			if (error)
			{
				return console.log('Error querying customer data: '+error);
			}
			console.log('Found customer ID '+customer.customerID+' who is named '+customer.name);
		}
	);
```

## You can also use the ALASQL persistence engine

```js
// These settings are read automatically from the fable.settings object by meadow
var fable = require('fable').new();

// Create the IndexdDB database [example], attach and use it
var libALASQL = require('alasql');
libALASQL('CREATE INDEXEDDB DATABASE IF NOT EXISTS example;');
libALASQL('ATTACH INDEXEDDB DATABASE example;');
libALASQL('USE example;');
fable.ALASQL = libALASQL;



// Create a new meadow DAL object for the "Customers" data set
var meadow = require('meadow').new(fable, 'Customers')
		.setProvider('ALASQL')
		.setDefaultIdentifier('customerID');

// Construct a query, filtering to a specific customer, number 17
var queryDescription = meadow.query.addFilter('customerID', 17);

// Now pass the read query into the customer DAL, with a callback
meadow.doRead(queryDescription,
		function(error, query, customer)
		{
			// The customer parameter will contain a javascript object if there is:
			//   1) a record with customerID = 17
			//   2) in the customers table
			//   3) in the sales_data database
			if (error)
			{
				return console.log('Error querying customer data: '+error);
			}
			console.log('Found customer ID '+customer.customerID+' who is named '+customer.name);
		}
	);
```