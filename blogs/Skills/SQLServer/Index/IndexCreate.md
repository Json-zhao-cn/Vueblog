---
title: Create Index in the SQL Server 
date: 2025/11/12
tags:
 - SQLServer
categories:
 - Skills
---

### Create Index in the SQL Server
```sql
-- Single-column index
CREATE INDEX IX_Products_CategoryID ON Products (CategoryID);

-- An index containing columns
CREATE INDEX IX_Orders_CustomerID ON Orders (CustomerID) INCLUDE (OrderDate, TotalAmount);

-- Filter index
CREATE INDEX IX_Active_Users ON Users (Email) WHERE IsActive = 1;

--- unique index
CREATE UNIQUE INDEX IX_WAREHOUSE_LOCATION_PK ON WAREHOUSE_LOCATION (Location);

--Multi-column unique index
CREATE UNIQUE INDEX IX_table_name_PK ON table_name (column1, column2, ...);
```