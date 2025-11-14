import{_ as n,c as a,a as e,o as l}from"./app-DZFgIm2e.js";const p={};function i(c,s){return l(),a("div",null,[...s[0]||(s[0]=[e(`<div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">USE</span> <span class="token punctuation">[</span>YourDataBase<span class="token punctuation">]</span></span>
<span class="line">GO</span>
<span class="line"><span class="token comment">/****** Object:  StoredProcedure [dbo].[usp_GetCdcTableData]    Script Date: 2025/11/10 13:58:27 ******/</span></span>
<span class="line"><span class="token keyword">SET</span> ANSI_NULLS <span class="token keyword">ON</span></span>
<span class="line">GO</span>
<span class="line"><span class="token keyword">SET</span> QUOTED_IDENTIFIER <span class="token keyword">ON</span></span>
<span class="line">GO</span>
<span class="line"></span>
<span class="line"><span class="token keyword">ALTER</span> <span class="token keyword">PROCEDURE</span> <span class="token punctuation">[</span>dbo<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token punctuation">[</span>usp_GetCdcTableData<span class="token punctuation">]</span></span>
<span class="line">    <span class="token variable">@PKColumns</span> NVARCHAR<span class="token punctuation">(</span><span class="token number">50</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token variable">@PageSize</span>  <span class="token keyword">INT</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token variable">@TableName</span> NVARCHAR<span class="token punctuation">(</span><span class="token number">50</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token keyword">AS</span></span>
<span class="line"><span class="token keyword">BEGIN</span></span>
<span class="line">    <span class="token keyword">SET</span> NOCOUNT <span class="token keyword">ON</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- INITIAL SETUP</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@CaptureInstance</span> SYSNAME <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@CdcTableName</span> SYSNAME <span class="token operator">=</span> <span class="token string">&#39;cdc.&#39;</span> <span class="token operator">+</span> <span class="token variable">@CaptureInstance</span> <span class="token operator">+</span> <span class="token string">&#39;_CT&#39;</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@Columns</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@LastSyncLSN</span> <span class="token keyword">BINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@LastSeqVal</span> <span class="token keyword">VARBINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@HasRemaining</span> <span class="token keyword">BIT</span> <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@NextLSN</span> <span class="token keyword">BINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@Where</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@sql</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- GET CAPTURED COLUMNS</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">SELECT</span> <span class="token variable">@Columns</span> <span class="token operator">=</span> STRING_AGG<span class="token punctuation">(</span><span class="token string">&#39;c.&#39;</span> <span class="token operator">+</span> QUOTENAME<span class="token punctuation">(</span>a<span class="token punctuation">.</span>column_name<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&#39;, &#39;</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">FROM</span> cdc<span class="token punctuation">.</span>captured_columns a</span>
<span class="line">    <span class="token keyword">JOIN</span> cdc<span class="token punctuation">.</span>change_tables b <span class="token keyword">ON</span> a<span class="token punctuation">.</span>object_id <span class="token operator">=</span> b<span class="token punctuation">.</span>object_id</span>
<span class="line">    <span class="token keyword">WHERE</span> b<span class="token punctuation">.</span>capture_instance <span class="token operator">=</span> <span class="token variable">@CaptureInstance</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- GET LAST SYNC POINT (TEMP DEFAULT FOR DEMO)</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">     <span class="token keyword">SELECT</span> <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> LastSyncLSN<span class="token punctuation">,</span> <span class="token variable">@LastSeqVal</span> <span class="token operator">=</span> SeqVal</span>
<span class="line">     <span class="token keyword">FROM</span> dbo<span class="token punctuation">.</span>CDC_Sync_Control</span>
<span class="line">     <span class="token keyword">WHERE</span> TableName <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">IF</span> <span class="token variable">@LastSyncLSN</span> <span class="token operator">IS</span> <span class="token boolean">NULL</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token keyword">SET</span> <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token number">0x00000000000000000000</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">SET</span> <span class="token variable">@LastSeqVal</span>  <span class="token operator">=</span> <span class="token number">0x00000000000000000000</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- DETERMINE QUERY START MODE</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">EXEC</span> dbo<span class="token punctuation">.</span><span class="token punctuation">[</span>usp_GetCdcQueryStartMode<span class="token punctuation">]</span> </span>
<span class="line">        <span class="token variable">@TableName</span> <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@LastSeqVal</span> <span class="token operator">=</span> <span class="token variable">@LastSeqVal</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token variable">@HasRemaining</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- COMPUTE CORRECT WHERE CONDITION</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">IF</span> <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token number">1</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token comment">-- Still have remaining rows in the same LSN</span></span>
<span class="line">        <span class="token keyword">SET</span> <span class="token variable">@Where</span> <span class="token operator">=</span> N<span class="token string">&#39;c.__$start_lsn = @LastSyncLSN AND c.__$seqval &gt; @LastSeqVal&#39;</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span></span>
<span class="line">    <span class="token keyword">ELSE</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token comment">-- Need to start from the NEXT LSN</span></span>
<span class="line">        <span class="token keyword">DECLARE</span> <span class="token variable">@getNextLSNsql</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span> <span class="token operator">=</span> </span>
<span class="line">            N<span class="token string">&#39;SELECT @NextLSN_OUT = MIN(__$start_lsn) </span>
<span class="line">              FROM &#39;</span> <span class="token operator">+</span> <span class="token variable">@CdcTableName</span> <span class="token operator">+</span> <span class="token string">&#39; </span>
<span class="line">              WHERE __$start_lsn &gt; @LastSyncLSN;&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">EXEC</span> sp_executesql</span>
<span class="line">            <span class="token variable">@getNextLSNsql</span><span class="token punctuation">,</span></span>
<span class="line">            N<span class="token string">&#39;@LastSyncLSN binary(10), @NextLSN_OUT binary(10) OUTPUT&#39;</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@NextLSN_OUT</span> <span class="token operator">=</span> <span class="token variable">@NextLSN</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">IF</span> <span class="token variable">@NextLSN</span> <span class="token operator">IS</span> <span class="token boolean">NULL</span></span>
<span class="line">            <span class="token keyword">SET</span> <span class="token variable">@Where</span> <span class="token operator">=</span> N<span class="token string">&#39;1 = 0&#39;</span><span class="token punctuation">;</span> <span class="token comment">-- nothing new</span></span>
<span class="line">        <span class="token keyword">ELSE</span></span>
<span class="line">            <span class="token keyword">SET</span> <span class="token variable">@Where</span> <span class="token operator">=</span> N<span class="token string">&#39;c.__$start_lsn = @NextLSN&#39;</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- MAIN DYNAMIC SQL (MERGE-SAFE)</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">SET</span> <span class="token variable">@sql</span> <span class="token operator">=</span> N<span class="token string">&#39;</span>
<span class="line">    -- Start with dummy select to make ;WITH valid</span>
<span class="line">    SELECT 1 AS dummy INTO #_dummy; DROP TABLE #_dummy;</span>
<span class="line"></span>
<span class="line">    ;WITH BasePage AS (</span>
<span class="line">        SELECT TOP (CAST(@PageSize * 1.1 AS INT)) *</span>
<span class="line">        FROM &#39;</span> <span class="token operator">+</span> <span class="token variable">@CdcTableName</span> <span class="token operator">+</span> N<span class="token string">&#39; c</span>
<span class="line">        WHERE &#39;</span> <span class="token operator">+</span> <span class="token variable">@Where</span> <span class="token operator">+</span> N<span class="token string">&#39;</span>
<span class="line">        ORDER BY c.__$start_lsn ASC, c.__$seqval ASC</span>
<span class="line">    ),</span>
<span class="line">    Boundary AS (</span>
<span class="line">        SELECT </span>
<span class="line">            MAX(__$start_lsn) AS MaxLSN,</span>
<span class="line">            MAX(__$seqval) AS MaxSeqVal</span>
<span class="line">        FROM (</span>
<span class="line">            SELECT TOP (@PageSize) __$start_lsn, __$seqval</span>
<span class="line">            FROM BasePage</span>
<span class="line">            ORDER BY __$start_lsn ASC, __$seqval ASC</span>
<span class="line">        ) x</span>
<span class="line">    ),</span>
<span class="line">    NextPage AS (</span>
<span class="line">        SELECT *</span>
<span class="line">        FROM BasePage bp</span>
<span class="line">        CROSS JOIN Boundary b</span>
<span class="line">        WHERE</span>
<span class="line">            (bp.__$start_lsn &lt; b.MaxLSN)</span>
<span class="line">            OR (bp.__$start_lsn = b.MaxLSN AND bp.__$seqval &lt;= b.MaxSeqVal)</span>
<span class="line">    ),</span>
<span class="line">    GrpOps AS (</span>
<span class="line">        SELECT</span>
<span class="line">            np.&#39;</span> <span class="token operator">+</span> QUOTENAME<span class="token punctuation">(</span><span class="token variable">@PKColumns</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&#39; AS PK,</span>
<span class="line">            np.__$start_lsn,</span>
<span class="line">            np.__$seqval,</span>
<span class="line">            MAX(CASE WHEN np.__$operation = 1 THEN 1 ELSE 0 END) AS HasOp1,</span>
<span class="line">            MAX(CASE WHEN np.__$operation = 2 THEN 1 ELSE 0 END) AS HasOp2,</span>
<span class="line">            MAX(CASE WHEN np.__$operation = 3 THEN 1 ELSE 0 END) AS HasOp3,</span>
<span class="line">            MAX(CASE WHEN np.__$operation = 4 THEN 1 ELSE 0 END) AS HasOp4</span>
<span class="line">        FROM NextPage np</span>
<span class="line">        GROUP BY np.&#39;</span> <span class="token operator">+</span> QUOTENAME<span class="token punctuation">(</span><span class="token variable">@PKColumns</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&#39;, np.__$start_lsn, np.__$seqval</span>
<span class="line">    ),</span>
<span class="line">    Classified AS (</span>
<span class="line">        SELECT</span>
<span class="line">            g.PK,</span>
<span class="line">            g.__$start_lsn,</span>
<span class="line">            g.__$seqval,</span>
<span class="line">            CASE</span>
<span class="line">                WHEN g.HasOp1 = 1 AND g.HasOp2 = 1 THEN 4</span>
<span class="line">                WHEN g.HasOp3 = 1 AND g.HasOp4 = 1 THEN 4</span>
<span class="line">                WHEN g.HasOp2 = 1 OR g.HasOp4 = 1 THEN 2</span>
<span class="line">                WHEN g.HasOp1 = 1 OR g.HasOp3 = 1 THEN 1</span>
<span class="line">            END AS FinalOpGroup</span>
<span class="line">        FROM GrpOps g</span>
<span class="line">    ),</span>
<span class="line">    FilteredPageRows AS (</span>
<span class="line">        SELECT</span>
<span class="line">            np.&#39;</span> <span class="token operator">+</span> QUOTENAME<span class="token punctuation">(</span><span class="token variable">@PKColumns</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&#39; AS PK,</span>
<span class="line">            np.__$start_lsn,</span>
<span class="line">            np.__$seqval,</span>
<span class="line">            np.__$operation AS SourceOp,</span>
<span class="line">            CASE</span>
<span class="line">                WHEN cls.FinalOpGroup = 4 AND np.__$operation IN (2,4) THEN 4</span>
<span class="line">                WHEN cls.FinalOpGroup = 2 AND np.__$operation = 2 THEN 2</span>
<span class="line">                WHEN cls.FinalOpGroup = 1 AND np.__$operation IN (1,3) THEN 1</span>
<span class="line">            END AS FinalOp</span>
<span class="line">        FROM NextPage np</span>
<span class="line">        INNER JOIN Classified cls</span>
<span class="line">            ON np.&#39;</span> <span class="token operator">+</span> QUOTENAME<span class="token punctuation">(</span><span class="token variable">@PKColumns</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&#39; = cls.PK</span>
<span class="line">            AND np.__$start_lsn = cls.__$start_lsn</span>
<span class="line">            AND np.__$seqval = cls.__$seqval</span>
<span class="line">        WHERE</span>
<span class="line">            (cls.FinalOpGroup = 4 AND np.__$operation IN (2,4))</span>
<span class="line">            OR (cls.FinalOpGroup = 2 AND np.__$operation = 2)</span>
<span class="line">            OR (cls.FinalOpGroup = 1 AND np.__$operation IN (1,3))</span>
<span class="line">    ),</span>
<span class="line">    LatestPerPK AS (</span>
<span class="line">        SELECT</span>
<span class="line">            f.PK,</span>
<span class="line">            f.__$start_lsn,</span>
<span class="line">            f.__$seqval,</span>
<span class="line">            f.SourceOp,</span>
<span class="line">            f.FinalOp,</span>
<span class="line">            ROW_NUMBER() OVER (</span>
<span class="line">                PARTITION BY f.PK</span>
<span class="line">                ORDER BY f.__$start_lsn DESC, f.__$seqval DESC</span>
<span class="line">            ) AS rn</span>
<span class="line">        FROM FilteredPageRows f</span>
<span class="line">    )</span>
<span class="line">    SELECT</span>
<span class="line">        l.__$start_lsn,</span>
<span class="line">        l.__$seqval,</span>
<span class="line">        l.FinalOp,</span>
<span class="line">        &#39;</span> <span class="token operator">+</span> <span class="token variable">@Columns</span> <span class="token operator">+</span> N<span class="token string">&#39;</span>
<span class="line">    FROM LatestPerPK l</span>
<span class="line">    INNER JOIN &#39;</span> <span class="token operator">+</span> <span class="token variable">@CdcTableName</span> <span class="token operator">+</span> N<span class="token string">&#39; c</span>
<span class="line">        ON c.&#39;</span> <span class="token operator">+</span> QUOTENAME<span class="token punctuation">(</span><span class="token variable">@PKColumns</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&#39; = l.PK</span>
<span class="line">        AND c.__$start_lsn = l.__$start_lsn</span>
<span class="line">        AND c.__$seqval = l.__$seqval</span>
<span class="line">        AND c.__$operation = l.SourceOp</span>
<span class="line">    WHERE l.rn = 1</span>
<span class="line">    ORDER BY l.__$start_lsn, l.__$seqval;&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- EXECUTE MAIN SQL</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">IF</span> <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token number">1</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token keyword">EXEC</span> sp_executesql </span>
<span class="line">            <span class="token variable">@sql</span><span class="token punctuation">,</span></span>
<span class="line">            N<span class="token string">&#39;@LastSyncLSN binary(10), @LastSeqVal varbinary(10), @PageSize int&#39;</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@LastSeqVal</span>  <span class="token operator">=</span> <span class="token variable">@LastSeqVal</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@PageSize</span>    <span class="token operator">=</span> <span class="token variable">@PageSize</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span></span>
<span class="line">    <span class="token keyword">ELSE</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token keyword">EXEC</span> sp_executesql </span>
<span class="line">            <span class="token variable">@sql</span><span class="token punctuation">,</span></span>
<span class="line">            N<span class="token string">&#39;@NextLSN binary(10), @PageSize int&#39;</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@NextLSN</span>  <span class="token operator">=</span> <span class="token variable">@NextLSN</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@PageSize</span> <span class="token operator">=</span> <span class="token variable">@PageSize</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span></span>
<span class="line"><span class="token keyword">END</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1)])])}const o=n(p,[["render",i]]),r=JSON.parse('{"path":"/blogs/Skills/SQLServer/StoredProcedure/usp_GetCdcTableData.html","title":"Use stored procedure to get the new traction cdc rows","lang":"en-US","frontmatter":{"title":"Use stored procedure to get the new traction cdc rows","date":"2025/10/20","tags":["SQLServerCDC"],"categories":["Skills"]},"headers":[],"git":{"createdTime":1762950152000,"updatedTime":1762950152000,"contributors":[{"name":"Zhao Json","email":"json.zhao@scania.com.cn","commits":1}]},"filePathRelative":"blogs/Skills/SQLServer/StoredProcedure/usp_GetCdcTableData.md"}');export{o as comp,r as data};
