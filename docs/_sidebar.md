- Getting Started

  - [Introduction](/)
  - [Quick Start](quick-start.md)
  - [Architecture](architecture.md)
  - [Configuration](configuration.md)

- Core Concepts

  - [Schema](schema/README.md)
  - [JSON Columns](schema/json-columns.md)
  - [Query DSL](query-dsl.md)
  - [Raw Queries](raw-queries.md)
  - [Audit Tracking](audit-tracking.md)
  - [Soft Deletes](soft-deletes.md)

- CRUD Operations

  - [Overview](query/README.md)
  - [Create](query/create.md)
  - [Read](query/read.md)
  - [Update](query/update.md)
  - [Delete](query/delete.md)
  - [Count](query/count.md)

- Providers

  - [Overview](providers/README.md)
  - [MySQL](providers/mysql.md)
  - [MSSQL](providers/mssql.md)
  - [PostgreSQL](providers/postgresql.md)
  - [SQLite](providers/sqlite.md)
  - [MongoDB](providers/mongodb.md)
  - [RocksDB](providers/rocksdb.md)
  - [ALASQL](providers/alasql.md)
  - [MeadowEndpoints](providers/meadow-endpoints.md)

- API Reference

  - [Overview](api/reference.md)

  - CRUD Methods

    - [doCreate()](api/doCreate.md)
    - [doRead()](api/doRead.md)
    - [doReads()](api/doReads.md)
    - [doUpdate()](api/doUpdate.md)
    - [doDelete()](api/doDelete.md)
    - [doUndelete()](api/doUndelete.md)
    - [doCount()](api/doCount.md)

  - Configuration

    - [setProvider()](api/setProvider.md)
    - [setScope()](api/setScope.md)
    - [setSchema()](api/setSchema.md)
    - [setDefaultIdentifier()](api/setDefaultIdentifier.md)
    - [setIDUser()](api/setIDUser.md)
    - [setJsonSchema()](api/setJsonSchema.md)
    - [setDefault()](api/setDefault.md)
    - [setAuthorizer()](api/setAuthorizer.md)
    - [setDomain()](api/setDomain.md)
    - [loadFromPackage()](api/loadFromPackage.md)

  - Utility

    - [query (property)](api/query.md)
    - [rawQueries](api/rawQueries.md)
    - [validateObject()](api/validateObject.md)
    - [marshalRecordFromSourceToObject()](api/marshalRecordFromSourceToObject.md)
    - [getRoleName()](api/getRoleName.md)
