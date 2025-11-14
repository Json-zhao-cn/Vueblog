---
title: Convert XML to Json in the SQL Server
date: 2024/10/5
tags:
 - SQLServer
categories:
 - Skills
---


#### User SQLFuncation to convert XML to Json in the SQL Server
1. UserFuncation
```sql
USE [YourDB]
GO
/****** 
	Object:  UserDefinedFunction [dbo].[AF_XmlToJson]    
	Author: json zhao
	Script Date: 5/10/2024 5:13:42 PM 
******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[AF_XmlToJson]
(
	@XML XML
)
RETURNS NVARCHAR(MAX)
AS
BEGIN
DECLARE @Input XML = @XML;

-----------Temp Table 1-------------------

DECLARE @TempTable1 TABLE (
	ID INT IDENTITY(1, 1) PRIMARY KEY
	,ColumnName NVARCHAR(MAX)
	,ColumnValue NVARCHAR(MAX)
	)
INSERT INTO @TempTable1
SELECT N.x.value('../@Key', 'NVARCHAR(MAX)')
	,'"' + N.x.value('(text())[1]', 'NVARCHAR(MAX)') + '"'
FROM @Input.nodes('//Inputs/PropertyBagItem/Value') N(x)


-----------Temp Table 2-------------------

DECLARE @TempTable2 TABLE (
	ID INT IDENTITY(1, 1) PRIMARY KEY
	,ColumnName NVARCHAR(100)
	,ColumnValue NVARCHAR(100)
	)
INSERT INTO @TempTable2
SELECT N.x.value('../../@Key', 'NVARCHAR(MAX)')
	,N.x.value('(text())[1]', 'NVARCHAR(MAX)')
FROM @Input.nodes('//Inputs/PropertyBagItem/Value/*') N(x)


---Build JSON-----

INSERT INTO @TempTable1
SELECT A.Columnname
	,A.List
FROM (
	SELECT ColumnName
		,'[' + STUFF((
				SELECT ', ' + '"' + case when ColumnValue is null then '' else ColumnValue end + '"'
				FROM @TempTable2
				WHERE ColumnName = t.ColumnName
				FOR XML PATH('')
					,TYPE
				).value('.', 'NVARCHAR(MAX)'), 1, 1, '') + ']' List
	FROM @TempTable2 t
	GROUP BY ColumnName
	) A

DECLARE @Result NVARCHAR(MAX) = (
		SELECT '{"' + STUFF((
					SELECT COALESCE('"' + ColumnName + '":' + ColumnValue + ',', '')
					FROM @TempTable1
					FOR XML PATH('')
						,TYPE
					).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
		);
DECLARE @JSON_Out NVARCHAR(MAX) = SUBSTRING(@Result, 1, LEN(@Result) - 1) + '}';

RETURN @JSON_Out;

END

```