---
title: offset pagination optimization in the SQL Server

date: 2025/11/14
tags:
 - SQLServer
categories:
 - Skills
---

#### offset pagination optimization in the SQL Server
##### 🔍 Problem with `OFFSET`

When you use:

```sql
ORDER BY some_column
OFFSET 100000 ROWS
FETCH NEXT 10 ROWS ONLY;
```

SQL Server **must scan and skip 100,000 rows**, even if you're only fetching 10. The more rows skipped, the **slower** the query becomes.

---

##### ✅ Optimization Techniques

###### 1. **Use Seek Method (Keyset Pagination)**

Instead of offsetting rows, track the last seen value:

```sql
-- Assuming ordered by ID
SELECT TOP 10 *
FROM table
WHERE ID > @LastSeenId
ORDER BY ID;
```

This is **much faster** as it leverages **index seek** instead of scanning all previous rows.

---

###### 2. **Covering Index**

Ensure your `ORDER BY` column is **indexed** and that the index **includes** all selected columns:

```sql
CREATE NONCLUSTERED INDEX idx_order_id_includes
ON table (ID)
INCLUDE (col1, col2, ...);
```

This avoids lookups and reduces I/O.

---

###### 3. **Use Temporary Tables for Large Pagination**

For deep pages, consider breaking the query into parts and **store intermediate results**:

```sql
SELECT ID
INTO #TempIDs
FROM table
ORDER BY ID
OFFSET 100000 ROWS
FETCH NEXT 10 ROWS ONLY;

SELECT t.*
FROM table t
JOIN #TempIDs temp ON t.ID = temp.ID;
```

---

###### 4. **Limit Deep Pagination**

Set a **maximum page limit** (e.g. don't allow users to go past 1000 pages). If needed, switch to export/download or cursor-based scrolling for large data sets.

---

###### 5. **Use `ROW_NUMBER()` Wisely**

Alternative pagination using `ROW_NUMBER()`:

```sql
WITH CTE AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY ID) AS rn
    FROM table
)
SELECT *
FROM CTE
WHERE rn BETWEEN @Start AND @End;
```

⚠️ Still suffers from performance issues on large sets but can be tuned with proper indexing.

---

###### 6. **Tune Statistics and Maintenance**

Ensure your table stats are **up-to-date**:

```sql
UPDATE STATISTICS table_name;
```

Also, **rebuild indexes** regularly for high-volume tables.

---

##### 🧪 Performance Benchmarking

Use **`SET STATISTICS IO ON`** and **`SET STATISTICS TIME ON`** to measure improvements:

```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
-- your query
```

---

##### 🛠️ When OFFSET is Unavoidable

* Use `OFFSET` only with **small page numbers**.
* Avoid using `OFFSET` without `ORDER BY`.
* Prefer **clustered index order** when paginating.

---

##### Summary

| Technique              | Use When                            | Benefit                        |
| ---------------------- | ----------------------------------- | ------------------------------ |
| Keyset Pagination      | You can track last-seen keys        | Fast, Index Seek-based         |
| Covering Index         | Order + Filter on same index        | Low I/O                        |
| Temp Tables            | Complex joins, very large OFFSET    | Breaks heavy query into pieces |
| Limit Pagination Depth | UX does not require deep navigation | Avoids heavy queries           |

---