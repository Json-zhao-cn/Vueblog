---
title: Create same table in the SQL Server
date: 2024/10/5
tags:
 - SQLServer
categories:
 - Skills
---

#### Create same structure table in the SQL Server
##### 1. Create the same table and copy data
```sql
SELECT * INTO NewTable FROM OriginalTable;
```

##### 2. Create the same structure table,`don't copy data`
```sql
SELECT * INTO NewTable FROM OriginalTable WHERE 1 = 0;
```