import{_ as n,c as a,a as e,o as p}from"./app-7xvXnEYb.js";const l={};function c(t,s){return p(),a("div",null,[...s[0]||(s[0]=[e(`<div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">USE</span> <span class="token punctuation">[</span>YourDatabase<span class="token punctuation">]</span></span>
<span class="line">GO</span>
<span class="line"><span class="token comment">/****** Object:  StoredProcedure [dbo].[usp_UpdateNextCDCTraceData]    Script Date: 2025/11/11 14:01:02 ******/</span></span>
<span class="line"><span class="token keyword">SET</span> ANSI_NULLS <span class="token keyword">ON</span></span>
<span class="line">GO</span>
<span class="line"><span class="token keyword">SET</span> QUOTED_IDENTIFIER <span class="token keyword">ON</span></span>
<span class="line">GO</span>
<span class="line"><span class="token keyword">ALTER</span> <span class="token keyword">PROCEDURE</span> <span class="token punctuation">[</span>dbo<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token punctuation">[</span>usp_UpdateNextCDCTraceData<span class="token punctuation">]</span></span>
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
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@LastSyncLSN</span> <span class="token keyword">BINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@LastSeqVal</span> <span class="token keyword">VARBINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@HasRemaining</span> <span class="token keyword">BIT</span> <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@NextLSN</span> <span class="token keyword">BINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@Where</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@sql</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">-- declare outer variables for max LSN/Seq</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@OutMaxLSN</span> <span class="token keyword">BINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@OutMaxSeq</span> <span class="token keyword">VARBINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- GET LAST SYNC POINT</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">SELECT</span> <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> LastSyncLSN<span class="token punctuation">,</span> <span class="token variable">@LastSeqVal</span> <span class="token operator">=</span> SeqVal</span>
<span class="line">    <span class="token keyword">FROM</span> dbo<span class="token punctuation">.</span>CDC_Sync_Control</span>
<span class="line">    <span class="token keyword">WHERE</span> TableName <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">;</span></span>
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
<span class="line">    <span class="token keyword">EXEC</span> dbo<span class="token punctuation">.</span>usp_GetCdcQueryStartMode </span>
<span class="line">        <span class="token variable">@TableName</span> <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@LastSeqVal</span> <span class="token operator">=</span> <span class="token variable">@LastSeqVal</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token variable">@HasRemaining</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- COMPUTE WHERE CONDITION</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">IF</span> <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token number">1</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token keyword">SET</span> <span class="token variable">@Where</span> <span class="token operator">=</span> N<span class="token string">&#39;c.__$start_lsn = @LastSyncLSN AND c.__$seqval &gt; @LastSeqVal&#39;</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span></span>
<span class="line">    <span class="token keyword">ELSE</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token comment">-- get next LSN</span></span>
<span class="line">        <span class="token keyword">DECLARE</span> <span class="token variable">@Nextsql</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">		<span class="token keyword">SET</span> <span class="token variable">@Nextsql</span> <span class="token operator">=</span> N<span class="token string">&#39;SELECT @NextLSN_OUT = MIN(__$start_lsn) </span>
<span class="line">					 FROM &#39;</span> <span class="token operator">+</span><span class="token string">&#39;cdc.&#39;</span> <span class="token operator">+</span> <span class="token variable">@CaptureInstance</span> <span class="token operator">+</span> <span class="token string">&#39;_CT&#39;</span> <span class="token operator">+</span> N<span class="token string">&#39; </span>
<span class="line">					 WHERE __$start_lsn &gt; @LastSyncLSN;&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">		<span class="token keyword">EXEC</span> sp_executesql </span>
<span class="line">			<span class="token variable">@Nextsql</span><span class="token punctuation">,</span></span>
<span class="line">			N<span class="token string">&#39;@LastSyncLSN binary(10), @NextLSN_OUT binary(10) OUTPUT&#39;</span><span class="token punctuation">,</span></span>
<span class="line">			<span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">			<span class="token variable">@NextLSN_OUT</span> <span class="token operator">=</span> <span class="token variable">@NextLSN</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token keyword">IF</span> <span class="token variable">@NextLSN</span> <span class="token operator">IS</span> <span class="token boolean">NULL</span></span>
<span class="line">        <span class="token keyword">BEGIN</span></span>
<span class="line">            <span class="token comment">-- nothing to sync</span></span>
<span class="line">            <span class="token keyword">RETURN</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token keyword">END</span></span>
<span class="line">        <span class="token keyword">ELSE</span></span>
<span class="line">            <span class="token keyword">SET</span> <span class="token variable">@Where</span> <span class="token operator">=</span> N<span class="token string">&#39;c.__$start_lsn = @NextLSN&#39;</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- DYNAMIC SQL TO GET MAX LSN/SEQ</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">SET</span> <span class="token variable">@sql</span> <span class="token operator">=</span> N<span class="token string">&#39;</span>
<span class="line">    SELECT </span>
<span class="line">        @OutMaxLSN_OUT = MAX(c.__$start_lsn),</span>
<span class="line">        @OutMaxSeq_OUT = MAX(c.__$seqval)</span>
<span class="line">    FROM &#39;</span> <span class="token operator">+</span> <span class="token variable">@CdcTableName</span> <span class="token operator">+</span> N<span class="token string">&#39; c</span>
<span class="line">    WHERE &#39;</span> <span class="token operator">+</span> <span class="token variable">@Where</span> <span class="token operator">+</span> N<span class="token string">&#39;;&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- EXECUTE DYNAMIC SQL</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">IF</span> <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token number">1</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token keyword">EXEC</span> sp_executesql</span>
<span class="line">            <span class="token variable">@sql</span><span class="token punctuation">,</span></span>
<span class="line">            N<span class="token string">&#39;@LastSyncLSN binary(10), @LastSeqVal varbinary(10),</span>
<span class="line">              @OutMaxLSN_OUT binary(10) OUTPUT, @OutMaxSeq_OUT varbinary(10) OUTPUT&#39;</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@LastSeqVal</span> <span class="token operator">=</span> <span class="token variable">@LastSeqVal</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@OutMaxLSN_OUT</span> <span class="token operator">=</span> <span class="token variable">@OutMaxLSN</span> OUTPUT<span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@OutMaxSeq_OUT</span> <span class="token operator">=</span> <span class="token variable">@OutMaxSeq</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span></span>
<span class="line">    <span class="token keyword">ELSE</span></span>
<span class="line">    <span class="token keyword">BEGIN</span></span>
<span class="line">        <span class="token keyword">EXEC</span> sp_executesql</span>
<span class="line">            <span class="token variable">@sql</span><span class="token punctuation">,</span></span>
<span class="line">            N<span class="token string">&#39;@NextLSN binary(10),</span>
<span class="line">              @OutMaxLSN_OUT binary(10) OUTPUT, @OutMaxSeq_OUT varbinary(10) OUTPUT&#39;</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@NextLSN</span> <span class="token operator">=</span> <span class="token variable">@NextLSN</span><span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@OutMaxLSN_OUT</span> <span class="token operator">=</span> <span class="token variable">@OutMaxLSN</span> OUTPUT<span class="token punctuation">,</span></span>
<span class="line">            <span class="token variable">@OutMaxSeq_OUT</span> <span class="token operator">=</span> <span class="token variable">@OutMaxSeq</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">END</span></span>
<span class="line"></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token comment">-- UPDATE CDC_Sync_Control</span></span>
<span class="line">    <span class="token comment">------------------------------------------------------------</span></span>
<span class="line">    <span class="token keyword">UPDATE</span> dbo<span class="token punctuation">.</span>CDC_Sync_Control</span>
<span class="line">    <span class="token keyword">SET</span> </span>
<span class="line">        LastSyncLSN <span class="token operator">=</span> <span class="token variable">@OutMaxLSN</span><span class="token punctuation">,</span></span>
<span class="line">        SeqVal      <span class="token operator">=</span> <span class="token variable">@OutMaxSeq</span><span class="token punctuation">,</span></span>
<span class="line">        LastSyncDate <span class="token operator">=</span> GETDATE<span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">    <span class="token keyword">WHERE</span> TableName <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">END</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1)])])}const o=n(l,[["render",c]]),r=JSON.parse('{"path":"/blogs/Skills/SQLServer/StoredProcedure/usp_UpdateNextCDCTraceData.html","title":"Use stored procedure to update CDC_Sync_Control table data","lang":"en-US","frontmatter":{"title":"Use stored procedure to update CDC_Sync_Control table data","date":"2025/10/20","tags":["SQLServerCDC"],"categories":["Skills"]},"headers":[],"git":{"createdTime":1762950152000,"updatedTime":1762950152000,"contributors":[{"name":"Zhao Json","email":"json.zhao@scania.com.cn","commits":1}]},"filePathRelative":"blogs/Skills/SQLServer/StoredProcedure/usp_UpdateNextCDCTraceData.md"}');export{o as comp,r as data};
