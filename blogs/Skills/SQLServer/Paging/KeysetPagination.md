---
title: SQL Server Keyset Pagination

date: 2025/11/14
tags:
 - SQLServer
categories:
 - Skills
---

### SQL Server Keyset Pagination
#### **Why we need the Keyset Pagination in the SQL Server?**
We use the Keyset Pagination to solve the performance problems of traditional pagination methods (such as OFFSET-FETCH) when dealing with large data sets.
1. When we use the offset, it has two problems:
- 1. SQL Server needs to scan and skip the first 10,000 lines;
- 2. As the OFFSET value increases, the performance decreases linearly

2. Why Keyset Pagination?
- 1. **Direct positioning**: Directly locate to the starting position through the index;
- 2. **Avoid full scan**: There is no need to scan and skip the previous rows;
- 3. **Index utilization**: Make full use of the orderliness of indexes;
- 4. **Reduce I/O**


#### **How to do it?**
##### 1. GetMaxID in the first page
1. Get MaxID or MaxName in the first page, the primary key is best choose.Then, remember this current MaxID or MaxName;
```sql
SELECT MAX(ID) AS MaxID
FROM (
    SELECT TOP (10000) ID
    FROM TabelA
    WHERE ID > 0
    AND COALESCE(LastUpdateOn, CreatedOn) > DATEADD(YEAR, -1, GETUTCDATE())
    ORDER BY ID ASC
) AS T;

```
#### 2. GetMaxID in the second page
1. use first page MaxID as condition,Get MaxID in the second page, the primary key is best choose.Then, remember this current MaxID;
```sql
SELECT MAX(ID) AS MaxID
FROM (
    SELECT TOP (10000) ID
    FROM TabelA
    WHERE ID > (MaxID)
    AND COALESCE(LastUpdateOn, CreatedOn) > DATEADD(YEAR, -1, GETUTCDATE())
    ORDER BY ID ASC
) AS T;
```

#### 3. If you don't have the PK in your table,you can find the mutiple columns as PK, and you need to create the index for this.