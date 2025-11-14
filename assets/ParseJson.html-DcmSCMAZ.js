import{_ as n,c as a,a as e,o as i}from"./app-DZFgIm2e.js";const l={};function p(t,s){return i(),a("div",null,[...s[0]||(s[0]=[e(`<h2 id="parse-specific-json" tabindex="-1"><a class="header-anchor" href="#parse-specific-json"><span><strong>Parse specific Json</strong></span></a></h2><p>After get htttp data, we will get the specific json.Normally, when we use the native NIFI processor to parse json. It will be diffcult. So We will use groovy to parse it.</p><h3 id="_1-this-json-like-this" tabindex="-1"><a class="header-anchor" href="#_1-this-json-like-this"><span>1. This json like this:</span></a></h3><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json" data-title="json"><pre><code><span class="line">  <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;inscope&quot;</span><span class="token operator">:</span><span class="token punctuation">[</span><span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;Order&quot;</span><span class="token operator">:</span><span class="token string">&quot;WIP1&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;Quantity&quot;</span><span class="token operator">:</span><span class="token number">1</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;Order&quot;</span><span class="token operator">:</span><span class="token string">&quot;WIP2&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;Quantity&quot;</span><span class="token operator">:</span><span class="token number">2.5</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token punctuation">}</span><span class="token punctuation">]</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-groovy-script" tabindex="-1"><a class="header-anchor" href="#_2-groovy-script"><span>2. Groovy script</span></a></h3><div class="language-Groovy line-numbers-mode" data-highlighter="prismjs" data-ext="Groovy" data-title="Groovy"><pre><code><span class="line">import groovy.json.JsonSlurper</span>
<span class="line">import groovy.json.JsonOutput</span>
<span class="line">import org.apache.nifi.processor.io.StreamCallback</span>
<span class="line">import org.apache.nifi.processor.io.OutputStreamCallback</span>
<span class="line"></span>
<span class="line">import java.nio.charset.StandardCharsets</span>
<span class="line"></span>
<span class="line">def flowFile = session.get()</span>
<span class="line">if (!flowFile) return</span>
<span class="line"></span>
<span class="line">try {</span>
<span class="line">    def jsonText = session.read(flowFile).getText(StandardCharsets.UTF_8.name())</span>
<span class="line"></span>
<span class="line">    // Check if content is effectively null or empty</span>
<span class="line">    if (!jsonText || jsonText.trim().isEmpty() || jsonText ==~ /^\\s*\\{?null\\}?\\s*$/) {</span>
<span class="line">        log.error(&quot;No data&quot;)</span>
<span class="line">        session.transfer(flowFile, REL_FAILURE)</span>
<span class="line">        return</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line">    def jsonSlurper = new JsonSlurper()</span>
<span class="line">    def parsedJson = jsonSlurper.parseText(jsonText)</span>
<span class="line">    </span>
<span class="line">    def inscopeArray = parsedJson.inscope</span>
<span class="line">    </span>
<span class="line">    if (inscopeArray == null) {</span>
<span class="line">        log.error(&quot;No inscope data - inscope is null&quot;)</span>
<span class="line">        session.transfer(flowFile, REL_FAILURE)</span>
<span class="line">        return</span>
<span class="line">    }</span>
<span class="line">    </span>
<span class="line">    if (inscopeArray.isEmpty()) {</span>
<span class="line">        log.error(&quot;No  inscope data - inscope array is empty&quot;)</span>
<span class="line">        session.transfer(flowFile, REL_FAILURE)</span>
<span class="line">        return</span>
<span class="line">    }</span>
<span class="line">    </span>
<span class="line">    def outputJson = JsonOutput.toJson(inscopeArray)</span>
<span class="line">    flowFile = session.write(flowFile, { outputStream -&gt;</span>
<span class="line">        outputStream.write(outputJson.getBytes(&quot;UTF-8&quot;))</span>
<span class="line">    } as OutputStreamCallback)</span>
<span class="line">    </span>
<span class="line">    session.transfer(flowFile, REL_SUCCESS)</span>
<span class="line">    </span>
<span class="line">} catch (Exception e) {</span>
<span class="line">    log.error(&quot;Failed to process JSON  Script: \${e.message}&quot;, e)</span>
<span class="line">    session.transfer(flowFile, REL_FAILURE)</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,6)])])}const o=n(l,[["render",p]]),c=JSON.parse('{"path":"/blogs/ETL/AppacheNIFI/Groovy/ParseJson.html","title":"Parse specific Json","lang":"en-US","frontmatter":{"title":"Parse specific Json","date":"2025/11/12","tags":["ApacheNIFI"],"categories":["ETL"]},"headers":[{"level":2,"title":"Parse specific Json","slug":"parse-specific-json","link":"#parse-specific-json","children":[{"level":3,"title":"1. This json like this:","slug":"_1-this-json-like-this","link":"#_1-this-json-like-this","children":[]},{"level":3,"title":"2. Groovy script","slug":"_2-groovy-script","link":"#_2-groovy-script","children":[]}]}],"git":{"createdTime":1763109587000,"updatedTime":1763109587000,"contributors":[{"name":"jsonzhao","email":"json.zhao.cn@outlook.com","commits":1}]},"filePathRelative":"blogs/ETL/AppacheNIFI/Groovy/ParseJson.md"}');export{o as comp,c as data};
