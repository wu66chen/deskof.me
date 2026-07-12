import { useState, useCallback } from 'react';
import { loadSiteConfig, saveSiteConfig, defaultSiteConfig } from '../../config/siteConfig';

const HINTS = {
  taskbarBg:'1920×40',taskbarStartIcon:'24×24',loginBg:'400×300',loginLogo:'64×64',
  windowTitlebarBg:'1×28',windowBorder:'8×8',windowBg:'64×64',
  windowBtnClose:'16×16',windowBtnMin:'16×16',windowBtnMax:'16×16',
  contextMenuBg:'200×200',startMenuBg:'220×300',
};

const styles = {
  overlay: { position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:30000,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(2px)' },
  panel: { width:560,maxWidth:'92vw',maxHeight:'88vh',display:'flex',flexDirection:'column',background:'#C0C0C0',border:'2px solid',borderColor:'#fff #404040 #404040 #fff',boxShadow:'2px 2px 0 #808080',animation:'windowOpen .25s cubic-bezier(0.34,1.56,0.64,1)' },
  titlebar: { display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 6px',background:'linear-gradient(90deg,#000080,#1084D0)',color:'white',fontFamily:"'Press Start 2P',monospace",fontSize:9,minHeight:26 },
  tabs: { display:'flex',flexWrap:'wrap',background:'#E8E8E8',borderBottom:'1px solid #808080' },
  tab: (active) => ({ padding:'5px 12px',border:'none',background:active?'white':'transparent',fontFamily:"'Gaegu',cursive",fontSize:13,cursor:'pointer',borderRight:'1px solid #ddd',fontWeight:active?'bold':'normal',borderBottom:active?'2px solid #4169E1':'none' }),
  body: { flex:1,overflowY:'auto',padding:14,background:'white' },
  section: { display:'flex',flexDirection:'column',gap:12 },
  field: { display:'flex',flexDirection:'column',gap:3 },
  label: { fontFamily:"'Gaegu',cursive",fontSize:13,fontWeight:'bold',color:'#444' },
  input: { padding:'4px 8px',border:'2px solid',borderColor:'#808080 #fff #fff #808080',fontFamily:"'Gaegu',cursive",fontSize:13,background:'white',outline:'none' },
  row: { display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',padding:'2px 0' },
  hint: { fontFamily:"'Gaegu',cursive",fontSize:11,color:'#999' },
  btn: { padding:'6px 16px',border:'2px solid',borderColor:'#fff #808080 #808080 #fff',background:'#C0C0C0',fontFamily:"'Gaegu',cursive",fontSize:13,cursor:'pointer',boxShadow:'inset 1px 1px 0 #fff' },
  footer: { display:'flex',gap:8,padding:'8px 14px',background:'#F0F0F0',borderTop:'1px solid #ddd',justifyContent:'flex-end' },
  desc: { fontFamily:"'Gaegu',cursive",fontSize:12,color:'#999',marginBottom:4 },
  sep: { color:'#999',fontSize:12 },
  smallBtn: { border:'1px solid #aaa',background:'#e0e0e0',fontSize:10,padding:'2px 6px',cursor:'pointer',borderRadius:2 },
  smallInput: { width:32,padding:'2px 4px',border:'1px solid #aaa',fontSize:11,fontFamily:"'Gaegu',cursive" },
  flexInput: { flex:1,minWidth:60,padding:'2px 4px',border:'1px solid #aaa',fontSize:11,fontFamily:"'Gaegu',cursive" },
  urlInput: { width:120,padding:'2px 4px',border:'1px solid #aaa',fontSize:11,fontFamily:"'Gaegu',cursive" },
};

export default function ConfigPanel({ onClose, onConfigChange, onPublish }) {
  const [config, setConfig] = useState(() => {
    try { return loadSiteConfig(); } catch(e) { return JSON.parse(JSON.stringify(defaultSiteConfig)); }
  });
  const [tab, setTab] = useState('general');
  const [pubStatus, setPubStatus] = useState('');

  const save = useCallback(() => {
    try { saveSiteConfig(config); } catch(e) {}
    onConfigChange?.(config);
    onClose();
  }, [config, onConfigChange, onClose]);

  const up = (k, v) => setConfig(p => ({ ...p, [k]: v }));
  const upAsset = (k, v) => setConfig(p => ({ ...p, customAssets: { ...(p.customAssets||{}), [k]: v || null } }));
  const upWinDeco = (t, v) => setConfig(p => ({ ...p, windowDecorations: { ...(p.windowDecorations||{}), [t]: v || null } }));

  const doPublish = useCallback(async () => {
    const token = config.githubToken;
    if (!token) { setPubStatus('❌ 请先填入 GitHub Token'); return; }
    setPubStatus('⏳ 发布中...');
    const fc = { ...config, dataVersion: (config.dataVersion || 0) + 1 };
    saveSiteConfig(fc); setConfig(fc);
    try {
      const r = await onPublish(token, fc.dataVersion);
      setPubStatus(r?.success ? '✅ 发布成功！约1分钟后访客可见。' : '❌ ' + (r?.error || '失败'));
    } catch(e) {
      setPubStatus('❌ ' + e.message);
    }
  }, [config, onPublish]);

  const addSM = () => {
    const items = [...(config.startMenuItems||[])];
    items.push({ id: 'link-' + Date.now(), label: '新链接', icon: '🔗', action: 'link', url: 'https://' });
    up('startMenuItems', items);
  };
  const upSM = (i, f, v) => {
    const items = [...(config.startMenuItems||[])];
    items[i] = { ...items[i], [f]: v };
    up('startMenuItems', items);
  };
  const delSM = (i) => {
    const items = [...(config.startMenuItems||[])];
    items.splice(i, 1);
    up('startMenuItems', items);
  };

  const tabs = ['general','appearance','cursor','windows','parts','deco','startmenu','publish'];
  const tabNames = { general:'常规', appearance:'外观', cursor:'光标', windows:'窗口', parts:'部件', deco:'装饰', startmenu:'菜单', publish:'发布' };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.titlebar}>
          <span>⚙️ 站点设置</span>
          <button style={{...styles.smallBtn,background:'#C0C0C0',borderColor:'#fff #808080 #808080 #fff',width:22,height:22,fontSize:10}} onClick={onClose}>✕</button>
        </div>
        <div style={styles.tabs}>
          {tabs.map(t => <button key={t} style={styles.tab(tab===t)} onClick={() => setTab(t)}>{tabNames[t]}</button>)}
        </div>
        <div style={styles.body}>
          {/* General */}
          {tab==='general' && <div style={styles.section}>
            <div style={styles.field}><label style={styles.label}>桌面名称</label><input style={styles.input} value={config.desktopName||''} onChange={e=>up('desktopName',e.target.value)}/></div>
            <div style={styles.field}><label style={styles.label}>GitHub Token</label><input style={styles.input} type="password" value={config.githubToken||''} onChange={e=>up('githubToken',e.target.value)}/><span style={styles.hint}>用于发布功能</span></div>
          </div>}
          {/* Appearance */}
          {tab==='appearance' && <div style={styles.section}>
            <div style={styles.field}><label style={styles.label}>壁纸 URL</label><input style={styles.input} value={config.wallpaper||''} onChange={e=>up('wallpaper',e.target.value||null)} placeholder="支持 WebP/GIF"/></div>
            <div style={styles.field}><label style={styles.label}>图标: {config.iconSize||72}px</label><input type="range" min="48" max="160" value={config.iconSize||72} onChange={e=>up('iconSize',Number(e.target.value))}/></div>
            <div style={styles.field}><label style={styles.label}><input type="checkbox" checked={config.parallaxEnabled!==false} onChange={e=>up('parallaxEnabled',e.target.checked)}/> 壁纸视差</label></div>
            {config.parallaxEnabled!==false && <div style={styles.field}><label style={styles.label}>强度: {config.parallaxStrength||8}</label><input type="range" min="2" max="20" value={config.parallaxStrength||8} onChange={e=>up('parallaxStrength',Number(e.target.value))}/></div>}
          </div>}
          {/* Cursor */}
          {tab==='cursor' && <div style={styles.section}>
            <p style={styles.desc}>自定义光标图片（留空=默认emoji）。建议 32×32 PNG。</p>
            {['Default','Pointer','Text','Grabbing','Move','Resize'].map(s => (
              <div style={styles.field} key={s}><label style={styles.label}>{s} 光标</label><input style={styles.input} value={config[`cursor${s}`]||''} onChange={e=>up(`cursor${s}`,e.target.value||null)}/></div>
            ))}
            <div style={styles.field}><label style={styles.label}>热点 X: {config.cursorHotspotX||4}</label><input type="range" min="0" max="31" value={config.cursorHotspotX||4} onChange={e=>up('cursorHotspotX',Number(e.target.value))}/></div>
            <div style={styles.field}><label style={styles.label}>热点 Y: {config.cursorHotspotY||4}</label><input type="range" min="0" max="31" value={config.cursorHotspotY||4} onChange={e=>up('cursorHotspotY',Number(e.target.value))}/></div>
          </div>}
          {/* Windows */}
          {tab==='windows' && <div style={styles.section}>
            <p style={styles.desc}>窗口背景装饰图。调整窗口大小后点标题栏💾保存默认尺寸。</p>
            {['folder','folder-large','image','video','markdown','link'].map(t => (
              <div style={styles.field} key={t}><label style={styles.label}>{t} 窗口背景</label><input style={styles.input} value={(config.windowDecorations||{})[t]||''} onChange={e=>upWinDeco(t,e.target.value)}/></div>
            ))}
          </div>}
          {/* Parts */}
          {tab==='parts' && <div style={styles.section}>
            <p style={styles.desc}>替换窗口各个部件的图片。</p>
            {Object.entries(HINTS).map(([k,hint]) => (
              <div style={styles.field} key={k}><label style={styles.label}>{k}</label><input style={styles.input} value={(config.customAssets||{})[k]||''} onChange={e=>upAsset(k,e.target.value)} placeholder="URL"/><span style={styles.hint}>建议: {hint}px</span></div>
            ))}
          </div>}
          {/* Decorations */}
          {tab==='deco' && <div style={styles.section}>
            {(!config.decorations||config.decorations.length===0) && <p style={{color:'#999',fontSize:13}}>暂无装饰。编辑模式下右键桌面添加。</p>}
            {(config.decorations||[]).map((d,i) => (
              <div key={d.id||i} style={{...styles.row,borderBottom:'1px solid #eee'}}>
                <span style={{fontSize:11,flex:1}}>{d.type==='image'?'🖼️':'📝'} {(d.content||'').substring(0,30)}</span>
                <button style={styles.smallBtn} onClick={()=>{const ds=[...(config.decorations||[])];ds.splice(i,1);up('decorations',ds);}}>✕</button>
              </div>
            ))}
          </div>}
          {/* Start Menu */}
          {tab==='startmenu' && <div style={styles.section}>
            {(config.startMenuItems||[]).map((item,i) => (
              <div key={i} style={styles.row}>
                {item.type==='separator' ? <span style={styles.sep}>— 分隔线 —</span> : <>
                  <input style={styles.smallInput} value={item.icon||''} onChange={e=>upSM(i,'icon',e.target.value)}/>
                  <input style={styles.flexInput} value={item.label||''} onChange={e=>upSM(i,'label',e.target.value)}/>
                  {item.action==='link' && <input style={styles.urlInput} value={item.url||''} onChange={e=>upSM(i,'url',e.target.value)} placeholder="URL"/>}
                  <label style={{fontSize:10}}><input type="checkbox" checked={!!item.adminOnly} onChange={e=>upSM(i,'adminOnly',e.target.checked)}/>管理</label>
                  <button style={styles.smallBtn} onClick={()=>delSM(i)}>✕</button>
                </>}
              </div>
            ))}
            <button style={styles.btn} onClick={addSM}>➕ 添加链接</button>
          </div>}
          {/* Publish */}
          {tab==='publish' && <div style={styles.section}>
            <p style={styles.desc}>将当前更改发布到 GitHub。约1分钟后所有访客可见。</p>
            <button style={{...styles.btn,background:'#C0FFC0',fontWeight:'bold',fontSize:14}} onClick={doPublish}>📤 发布到 GitHub</button>
            {pubStatus && <div style={{marginTop:8,padding:8,background:pubStatus.startsWith('✅')?'#E0FFE0':'#FFE0E0',borderRadius:4,fontSize:13}}>{pubStatus}</div>}
          </div>}
        </div>
        <div style={styles.footer}>
          <button style={styles.btn} onClick={()=>{if(confirm('恢复默认？')){const d=JSON.parse(JSON.stringify(defaultSiteConfig));setConfig(d);saveSiteConfig(d);onConfigChange?.(d);onClose();}}}>🔄 恢复</button>
          <button style={styles.btn} onClick={onClose}>取消</button>
          <button style={{...styles.btn,background:'#C0E0FF'}} onClick={save}>💾 保存设置</button>
        </div>
      </div>
    </div>
  );
}
