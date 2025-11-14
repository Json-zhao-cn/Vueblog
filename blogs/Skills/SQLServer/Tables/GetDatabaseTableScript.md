---
title: Get the data all tables create table script in the SQL Server
date: 2025/11/14
tags:
 - SQLServer
categories:
 - Skills
---

#### Get the data all tables create table script in the SQL Server
#####  In the target database,I create a TestA db. I want to copy all table structure in the source database TestB.
1. `Solution A`: Get all tables create table and index script in the source db TestB,then, execute those script in the target database TestA.This is get all table create and index script .
```sql
-- Get Database Table create and index scripts
DECLARE @TableName NVARCHAR(255);
DECLARE @SchemaName NVARCHAR(255);
DECLARE @SQL NVARCHAR(MAX);

DECLARE table_cursor CURSOR FOR
SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_SCHEMA, TABLE_NAME;

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @SchemaName, @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    ----------------------------------------------------------------------
    -- CREATE TABLE script
    ----------------------------------------------------------------------
    SET @SQL = (
        SELECT 'CREATE TABLE [' + @SchemaName + '].[' + @TableName + '] (' + CHAR(10) +
               STUFF((
                   SELECT ',' + CHAR(10) +
                          '    [' + c.COLUMN_NAME + '] ' +
                          c.DATA_TYPE +
                          -- Length / precision
                          CASE 
                               WHEN c.DATA_TYPE IN ('varchar','char','varbinary','nvarchar','nchar') 
                                    THEN '(' + CASE WHEN c.CHARACTER_MAXIMUM_LENGTH = -1 
                                                    THEN 'MAX' 
                                                    ELSE CAST(c.CHARACTER_MAXIMUM_LENGTH AS VARCHAR) END + ')'
                               WHEN c.DATA_TYPE IN ('decimal','numeric')
                                    THEN '(' + CAST(c.NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(c.NUMERIC_SCALE AS VARCHAR) + ')'
                               ELSE ''
                          END +
                          -- Identity
                          CASE WHEN COLUMNPROPERTY(OBJECT_ID(@SchemaName + '.' + @TableName), c.COLUMN_NAME, 'IsIdentity') = 1 
                               THEN ' IDENTITY(1,1)' ELSE '' END +
                          -- Default
                          ISNULL(' DEFAULT ' + dc.definition, '') +
                          -- Nullability
                          CASE WHEN c.IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END
                   FROM INFORMATION_SCHEMA.COLUMNS c
                   LEFT JOIN sys.default_constraints dc 
                     ON dc.parent_object_id = OBJECT_ID(@SchemaName + '.' + @TableName) 
                    AND dc.parent_column_id = COLUMNPROPERTY(OBJECT_ID(@SchemaName + '.' + @TableName), c.COLUMN_NAME, 'ColumnId')
                   WHERE c.TABLE_SCHEMA = @SchemaName AND c.TABLE_NAME = @TableName
                   ORDER BY c.ORDINAL_POSITION
                   FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') +
               -- Primary Key constraint
               ISNULL((
                   SELECT ',' + CHAR(10) + '    CONSTRAINT [' + kc.name + '] PRIMARY KEY ' + kc.type_desc + ' (' +
                          STUFF((
                              SELECT ', [' + c2.name + ']'
                              FROM sys.index_columns ic
                              JOIN sys.columns c2 ON ic.object_id = c2.object_id AND ic.column_id = c2.column_id
                              WHERE ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
                              ORDER BY ic.key_ordinal
                              FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') +
                          ')'
                   FROM sys.key_constraints kc
                   INNER JOIN sys.tables t2 ON kc.parent_object_id = t2.object_id
                   INNER JOIN sys.schemas s2 ON t2.schema_id = s2.schema_id
                   WHERE s2.name = @SchemaName AND t2.name = @TableName
               ), '') +
               CHAR(10) + ');'
    );

    PRINT @SQL;
    PRINT CHAR(10);

    ----------------------------------------------------------------------
    -- CREATE INDEX scripts
    ----------------------------------------------------------------------
    SET @SQL = (
        SELECT STUFF((
            SELECT CHAR(10) +
                   'CREATE ' +
                   CASE WHEN i.is_unique = 1 THEN 'UNIQUE ' ELSE '' END +
                   i.type_desc + ' INDEX [' + i.name + '] ON [' + s.name + '].[' + t.name + '] (' +
                       STUFF((
                           SELECT ', [' + c.name + ']'
                           FROM sys.index_columns ic
                           JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                           WHERE ic.object_id = i.object_id
                             AND ic.index_id = i.index_id
                             AND ic.is_included_column = 0
                           ORDER BY ic.key_ordinal
                           FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') +
                   ')' +
                   -- Included columns
                   ISNULL((
                       SELECT ' INCLUDE (' +
                              STUFF((
                                  SELECT ', [' + c2.name + ']'
                                  FROM sys.index_columns ic2
                                  JOIN sys.columns c2 ON ic2.object_id = c2.object_id AND ic2.column_id = c2.column_id
                                  WHERE ic2.object_id = i.object_id
                                    AND ic2.index_id = i.index_id
                                    AND ic2.is_included_column = 1
                                  FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') +
                              ')'
                   ), '') + ';'
            FROM sys.indexes i
            INNER JOIN sys.tables t ON i.object_id = t.object_id
            INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
            WHERE s.name = @SchemaName
              AND t.name = @TableName
              AND i.is_primary_key = 0
              AND i.is_unique_constraint = 0
              AND i.type_desc <> 'HEAP'
            FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
    );

    IF @SQL IS NOT NULL AND LEN(@SQL) > 0
    BEGIN
        PRINT @SQL;
        PRINT CHAR(10);
    END

    FETCH NEXT FROM table_cursor INTO @SchemaName, @TableName;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;

```

2. `Solution B`: Using `SSMS` SQL Server Management Studio to do it.
- 1. Open SSMS;
- 2. Choose your db;
- 3. Right click, choose `tasks`;
- 4. Choose `Generate scripts`
-  ![Generate scripts](./generateScripts.png)
- 5. Click `Choose Objects`, and select `Select specific database objects`,you can choose `Tables`,`Stored procedure`,`views`
- 6. Click `next`, you will `Set Scripting Options`
- ![Scripting options](./ChooseObjects.png)
- 7. If there are so many tables in your database, recommand select `Save as script file`;otherwise,select `Open in the new query windows`
- ![ScriptDone](./ScriptDone.png)
- 8. Replace the database as yourDB, and execute it;
- 