import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from '@vuepress/bundler-vite'
import { webpackBundler } from '@vuepress/bundler-webpack'

export default defineUserConfig({
  // Base URL for deploying to GitHub Pages. If you publish to
  // https://<user>.github.io/<repo>/ you must set base to '/<repo>/'
  base: '/MdBlog/',
  title: "Manifacturing Industry Blog",
  description: "This is a blog for manufacturing industry, some experiences just for json zhao.",
  // Use Vite bundler with tuned options to reduce watcher / pre-bundle overhead on Windows
  bundler: viteBundler({
    viteOptions: {
      server: {
        // Ignore large folders to avoid expensive file watch on Windows (node_modules/.git/.vuepress/.temp)
        watch: {
          ignored: ['**/node_modules/**', '**/.git/**', '**/.vuepress/.temp/**']
        }
      },
      // If some dependencies cause slow pre-bundling, list them here to exclude from optimizeDeps
      optimizeDeps: {
        // exclude: ['some-big-dep']
      }
    }
  }),
  // bundler: webpackBundler(),
  theme: recoTheme({
    logo: "/logo.png",
    author: "json zhao",
    authorAvatar: "/head.png",
    //Github repository
    //docsRepo: "https://github.com/vuepress-reco/vuepress-theme-reco-next",
    docsBranch: "main",
    docsDir: "example",
    lastUpdatedText: "",
    // series 为原 sidebar
    // series: {
    //   // "/docs/theme-reco/": [
    //   //   {
    //   //     text: "module one",
    //   //     children: ["home", "theme"],
    //   //   },
    //   //   {
    //   //     text: "module two",
    //   //     children: ["api", "plugin"],
    //   //   },
    //   // ],
    // },
    navbar: [
      { text: "Home", link: "/" },
      { text: "Skills", link: "/categories/Skills/1.html" },
      { text: "ELK", link: "/categories/ELK/1.html" },
      { text: "ETL", link: "/categories/ETL/1.html" },
      { text: "MES", link: "/categories/MES/1.html" },
      { text: "WMS", link: "/categories/WMS/1.html" },
      { text: "Project", link: "/categories/Project/1.html" },
      //{ text: "Digitalization", link: "/categories/Digitalization/1.html" },
      //{ text: "Experiences", link: "/categories/Experience/1.html" },
      // Use the tags index instead of a hard-coded tag page to avoid 404s
      { text: "Tags", link: "/tags/SQLServer/1.html" },
      // {
      //   text: "Docs",
      //   children: [
      //     { text: "vuepress-reco", link: "/docs/theme-reco/theme" },
      //     { text: "vuepress-theme-reco", link: "/blogs/other/guide" },
      //   ],
      // },
    // bulletin: {
    //   body: [
    //     {
    //       type: "text",
    //       content: `🎉🎉🎉 reco 主题 2.x 已经接近 Beta 版本，在发布 Latest 版本之前不会再有大的更新，大家可以尽情尝鲜了，并且希望大家在 QQ 群和 GitHub 踊跃反馈使用体验，我会在第一时间响应。`,
    //       style: "font-size: 12px;",
    //     },
    //     {
    //       type: "hr",
    //     },
    //     {
    //       type: "title",
    //       content: "QQ 群",
    //     },
    //     {
    //       type: "text",
    //       content: `
    //       <ul>
    //         <li>QQ群1:1037296104</li>
    //         <li>QQ群2:1061561395</li>
    //         <li>QQ群:962687802</li>
    //       </ul>`,
    //       style: "font-size: 12px;",
    //     },
    //     {
    //       type: "hr",
    //     },
    //     {
    //       type: "title",
    //       content: "GitHub",
    //     },
    //     {
    //       type: "text",
    //       content: `
    //       <ul>
    //         <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/issues">Issues<a/></li>
    //         <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/discussions/1">Discussions<a/></li>
    //       </ul>`,
    //       style: "font-size: 12px;",
    //     },
    //     {
    //       type: "hr",
    //     },
    //     {
    //       type: "buttongroup",
    //       children: [
    //         {
    //           text: "打赏",
    //           link: "/docs/others/donate.html",
    //         },
    //       ],
    //     },
    //   ],
    // },
    // commentConfig: {
    //   type: 'valine',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  ]}),
  // debug: true,
});
