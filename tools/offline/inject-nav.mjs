// 给离线单文件版加一条"上一条 / 下一条"底部导航，一次看一条建议。
// 用法：node tools/offline/inject-nav.mjs [文件路径]   默认 dist/HowToLiveBetter.html
// 幂等：文件里已经有 #pybar 就不再重复注入（重跑 build.mjs 覆盖文件后，重跑本脚本即可）。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from '../lib/book.mjs';

const FILE = resolve(ROOT, process.argv[2] ?? 'dist/HowToLiveBetter.html');
let html = readFileSync(FILE, 'utf8');
if (html.includes('id="pybar"')) { console.log('已经注入过导航条，跳过'); process.exit(0); }

const NAV = `
<style>
#pybar{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;gap:12px;padding:10px;background:rgba(20,20,20,.92);color:#fff;font-size:14px;font-family:system-ui,sans-serif}
#pybar button{padding:6px 14px;border:none;border-radius:6px;background:#3a7afe;color:#fff;cursor:pointer;font-size:14px}
#pybar button:active{background:#2a5fd0}
#pyCnt{min-width:80px;text-align:center}
body{padding-bottom:60px!important}
</style>
<div id="pybar">
  <button id="pyPrev">\u2039 \u4e0a\u4e00\u6761</button>
  <span id="pyCnt"></span>
  <button id="pyNext">\u4e0b\u4e00\u6761 \u203a</button>
</div>
<script>
(function(){
  function boot(){
    var cards=[].slice.call(document.querySelectorAll('.card'));
    if(!cards.length){ setTimeout(boot,80); return; }
    var idx=0;
    var cnt=document.getElementById('pyCnt');
    function render(){
      cards.forEach(function(c){
        var sec=c.closest('section');
        if(c===cards[idx]){ c.style.display=''; if(sec) sec.style.display=''; }
        else { c.style.display='none'; }
      });
      document.querySelectorAll('section').forEach(function(s){
        if(!s.contains(cards[idx])) s.style.display='none';
      });
      cnt.textContent=(idx+1)+' / '+cards.length;
      cards[idx].scrollIntoView({block:'start'});
    }
    document.getElementById('pyPrev').onclick=function(){idx=(idx-1+cards.length)%cards.length; render();};
    document.getElementById('pyNext').onclick=function(){idx=(idx+1)%cards.length; render();};
    document.addEventListener('keydown', function(e){
      if(e.key==='ArrowRight'){idx=(idx+1)%cards.length; render();}
      if(e.key==='ArrowLeft'){idx=(idx-1+cards.length)%cards.length; render();}
    });
    render();
  }
  if(document.readyState==='complete'||document.readyState==='interactive') setTimeout(boot,300);
  else document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,300); });
})();
</script>
</body>`;

writeFileSync(FILE, html.replace('</body>', NAV));
console.log('导航条已注入：' + FILE);
