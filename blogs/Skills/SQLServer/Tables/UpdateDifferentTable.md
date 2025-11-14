---
title: Update the different table in the SQL Server
date: 2025/11/14
tags:
 - SQLServer
categories:
 - Skills
---

#### Update the different table in the SQL Server
1. `Requirement`: I want to update RESOURCE_ table WorkCenter based on the WIP_LINE_WORK_CENTER column WorkCenter. They are the different table.
2. `Solution`: Update two different table, we can use SQL Server `row_number` function
```sql
select 
    a.ID,
	m.id,
    a.workcenter,
	n.WorkCenter
--update RESOURCE_
--set WorkCenter=n.WorkCenter
from RESOURCE_ a
join (select 
        row_number() over (order by a.id asc) rownumber,
        a.ID,
        A.WorkCenter
    from RESOURCE_ a 
    where a.Active=1
    and a.Name like 'Carrier_T1%'
    and a.ProductionLine='T1_TC1') m on m.ID=a.ID
join  (select 
        row_number() over (order by B.GROUP_ asc) rownumber,
        B.WorkCenter
    from WIP_LINE_WORK_CENTER a 
    JOIN WORK_CENTER_GROUP B ON A.WorkCenter=B.WorkCenter
    where a.ProductionLineNo='T1_TC1'
    AND B.GroupType=3) n on m.rownumber=n.rownumber
where 1=1
```