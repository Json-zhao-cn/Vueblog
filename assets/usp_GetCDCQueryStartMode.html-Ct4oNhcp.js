import{_ as n,c as a,a as e,o as p}from"./app-DZFgIm2e.js";const l={};function t(i,s){return p(),a("div",null,[...s[0]||(s[0]=[e(`<div class="language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql" data-title="sql"><pre><code><span class="line"><span class="token keyword">USE</span> <span class="token punctuation">[</span>YourDatabase<span class="token punctuation">]</span></span>
<span class="line">GO</span>
<span class="line"><span class="token comment">/****** Object:  StoredProcedure [dbo].[usp_GetCdcQueryStartMode]    Script Date: 2025/11/10 13:42:16 ******/</span></span>
<span class="line"><span class="token keyword">SET</span> ANSI_NULLS <span class="token keyword">ON</span></span>
<span class="line">GO</span>
<span class="line"><span class="token keyword">SET</span> QUOTED_IDENTIFIER <span class="token keyword">ON</span></span>
<span class="line">GO</span>
<span class="line"><span class="token keyword">ALTER</span> <span class="token keyword">PROCEDURE</span> <span class="token punctuation">[</span>dbo<span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token punctuation">[</span>usp_GetCdcQueryStartMode<span class="token punctuation">]</span></span>
<span class="line">    <span class="token variable">@TableName</span> NVARCHAR<span class="token punctuation">(</span><span class="token number">50</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token variable">@LastSyncLSN</span> <span class="token keyword">BINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token variable">@LastSeqVal</span> <span class="token keyword">VARBINARY</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token variable">@HasRemaining</span> <span class="token keyword">BIT</span> OUTPUT</span>
<span class="line"><span class="token keyword">AS</span></span>
<span class="line"><span class="token keyword">BEGIN</span></span>
<span class="line">    <span class="token keyword">SET</span> NOCOUNT <span class="token keyword">ON</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@sql</span> NVARCHAR<span class="token punctuation">(</span>MAX<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@CaptureInstance</span> SYSNAME <span class="token operator">=</span> <span class="token variable">@TableName</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token keyword">DECLARE</span> <span class="token variable">@CdcTableName</span> SYSNAME <span class="token operator">=</span> <span class="token string">&#39;cdc.&#39;</span> <span class="token operator">+</span> <span class="token variable">@CaptureInstance</span> <span class="token operator">+</span> <span class="token string">&#39;_CT&#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">SET</span> <span class="token variable">@sql</span> <span class="token operator">=</span> N<span class="token string">&#39;</span>
<span class="line">        SELECT @HasRemaining = CASE WHEN EXISTS (</span>
<span class="line">            SELECT 1</span>
<span class="line">            FROM &#39;</span> <span class="token operator">+</span> <span class="token variable">@CdcTableName</span> <span class="token operator">+</span> <span class="token string">&#39;</span>
<span class="line">            WHERE __$start_lsn = @LastSyncLSN</span>
<span class="line">              AND __$seqval &gt; @LastSeqVal</span>
<span class="line">        ) THEN 1 ELSE 0 END;</span>
<span class="line">    &#39;</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">    <span class="token keyword">EXEC</span> sp_executesql</span>
<span class="line">        <span class="token variable">@sql</span><span class="token punctuation">,</span></span>
<span class="line">        N<span class="token string">&#39;@LastSyncLSN binary(10), @LastSeqVal varbinary(10), @HasRemaining bit OUTPUT&#39;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@LastSyncLSN</span> <span class="token operator">=</span> <span class="token variable">@LastSyncLSN</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@LastSeqVal</span>  <span class="token operator">=</span> <span class="token variable">@LastSeqVal</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token variable">@HasRemaining</span> <span class="token operator">=</span> <span class="token variable">@HasRemaining</span> OUTPUT<span class="token punctuation">;</span></span>
<span class="line"><span class="token keyword">END</span><span class="token punctuation">;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1)])])}const o=n(l,[["render",t]]),r=JSON.parse('{"path":"/blogs/Skills/SQLServer/StoredProcedure/usp_GetCDCQueryStartMode.html","title":"Use stored procedure to judge the cdc table data has new row","lang":"en-US","frontmatter":{"title":"Use stored procedure to judge the cdc table data has new row","date":"2025/10/20","tags":["SQLServerCDC"],"categories":["Skills"]},"headers":[],"git":{"createdTime":1762950152000,"updatedTime":1762950152000,"contributors":[{"name":"Zhao Json","email":"json.zhao@scania.com.cn","commits":1}]},"filePathRelative":"blogs/Skills/SQLServer/StoredProcedure/usp_GetCDCQueryStartMode.md"}');export{o as comp,r as data};
