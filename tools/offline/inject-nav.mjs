// 给离线单文件版加一条"上一条 / 下一条"底部导航，一次看一条建议。
// 用法：node tools/offline/inject-nav.mjs [文件路径]   默认 dist/HowToLiveBetter.html
//
// 为什么不是"藏起其它卡片"：页面自己就是用 display/hidden 来表达"这条被筛掉了"的，
// 它四处靠 el.offsetParent（第 987、1209、1641 行）和 getBoundingClientRect().height
// （第 939 行）来判断可见性；再叠一层 display:none 会把"被导航藏起来"和"被筛掉"混成
// 一件事，gotoItem 会误判、spy() 量到位移、地址栏 hash 被当成失效清掉，最后在
// querySelector('header.nav') / x.querySelector('.card-h') 这类地方炸成
// "Cannot read properties of null"。所以这里一个字都不改显隐，只调用页面自己的
// gotoItem() —— 它本来就是"跳到第 N 条"的官配入口（目录点击走的就是它），
// 滚动、闪烁、目录联动、地址栏 hash 全都由它处理。
//
// 窗口小的时候一屏本来就只放得下一条，所以"滚到下一条"就等于"一次看一条"。
//
// 幂等：文件里已经有 #pybar 就不再重复注入（重跑 build.mjs 覆盖文件后，重跑本脚本即可）。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const FILE = resolve(ROOT, process.argv[2] ?? 'dist/HowToLiveBetter.html');
const html = readFileSync(FILE, 'utf8');
if (html.includes('id="pybar"')) { console.log('已经注入过导航条，跳过'); process.exit(0); }

const NAV = `
<style>
#pybar{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;gap:12px;padding:10px;background:rgba(20,20,20,.92);color:#fff;font-size:14px;font-family:system-ui,sans-serif}
#pybar button{padding:6px 14px;border:none;border-radius:6px;background:#3a7afe;color:#fff;cursor:pointer;font-size:14px}
#pybar button:active{background:#2a5fd0}
#pyCnt{min-width:80px;text-align:center}
body{padding-bottom:56px!important}
</style>
<div id="pybar">
  <button id="pyPrev">\u2039 \u4e0a\u4e00\u6761</button>
  <span id="pyCnt"></span>
  <button id="pyNext">\u4e0b\u4e00\u6761 \u203a</button>
</div>
<script>
(function(){
  function boot(){
    // 只认没被页面筛掉的卡片（hidden 是页面自己的显隐开关，这里只读不写）
    var cards=[].slice.call(document.querySelectorAll('.card'));
    if(!cards.length){ setTimeout(boot,80); return; }
    var cnt=document.getElementById('pyCnt');

    var BK='pyBookmark';
    function list(){ return cards.filter(function(c){ return !c.hidden && c.offsetParent; }); }
    function here(vis){
      // 当前视口正中那条，就是"我正在看的这条"
      var mid=window.innerHeight*0.4, best=0;
      for(var i=0;i<vis.length;i++){
        var r=vis[i].getBoundingClientRect();
        if(r.top<=mid && r.bottom>0) best=i;
      }
      return best;
    }
    function curId(vis){ var c=vis[here(vis)]; return c && c.id.slice(2); }
    function go(d){
      var vis=list(); if(!vis.length){ cnt.textContent='\u5f53\u524d\u7b5b\u9009\u4e0b\u6ca1\u6709\u6761\u76ee'; return; }
      var t=here(vis)+d;
      if(t<0) t=0;
      if(t>=vis.length) t=vis.length-1;
      var id=vis[t].id.slice(2);          // 'e-3-2' -> '3-2'，gotoItem 认这个形状
      if(typeof gotoItem==='function') gotoItem(id, ''); else vis[t].scrollIntoView({block:'start'});
      paint();
    }
    function paint(){
      var vis=list(); if(!vis.length) return;
      cnt.textContent=(here(vis)+1)+' / '+vis.length;
    }
    document.getElementById('pyPrev').onclick=function(){ go(-1); };
    document.getElementById('pyNext').onclick=function(){ go(1); };
    document.addEventListener('keydown', function(e){
      if(e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if(e.key==='ArrowRight') go(1);
      if(e.key==='ArrowLeft') go(-1);
    });
    // 页面筛选/滚动后序号要跟上。只读一遍可见性和位置，不写任何样式，不会和页面打架。
    document.addEventListener('scroll', function(){ clearTimeout(window.__pyT); window.__pyT=setTimeout(paint,200); }, {passive:true});

    // 退出前记下看到哪条了（书签），下次打开自动跳回去
    addEventListener('beforeunload', function(){
      var id=curId(list());
      if(id){ try{ localStorage.setItem(BK,id); }catch(e){} }
    });
    try{
      var saved=localStorage.getItem(BK);
      if(saved && typeof gotoItem==='function') gotoItem(saved,'');
    }catch(e){}

    paint();
  }
  if(document.readyState==='complete'||document.readyState==='interactive') setTimeout(boot,400);
  else document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,400); });
})();
</script>
</body>`;

writeFileSync(FILE, html.replace('</body>', NAV));
console.log('导航条已注入：' + FILE);
