const {chromium}=require('playwright');
const fs=require('node:fs');
const base=process.env.SITE_URL || 'http://127.0.0.1:4189/';
const out=process.env.SITE_ARTIFACTS || 'D:/AI-Work/artifacts/portfolio-split-20261022';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();
 await page.addInitScript(()=>sessionStorage.setItem('portfolio-prologue-v7','1'));
 const errors=[],results=[];
 const check=(name,value)=>{results.push({name,passed:!!value});if(!value)throw Error(name)};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(new URL(base).origin)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
 for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:width===375?812:1000});
  await page.goto(base,{waitUntil:'networkidle'});
  check('Portfolio title '+width,(await page.title()).includes('个人作品集'));
  check('Portfolio has one heading '+width,await page.locator('h1').count()===1);
  check('Portfolio has no game arrival dialog '+width,await page.locator('.arrival').count()===0);
  check('Portfolio fits screen '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check('Portfolio photograph loads '+width,await page.locator('img').evaluateAll(a=>a.every(i=>i.complete&&i.naturalWidth>0)));
  await page.locator('a[href="#hardware"]').click();
  check('Hardware section navigation '+width,new URL(page.url()).hash==='#hardware');
  check('Mono stage is clearly labelled '+width,(await page.locator('.hardware-copy').innerText()).includes('方案设计阶段'));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.screenshot({path:`${out}/portfolio-${width}.png`,fullPage:true});
 }
 await page.locator('.game-project').click();
 await page.waitForURL(base+'games/wuxitown/');
 check('Portfolio opens dedicated game site',(await page.title()).includes('抵达雾汐镇'));
 await page.keyboard.press('Escape');
 await page.waitForTimeout(800);
 await page.locator('.brand').click();
 await page.waitForURL(base+'games/wuxitown/index.html');
 check('Game brand stays inside game',new URL(page.url()).pathname.endsWith('/games/wuxitown/index.html'));
 const canonical=await page.locator('link[rel=canonical]').getAttribute('href');
 check('Competition canonical is dedicated game URL',canonical==='https://heao360765-ops.github.io/my-portfolio/games/wuxitown/');
 for(const slug of ['world','residents','rules','gallery','download','credits','studies']){
  await page.goto(base+slug+'.html?source=legacy#compat',{waitUntil:'networkidle'});
  await page.waitForURL(base+'games/wuxitown/'+slug+'.html?source=legacy#compat');
  check('Old '+slug+' link preserves query and hash',new URL(page.url()).hash==='#compat');
 }
 await page.goto(base+'games/wuxitown/studies.html',{waitUntil:'networkidle'});
 await page.locator('[data-study="dusk"]').click();
 await page.waitForFunction(()=>document.querySelector('#study-image').complete&&document.querySelector('#study-image').naturalWidth>0);
 check('Dynamic study photograph resolves outside game folder',(await page.locator('#study-image').getAttribute('src')).includes('/%E7%B4%A0%E6%9D%90/')|| (await page.locator('#study-image').getAttribute('src')).includes('/素材/'));
 await page.goto(base+'games/wuxitown/download.html',{waitUntil:'networkidle'});
 const link=await page.locator('a[download]').evaluate(a=>a.href);
 const release=await (await page.request.get(base+'downloads/release-info.json')).json();
 check('Download uses current release manifest',link===release.download_url && release.version==='0.4.0');
 check('Download URL exists',(await page.request.head(link)).ok());
 check('Browser test link uses original route',await page.locator('a[href="../../play/index.html"]').count()===1);
 const play=await (await page.request.get(base+'play/index.html')).text();
 check('Web game returns to dedicated game site',play.includes('href="../games/wuxitown/"'));
 check('No missing resources or browser errors',errors.length===0);
 fs.writeFileSync(out+'/portfolio-report.json',JSON.stringify({base,results,errors},null,2));
 console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.passed).length,errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
