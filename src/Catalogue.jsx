import { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } from "react";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  lighting: { label: "Lighting Solutions", icon: "💡", color: "#F59E0B", sub: { indoor: "Indoor Lighting", outdoor: "Outdoor Lighting" } },
  fans: { label: "Fans", icon: "🌀", color: "#06B6D4", sub: {} },
  ventilation: { label: "Ventilation / Exhaust Fans", icon: "💨", color: "#8B5CF6", sub: {} },
  protection: { label: "Protection Devices", icon: "🛡️", color: "#EF4444", sub: {} },
  breakers: { label: "Circuit Breakers", icon: "⚡", color: "#10B981", sub: {} },
  sockets: { label: "Electrical Sockets", icon: "🔌", color: "#3B82F6", sub: {} },
};
const STATUS_TAGS = ["priority", "slow-moving", "new", "recommended", "focus"];

// ─── SEED DATA ────────────────────────────────────────────────────────────────
function generateProducts() {
  const P = []; let id = 1;
  const volts = ["220V","240V","110V"];
  const cols = ["Warm White","Cool White","Daylight","Natural White"];
  [
    {n:"LED Panel Light",w:[18,24,36,48],m:"PNL"},{n:"LED Downlight",w:[7,9,12,15,18],m:"DL"},
    {n:"LED Spotlight",w:[5,7,10],m:"SPL"},{n:"LED Tube Light",w:[9,18,22,36],m:"TBL"},
    {n:"LED Batten Light",w:[18,36,45],m:"BTN"},{n:"LED Ceiling Light",w:[12,18,24,36],m:"CLG"},
    {n:"LED Strip Light",w:[14.4,19.2,24],m:"STP"},{n:"LED Bulb",w:[4,6,8,10,12,15],m:"BLB"},
    {n:"LED Corn Bulb",w:[20,30,40,50],m:"CRN"},{n:"LED Track Light",w:[10,20,30],m:"TRK"},
    {n:"LED Surface Mount",w:[12,18,24],m:"SRF"},{n:"LED High Bay",w:[100,150,200,250],m:"HBY"},
    {n:"LED Linear Light",w:[20,40,60],m:"LNR"},{n:"Emergency LED Light",w:[3,5,8],m:"EMG"},
    {n:"LED Sensor Light",w:[7,9,12],m:"SNS"},
  ].forEach(({n,w,m})=>w.forEach((wt,wi)=>cols.slice(0,wi%2===0?4:2).forEach((c,ci)=>{
    const tags=[];if(id%7===0)tags.push("new");if(id%11===0)tags.push("recommended");if(id%17===0)tags.push("slow-moving");
    P.push({id:id++,name:`${n} ${wt}W ${c}`,sku:`AS-${m}-${wt}W-${ci+1}`,category:"lighting",subcategory:"indoor",shortDesc:`${wt}W ${c} LED, energy-efficient indoor`,fullDesc:`Al-Safi ${n} ${wt}W ${c}: ≥100lm/W, ≥30,000h life, instant start, ${volts[ci%3]}, CRI≥80. For offices, retail, homes.`,tags,image:null,specs:{wattage:`${wt}W`,color:c,voltage:volts[ci%3],lifespan:"30,000h"},isAdmin:false});
  })));
  [
    {n:"LED Street Light",w:[30,50,60,80,100,150],m:"STL"},{n:"LED Flood Light",w:[20,30,50,100,150,200],m:"FLD"},
    {n:"LED Garden Light",w:[10,15,20],m:"GDN"},{n:"LED Wall Washer",w:[18,24,36],m:"WWS"},
    {n:"LED Bollard Light",w:[5,8,12],m:"BLD"},{n:"LED Solar Street Light",w:[20,30,40,60],m:"SSL"},
    {n:"LED Area Light",w:[80,100,150],m:"ARL"},{n:"LED Canopy Light",w:[40,60,80],m:"CNP"},
    {n:"LED Billboard Light",w:[50,100,150],m:"BBL"},{n:"LED Step Light",w:[3,5],m:"STP2"},
  ].forEach(({n,w,m})=>w.forEach((wt,wi)=>{
    const ip=["IP65","IP66","IP67"][wi%3];const tags=[];if(id%9===0)tags.push("new");if(id%13===0)tags.push("priority");if(id%19===0)tags.push("slow-moving");
    P.push({id:id++,name:`${n} ${wt}W ${ip}`,sku:`AS-${m}-${wt}W-OUT`,category:"lighting",subcategory:"outdoor",shortDesc:`${wt}W outdoor LED, ${ip} rated`,fullDesc:`Al-Safi ${n} ${wt}W ${ip}: die-cast aluminium, 4kV surge, -20°C–+50°C. For streets, parking, facades.`,tags,image:null,specs:{wattage:`${wt}W`,ipRating:ip,voltage:"AC 100-277V"},isAdmin:false});
  }));
  [
    {n:"Ceiling Fan",v:["Classic","Modern","Premium","Economy"],m:"CF"},{n:"Stand Fan",v:["16-inch","18-inch","20-inch"],m:"SF"},
    {n:"Table Fan",v:["9-inch","12-inch","16-inch"],m:"TF"},{n:"Wall Fan",v:["16-inch","18-inch"],m:"WF"},
    {n:"Industrial Fan",v:["24-inch","30-inch","36-inch"],m:"IF"},{n:"Tower Fan",v:["36-inch","42-inch"],m:"TWF"},
    {n:"DC Ceiling Fan",v:["48-inch","52-inch","56-inch","60-inch"],m:"DCF"},{n:"BLDC Fan",v:["Economy","Standard","Premium"],m:"BLDC"},
  ].forEach(({n,v,m})=>v.forEach((vt,vi)=>[3,5].forEach(sp=>{
    const tags=[];if(id%8===0)tags.push("recommended");if(id%15===0)tags.push("slow-moving");if(id%22===0)tags.push("new");
    P.push({id:id++,name:`${n} ${vt} ${sp}-Speed`,sku:`AS-${m}-${vi+1}-S${sp}`,category:"fans",subcategory:"",shortDesc:`${vt} ${n} with ${sp}-speed motor`,fullDesc:`Al-Safi ${n} ${vt} ${sp}-speed: quiet <45dB, thermal protection, aerodynamic blades. For homes, offices, commercial.`,tags,image:null,specs:{speeds:sp,size:vt,noise:"<45dB"},isAdmin:false});
  })));
  [
    {n:"Exhaust Fan",s:["6-inch","8-inch","10-inch","12-inch"],m:"EXF"},{n:"Inline Fan",s:["4-inch","6-inch","8-inch","10-inch"],m:"ILF"},
    {n:"Centrifugal Fan",s:["200mm","250mm","315mm","400mm"],m:"CTF"},{n:"Axial Fan",s:["200mm","250mm","300mm","350mm","400mm"],m:"AXF"},
    {n:"Kitchen Hood Fan",s:["60cm","75cm","90cm"],m:"KHF"},{n:"Bathroom Exhaust Fan",s:["4-inch","5-inch","6-inch"],m:"BEF"},
    {n:"Fresh Air Unit",s:["150m³/h","300m³/h","500m³/h"],m:"FAU"},{n:"ERV Unit",s:["200m³/h","350m³/h","500m³/h"],m:"ERV"},
  ].forEach(({n,s,m})=>s.forEach((sz,si)=>{
    const tags=[];if(id%10===0)tags.push("new");if(id%16===0)tags.push("slow-moving");
    P.push({id:id++,name:`${n} ${sz}`,sku:`AS-${m}-${si+1}`,category:"ventilation",subcategory:"",shortDesc:`${sz} ${n} for efficient air extraction`,fullDesc:`Al-Safi ${n} ${sz}: low-noise, IPX4, auto-louvers. For kitchens, bathrooms, offices.`,tags,image:null,specs:{size:sz,airflow:`${(si+1)*80}m³/h`},isAdmin:false});
  }));
  [
    {n:"MCB",r:["6A","10A","16A","20A","25A","32A","40A","50A","63A"],m:"MCB",p:["1P","2P","3P","4P"]},
    {n:"RCCB",r:["25A","40A","63A","80A","100A"],m:"RCC",p:["2P","4P"]},
    {n:"RCBO",r:["6A","10A","16A","20A","25A","32A"],m:"RCB",p:["1P+N"]},
    {n:"Surge Protector",r:["T1","T2","T1+T2"],m:"SPD",p:["1P","3P","3P+N"]},
    {n:"Isolator Switch",r:["32A","63A","100A","125A"],m:"ISO",p:["2P","3P","4P"]},
    {n:"Earth Leakage Relay",r:["0.03A","0.1A","0.3A","1A"],m:"ELR",p:["1P"]},
    {n:"Timer Switch",r:["16A","20A"],m:"TMR",p:[""]},
    {n:"Voltage Monitor Relay",r:["8A","16A"],m:"VMR",p:[""]},
  ].forEach(({n,r,m,p})=>r.forEach((rt,ri)=>p.slice(0,2).forEach((po,pi)=>{
    const tags=[];if(id%12===0)tags.push("priority");if(id%18===0)tags.push("slow-moving");if(id%24===0)tags.push("recommended");
    P.push({id:id++,name:`${n} ${rt}${po?" "+po:""}`,sku:`AS-${m}-${rt}-${po||"STD"}`,category:"protection",subcategory:"",shortDesc:`${rt}${po?" "+po:""} ${n}, IEC certified`,fullDesc:`Al-Safi ${n} ${rt}${po?" "+po:""}: fast trip, DIN rail, 6–10kA. For residential and commercial.`,tags,image:null,specs:{rating:rt,poles:po,standard:"IEC 60898"},isAdmin:false});
  })));
  [
    {n:"MCCB",r:["100A","160A","250A","400A","630A"],m:"MCC",p:["3P","4P"]},
    {n:"ACB",r:["800A","1000A","1600A","2000A","2500A","3200A"],m:"ACB",p:["3P","4P"]},
    {n:"VCB",r:["630A","1250A","2500A"],m:"VCB",p:["3P"]},
    {n:"ELCB",r:["63A","100A","125A"],m:"ELC",p:["2P","4P"]},
    {n:"Transfer Switch",r:["63A","100A","160A","250A"],m:"ATS",p:["3P","4P"]},
    {n:"Motor Protection CB",r:["0.1-0.16A","1-1.6A","4-6.3A","10-16A","25-40A"],m:"MPC",p:["3P"]},
  ].forEach(({n,r,m,p})=>r.forEach((rt,ri)=>p.forEach((po,pi)=>{
    const tags=[];if(id%14===0)tags.push("new");if(id%20===0)tags.push("slow-moving");if(id%26===0)tags.push("priority");
    P.push({id:id++,name:`${n} ${rt} ${po}`,sku:`AS-${m}-${ri+1}${pi+1}`,category:"breakers",subcategory:"",shortDesc:`${rt} ${po} ${n}, industrial grade`,fullDesc:`Al-Safi ${n} ${rt} ${po}: high breaking capacity, adjustable trip, motorized option. For industrial and commercial.`,tags,image:null,specs:{rating:rt,poles:po,breakingCapacity:"50kA"},isAdmin:false});
  })));
  [
    {n:"UK Socket Outlet",t:["1G","2G","3G","4G","6G"],m:"UKS",s:["White","Ivory","Silver"]},
    {n:"USB Socket",t:["1G USB-A","2G USB-A","1G USB-C","2G USB-C+A"],m:"USB",s:["White","Black"]},
    {n:"Industrial Socket",t:["16A 3P+E","32A 3P+E","16A 3P+N+E","32A 3P+N+E"],m:"IND",s:[""]},
    {n:"Schuko Socket",t:["1G","2G"],m:"SCH",s:["White","Ivory"]},
    {n:"Weatherproof Socket",t:["IP44 1G","IP55 1G","IP65 1G"],m:"WPS",s:["Grey"]},
    {n:"RCD Socket",t:["13A 30mA","16A 30mA"],m:"RCD",s:["White"]},
    {n:"Data Socket RJ45",t:["Cat5e","Cat6","Cat6A"],m:"RJ4",s:["White","Ivory"]},
    {n:"Switch Socket Combo",t:["1G+1SW","2G+2SW","3G+1SW"],m:"SSC",s:["White","Ivory","Silver"]},
  ].forEach(({n,t,m,s})=>t.forEach((ty,ti)=>s.slice(0,2).forEach((st,si)=>{
    const tags=[];if(id%11===0)tags.push("new");if(id%17===0)tags.push("slow-moving");if(id%23===0)tags.push("recommended");
    P.push({id:id++,name:`${n} ${ty}${st?" "+st:""}`,sku:`AS-${m}-${ti+1}-${si+1}`,category:"sockets",subcategory:"",shortDesc:`${ty} ${n}${st?" in "+st:""}, BS standard`,fullDesc:`Al-Safi ${n} ${ty}${st?" "+st:""}: BS1363 compliant, child-safe shutters, flush-fit, robust ABS/PC housing.`,tags,image:null,specs:{type:ty,finish:st||"Standard",standard:"BS1363"},isAdmin:false});
  })));
  return P;
}

const SEED = generateProducts();

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const Ctx = createContext(null);
const useProducts = () => useContext(Ctx);

function ProductProvider({ children }) {
  const [products, setProducts] = useState(SEED);
  const [nextId, setNextId] = useState(SEED.length + 1);
  const add = useCallback((d) => {
    const p = { ...d, id: nextId, isAdmin: true, specs: {} };
    setProducts(prev => [p, ...prev]);
    setNextId(n => n + 1);
    return p;
  }, [nextId]);
  const update = useCallback((id, d) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...d } : p)), []);
  const remove = useCallback((id) => setProducts(prev => prev.filter(p => p.id !== id)), []);
  return <Ctx.Provider value={{ products, add, update, remove }}>{children}</Ctx.Provider>;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ic = {
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  List: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Heart: ({ f }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={f?"#EF4444":"none"} stroke={f?"#EF4444":"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  X: ({ s=14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Star: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Chev: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Eye: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trophy: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 11 12 15 16 11"/><circle cx="12" cy="7" r="4"/><path d="M6 7H4a2 2 0 0 0-2 2v.5a2 2 0 0 0 2 2h2"/><path d="M18 7h2a2 2 0 0 1 2 2v.5a2 2 0 0 1-2 2h-2"/><path d="M8 21h8"/><path d="M12 15v6"/></svg>,
  Plus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Upload: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getCatIcon = (cat) => CATEGORIES[cat]?.icon || "📦";
function hl(text, q) {
  if (!q) return text;
  const rx = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi");
  return text.split(rx).map((p,i) => rx.test(p) ? `<mark>${p}</mark>` : p).join("");
}
function fuzzy(products, q) {
  if (!q.trim()) return products;
  const lq = q.toLowerCase(), terms = lq.split(/\s+/);
  return products.filter(p => {
    const h = [p.name,p.sku,p.shortDesc,p.fullDesc,CATEGORIES[p.category]?.label,CATEGORIES[p.category]?.sub[p.subcategory],...p.tags].filter(Boolean).join(" ").toLowerCase();
    return terms.every(t => h.includes(t));
  }).sort((a,b) => {
    const an=a.name.toLowerCase(),bn=b.name.toLowerCase();
    if(an.startsWith(lq))return -1;if(bn.startsWith(lq))return 1;
    if(an.includes(lq))return -1;if(bn.includes(lq))return 1;
    return 0;
  });
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0A0E1A;--sf:#111827;--sf2:#1C2333;--sf3:#243047;
    --bd:rgba(255,255,255,0.07);--bd2:rgba(255,255,255,0.12);
    --t:#F1F5F9;--t2:#94A3B8;--t3:#64748B;
    --acc:#3B82F6;--gold:#F59E0B;--ok:#10B981;--err:#EF4444;--pu:#8B5CF6;--cy:#06B6D4;
    --r:12px;--shadow:0 4px 24px rgba(0,0,0,.3);--shadowL:0 8px 40px rgba(0,0,0,.4);
    --font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;
    --sb:260px;--hh:64px;--tr:0.18s cubic-bezier(.4,0,.2,1);
  }
  html,body,#root{height:100%;font-family:var(--font)}
  body{background:var(--bg);color:var(--t);overflow:hidden}
  .app{display:flex;height:100vh;overflow:hidden}

  /* SIDEBAR */
  .sb{width:var(--sb);min-width:var(--sb);background:var(--sf);border-right:1px solid var(--bd);display:flex;flex-direction:column;overflow:hidden;z-index:100}
  .sb-logo{padding:18px 20px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px}
  .logo-m{width:36px;height:36px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;flex-shrink:0}
  .logo-t{font-size:14px;font-weight:700;color:var(--t);line-height:1.2}
  .logo-s{font-size:10px;color:var(--t3);letter-spacing:.5px}
  .sb-nav{flex:1;overflow-y:auto;padding:12px 10px}
  .sb-nav::-webkit-scrollbar{width:4px}
  .sb-nav::-webkit-scrollbar-thumb{background:var(--sf3);border-radius:2px}
  .ns{margin-bottom:6px}
  .nl{font-size:9px;font-weight:700;color:var(--t3);letter-spacing:1.2px;text-transform:uppercase;padding:8px 10px 4px}
  .ni{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:var(--t2);transition:all var(--tr);position:relative;user-select:none}
  .ni:hover{background:var(--sf2);color:var(--t)}
  .ni.on{background:rgba(59,130,246,.15);color:var(--acc)}
  .ni.on::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:var(--acc);border-radius:0 3px 3px 0}
  .ni.adm.on{background:rgba(139,92,246,.15);color:var(--pu)}
  .ni.adm.on::before{background:var(--pu)}
  .ni.adm:hover{background:rgba(139,92,246,.06)}
  .n-ico{font-size:16px;width:20px;text-align:center}
  .n-cnt{margin-left:auto;font-size:10px;font-weight:600;background:var(--sf3);color:var(--t3);padding:2px 6px;border-radius:20px;font-family:var(--mono)}
  .ni.on .n-cnt{background:rgba(59,130,246,.2);color:var(--acc)}
  .sub-nav{padding-left:30px}
  .sub-nav .ni{padding:7px 10px;font-size:12px}
  .sb-foot{padding:12px;border-top:1px solid var(--bd)}
  .stat-g{background:var(--sf2);border-radius:10px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .s-it{text-align:center}
  .s-v{font-size:16px;font-weight:700;color:var(--t);font-family:var(--mono)}
  .s-l{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px}

  /* MAIN */
  .mn{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
  .hd{height:var(--hh);min-height:var(--hh);background:var(--sf);border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:12px;padding:0 20px;z-index:50}
  .pt{font-size:16px;font-weight:700;color:var(--t);white-space:nowrap}
  
  /* SEARCH */
  .sw{flex:1;max-width:520px;position:relative}
  .si{width:100%;background:var(--sf2);border:1.5px solid var(--bd);border-radius:10px;padding:9px 14px 9px 38px;font-size:13px;font-family:var(--font);color:var(--t);outline:none;transition:all var(--tr)}
  .si:focus{border-color:var(--acc);background:var(--sf3);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  .si::placeholder{color:var(--t3)}
  .s-ic{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none}
  .s-cl{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--t3);cursor:pointer;padding:2px;border-radius:4px;display:flex}
  .s-cl:hover{color:var(--t)}
  .s-dd{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--sf);border:1px solid var(--bd2);border-radius:12px;box-shadow:var(--shadowL);z-index:999;max-height:400px;overflow-y:auto}
  .s-ri{display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;transition:background var(--tr);border-bottom:1px solid var(--bd)}
  .s-ri:last-child{border-bottom:none}
  .s-ri:hover{background:var(--sf2)}
  .s-rth{width:36px;height:36px;border-radius:8px;background:var(--sf2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden}
  .s-rth img{width:100%;height:100%;object-fit:cover}
  .s-rn{font-size:13px;font-weight:500;color:var(--t)}
  .s-rm{font-size:11px;color:var(--t3);margin-top:1px}
  .s-rsk{margin-left:auto;font-size:10px;font-family:var(--mono);color:var(--t3)}
  .s-em{padding:24px;text-align:center;color:var(--t3);font-size:13px}
  .ha{display:flex;align-items:center;gap:8px;margin-left:auto}
  .ib{width:36px;height:36px;border-radius:8px;background:var(--sf2);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t2);transition:all var(--tr)}
  .ib:hover{background:var(--sf3);color:var(--t)}
  .ib.on{background:rgba(59,130,246,.15);color:var(--acc);border-color:rgba(59,130,246,.3)}

  .scrl{flex:1;overflow-y:auto}
  .scrl::-webkit-scrollbar{width:6px}
  .scrl::-webkit-scrollbar-thumb{background:var(--sf3);border-radius:3px}

  /* FILTERS */
  .fb{background:var(--sf);border-bottom:1px solid var(--bd);padding:10px 20px;display:flex;align-items:center;gap:8px;overflow-x:auto;flex-shrink:0}
  .fb::-webkit-scrollbar{display:none}
  .fl{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
  .fc{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1.5px solid var(--bd2);background:transparent;color:var(--t2);cursor:pointer;transition:all var(--tr);white-space:nowrap;display:flex;align-items:center;gap:5px}
  .fc:hover{border-color:var(--acc);color:var(--acc)}
  .fc.on{background:rgba(59,130,246,.15);border-color:var(--acc);color:var(--acc)}
  .fdiv{width:1px;height:20px;background:var(--bd);flex-shrink:0}
  .rb{padding:10px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--bd);background:var(--sf);flex-shrink:0}
  .rc{font-size:12px;color:var(--t3)}
  .rc strong{color:var(--t)}

  /* PRODUCT GRID */
  .pa{padding:16px 20px}
  .pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
  .pg.lv{grid-template-columns:1fr;gap:8px}
  
  /* PRODUCT CARD */
  .pc{background:var(--sf);border:1.5px solid var(--bd);border-radius:12px;overflow:hidden;cursor:pointer;transition:all var(--tr);position:relative}
  .pc:hover{border-color:var(--bd2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.3)}
  .pc.lc{display:flex;align-items:center}
  .pc.adm{border-color:rgba(139,92,246,.22)}
  .ci{height:130px;background:var(--sf2);display:flex;align-items:center;justify-content:center;font-size:48px;border-bottom:1px solid var(--bd);position:relative;overflow:hidden}
  .ci img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .ci .ce{position:relative;z-index:1}
  .lc .ci{width:70px;height:70px;min-width:70px;border-right:1px solid var(--bd);border-bottom:none;border-radius:0;font-size:28px}
  .cb{padding:12px;flex:1;min-width:0}
  .cn{font-size:13px;font-weight:600;color:var(--t);margin-bottom:4px;line-height:1.3}
  .lc .cn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
  .cd{font-size:11px;color:var(--t2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .lc .cd{-webkit-line-clamp:1}
  .csk{font-size:10px;font-family:var(--mono);color:var(--t3);margin-top:6px}
  .ct{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
  .tag{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:2px 7px;border-radius:20px}
  .tag.priority{background:rgba(239,68,68,.15);color:#F87171}
  .tag.slow-moving{background:rgba(245,158,11,.15);color:#FCD34D}
  .tag.new{background:rgba(16,185,129,.15);color:#34D399}
  .tag.recommended{background:rgba(59,130,246,.15);color:#60A5FA}
  .tag.focus{background:rgba(139,92,246,.15);color:#A78BFA}
  .tag.admt{background:rgba(139,92,246,.2);color:#C4B5FD}
  .ca{position:absolute;top:8px;right:8px;display:flex;gap:4px;opacity:0;transition:opacity var(--tr)}
  .pc:hover .ca{opacity:1}
  .cab{width:28px;height:28px;background:rgba(17,24,39,.85);backdrop-filter:blur(8px);border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t2);transition:all var(--tr);border:1px solid var(--bd)}
  .cab:hover{color:var(--t)}
  .cab.fv{color:#EF4444}
  .cbadge{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:2px 7px;border-radius:4px;background:var(--sf3);color:var(--t3);margin-bottom:6px;display:inline-block}

  /* MODAL */
  .ov{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fi .15s ease}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  .mod{background:var(--sf);border:1.5px solid var(--bd2);border-radius:20px;width:100%;max-width:720px;max-height:85vh;overflow-y:auto;animation:su .2s cubic-bezier(.34,1.56,.64,1);box-shadow:var(--shadowL)}
  .mod.adm-mod{max-width:680px}
  .mod.cf-mod{max-width:420px}
  @keyframes su{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
  .mod::-webkit-scrollbar{width:4px}
  .mod::-webkit-scrollbar-thumb{background:var(--sf3);border-radius:2px}
  .mh{padding:20px 24px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:flex-start;gap:16px}
  .mth{width:80px;height:80px;min-width:80px;background:var(--sf2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:42px;border:1.5px solid var(--bd);overflow:hidden}
  .mth img{width:100%;height:100%;object-fit:cover}
  .mti{font-size:18px;font-weight:700;color:var(--t);margin-bottom:4px}
  .msk{font-size:12px;font-family:var(--mono);color:var(--acc)}
  .mcl{margin-left:auto;width:32px;height:32px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--t2);flex-shrink:0;transition:all var(--tr)}
  .mcl:hover{background:var(--sf3);color:var(--t)}
  .mb{padding:20px 24px}
  .ms{margin-bottom:20px}
  .mst{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--bd)}
  .mdc{font-size:13px;color:var(--t2);line-height:1.7}
  .sg{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
  .si2{background:var(--sf2);border-radius:8px;padding:10px 12px;border:1px solid var(--bd)}
  .sk{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
  .sv{font-size:13px;font-weight:600;color:var(--t)}
  .rg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .ri{background:var(--sf2);border-radius:8px;padding:10px;cursor:pointer;transition:all var(--tr);border:1px solid var(--bd)}
  .ri:hover{border-color:var(--acc)}
  .ric{font-size:24px;margin-bottom:4px}
  .rin{font-size:11px;font-weight:500;color:var(--t);line-height:1.3}

  /* FOCUS */
  .fh{background:linear-gradient(135deg,#1C2333 0%,#1a1f35 50%,#1C2333 100%);border-bottom:1px solid var(--bd);padding:24px 24px 20px;position:relative;overflow:hidden}
  .fh::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(245,158,11,.08) 0%,transparent 70%);pointer-events:none}
  .fht{font-size:22px;font-weight:800;color:var(--t);display:flex;align-items:center;gap:10px}
  .fhs{font-size:13px;color:var(--t2);margin-top:4px}
  .fst{display:flex;gap:20px;margin-top:16px}
  .fstv{font-size:22px;font-weight:800;font-family:var(--mono)}
  .fstl{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px}
  .fs{padding:0 20px 20px}
  .fch{display:flex;align-items:center;gap:10px;padding:14px 0 10px;border-bottom:1px solid var(--bd);margin-bottom:12px;cursor:pointer}
  .fct{font-size:15px;font-weight:700;color:var(--t)}
  .fcc{font-size:11px;color:var(--t3);margin-left:auto;font-family:var(--mono)}
  .chv{transition:transform var(--tr)}
  .chv.op{transform:rotate(180deg)}

  /* RECENTLY VIEWED */
  .rv{padding:10px 20px;border-bottom:1px solid var(--bd);background:var(--sf)}
  .rvt{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;display:flex;align-items:center;gap:6px}
  .rvl{display:flex;gap:8px;overflow-x:auto}
  .rvl::-webkit-scrollbar{display:none}
  .rvc{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 8px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;cursor:pointer;white-space:nowrap;transition:all var(--tr);font-size:12px;color:var(--t2)}
  .rvc:hover{border-color:var(--bd2);color:var(--t)}

  /* EMPTY */
  .emp{text-align:center;padding:60px 24px;color:var(--t3)}
  .emp-i{font-size:48px;margin-bottom:12px}
  .emp-t{font-size:16px;font-weight:600;color:var(--t2);margin-bottom:4px}
  .emp-s{font-size:13px}
  mark{background:rgba(245,158,11,.25);color:var(--gold);border-radius:2px}

  /* ─── ADMIN ──────────────────────────────────────────────────────────────── */
  .adp{display:flex;flex-direction:column;height:100%;overflow:hidden}
  .adh{background:linear-gradient(135deg,#1a1230 0%,#1C2333 60%,#0f1a2e 100%);border-bottom:1px solid var(--bd);padding:20px 24px;position:relative;overflow:hidden;flex-shrink:0}
  .adh::before{content:'';position:absolute;top:-30px;right:-30px;width:180px;height:180px;background:radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%);pointer-events:none}
  .adht{font-size:20px;font-weight:800;color:var(--t);display:flex;align-items:center;gap:10px}
  .adhs{font-size:12px;color:var(--t3);margin-top:3px}
  .adss{display:flex;gap:16px;margin-top:14px;flex-wrap:wrap}
  .ads{background:rgba(255,255,255,.04);border:1px solid var(--bd);border-radius:10px;padding:10px 16px}
  .adsv{font-size:20px;font-weight:800;font-family:var(--mono);color:var(--pu)}
  .adsl{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px}

  .adtb{display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid var(--bd);background:var(--sf);flex-shrink:0;flex-wrap:wrap}
  .asw{position:relative;flex:1;min-width:200px;max-width:360px}
  .asi{width:100%;background:var(--sf2);border:1.5px solid var(--bd);border-radius:10px;padding:8px 12px 8px 36px;font-size:13px;font-family:var(--font);color:var(--t);outline:none;transition:all var(--tr)}
  .asi:focus{border-color:var(--pu);box-shadow:0 0 0 3px rgba(139,92,246,.12)}
  .asi::placeholder{color:var(--t3)}
  .as-ic{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none}

  .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all var(--tr);border:none;font-family:var(--font);white-space:nowrap}
  .bp{background:linear-gradient(135deg,#3B82F6,#1D4ED8);color:#fff}
  .bp:hover{background:linear-gradient(135deg,#2563EB,#1e40af);box-shadow:0 4px 16px rgba(59,130,246,.3)}
  .bpu{background:linear-gradient(135deg,#8B5CF6,#6D28D9);color:#fff}
  .bpu:hover{background:linear-gradient(135deg,#7C3AED,#5B21B6);box-shadow:0 4px 16px rgba(139,92,246,.3)}
  .bd2{background:rgba(239,68,68,.12);color:#F87171;border:1px solid rgba(239,68,68,.25)}
  .bd2:hover{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.4)}
  .bg{background:var(--sf2);color:var(--t2);border:1px solid var(--bd2)}
  .bg:hover{background:var(--sf3);color:var(--t)}
  .bsm{padding:6px 12px;font-size:12px;border-radius:7px}
  .bic{width:32px;height:32px;padding:0;border-radius:7px;justify-content:center}

  /* TABLE */
  .atw{flex:1;overflow-y:auto;padding:16px 20px}
  .atw::-webkit-scrollbar{width:6px}
  .atw::-webkit-scrollbar-thumb{background:var(--sf3);border-radius:3px}
  .at{width:100%;border-collapse:separate;border-spacing:0}
  .at thead tr{background:var(--sf2)}
  .at th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--bd);white-space:nowrap}
  .at td{padding:10px 14px;font-size:13px;color:var(--t2);border-bottom:1px solid var(--bd);vertical-align:middle}
  .at tr:last-child td{border-bottom:none}
  .at tbody tr{background:var(--sf);transition:background var(--tr)}
  .at tbody tr:hover{background:var(--sf2)}
  .at tbody tr.ar{background:rgba(139,92,246,.04)}
  .at tbody tr.ar:hover{background:rgba(139,92,246,.09)}
  .timg{width:40px;height:40px;border-radius:8px;background:var(--sf2);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden}
  .timg img{width:100%;height:100%;object-fit:cover}
  .tn{font-weight:600;color:var(--t);font-size:13px;max-width:220px;line-height:1.3}
  .tsk{font-size:11px;font-family:var(--mono);color:var(--t3)}
  .tac{display:flex;gap:6px}
  .tbg{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:2px 8px;border-radius:20px;background:rgba(139,92,246,.15);color:#A78BFA}
  .tbg.sd{background:var(--sf3);color:var(--t3)}

  /* FORM */
  .fmh{padding:20px 24px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:12px}
  .fmti{font-size:16px;font-weight:700;color:var(--t)}
  .fmts{font-size:12px;color:var(--t3);margin-top:2px}
  .fmb{padding:20px 24px}
  .fg{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .fgr{display:flex;flex-direction:column;gap:6px}
  .fgr.full{grid-column:1/-1}
  .flb{font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.5px}
  .flb span{color:var(--err);margin-left:2px}
  .fi,.fsl,.fta{background:var(--sf2);border:1.5px solid var(--bd);border-radius:9px;padding:9px 12px;font-size:13px;font-family:var(--font);color:var(--t);outline:none;transition:all var(--tr);width:100%}
  .fi:focus,.fsl:focus,.fta:focus{border-color:var(--pu);box-shadow:0 0 0 3px rgba(139,92,246,.12);background:var(--sf3)}
  .fi::placeholder,.fta::placeholder{color:var(--t3)}
  .fsl{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
  .fsl option{background:#1C2333}
  .fta{resize:vertical;min-height:80px;line-height:1.5}
  .fi.er,.fsl.er,.fta.er{border-color:var(--err)}
  .fer{font-size:11px;color:var(--err);margin-top:2px}
  
  /* IMAGE UPLOAD */
  .iuz{border:2px dashed var(--bd2);border-radius:12px;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all var(--tr);background:var(--sf2);min-height:120px;position:relative;overflow:hidden}
  .iuz:hover{border-color:var(--pu);background:rgba(139,92,246,.05)}
  .iuz.hi{border-style:solid;border-color:var(--pu);padding:0}
  .iuz img{width:100%;height:100%;object-fit:cover;border-radius:10px}
  .iut{font-size:12px;color:var(--t3);text-align:center}
  .iuh{font-size:10px;color:var(--t3);opacity:.6}
  .iuov{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;opacity:0;transition:opacity var(--tr);border-radius:10px}
  .iuz:hover .iuov{opacity:1}
  .iuovt{font-size:12px;color:#fff;font-weight:600}

  /* TAG SELECTOR */
  .tgs{display:flex;flex-wrap:wrap;gap:6px}
  .tgo{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid var(--bd2);color:var(--t3);transition:all var(--tr)}
  .tgo:hover{color:var(--t2)}
  .tgo.sel.priority{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);color:#F87171}
  .tgo.sel.slow-moving{background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.4);color:#FCD34D}
  .tgo.sel.new{background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.4);color:#34D399}
  .tgo.sel.recommended{background:rgba(59,130,246,.15);border-color:rgba(59,130,246,.4);color:#60A5FA}
  .tgo.sel.focus{background:rgba(139,92,246,.15);border-color:rgba(139,92,246,.4);color:#A78BFA}

  .fmf{padding:16px 24px;border-top:1px solid var(--bd);display:flex;gap:10px;justify-content:flex-end}

  /* CONFIRM */
  .cfb{padding:28px 28px 20px;text-align:center}
  .cfi{width:56px;height:56px;border-radius:16px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--err)}
  .cft{font-size:17px;font-weight:700;color:var(--t);margin-bottom:8px}
  .cfs{font-size:13px;color:var(--t3);line-height:1.5}
  .cff{padding:0 24px 24px;display:flex;gap:10px;justify-content:center}

  /* TOAST */
  .tc{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
  .tst{background:var(--sf);border:1.5px solid var(--bd2);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:var(--shadowL);animation:ti .25s cubic-bezier(.34,1.56,.64,1);min-width:280px}
  .tst.ok{border-color:rgba(16,185,129,.3)}
  .tst.err{border-color:rgba(239,68,68,.3)}
  @keyframes ti{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
  .tsi{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .tst.ok .tsi{background:rgba(16,185,129,.15);color:var(--ok)}
  .tst.err .tsi{background:rgba(239,68,68,.15);color:var(--err)}
  .tsm{font-size:13px;font-weight:500;color:var(--t)}
  .pn{text-align:center;padding:16px;color:var(--t3);font-size:12px}
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, show };
}

function Toasts({ toasts }) {
  return (
    <div className="tc">
      {toasts.map(t => (
        <div key={t.id} className={`tst ${t.type}`}>
          <div className="tsi">{t.type === "ok" ? <Ic.Check /> : <Ic.X />}</div>
          <div className="tsm">{t.msg}</div>
        </div>
      ))}
    </div>
  );
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
function ImgUpload({ value, onChange }) {
  const ref = useRef();
  const pick = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => onChange(ev.target.result);
    r.readAsDataURL(f);
  };
  return (
    <div className={`iuz ${value ? "hi" : ""}`} onClick={() => ref.current.click()}>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={pick} />
      {value ? (
        <><img src={value} alt="Preview" /><div className="iuov"><Ic.Upload /><div className="iuovt">Replace Image</div></div></>
      ) : (
        <><Ic.Upload /><div className="iut">Click to upload product image</div><div className="iuh">PNG, JPG, WEBP — up to 10MB</div></>
      )}
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────────
const BLANK = { name: "", sku: "", shortDesc: "", fullDesc: "", category: "", subcategory: "", tags: [], image: null };

function ProductForm({ initial, onSave, onClose, title }) {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const [err, setErr] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(e => ({ ...e, [k]: null })); };
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (!form.shortDesc.trim()) e.shortDesc = "Short description is required";
    if (!form.category) e.category = "Category is required";
    setErr(e); return !Object.keys(e).length;
  };
  const subs = CATEGORIES[form.category]?.sub || {};
  const hasSub = Object.keys(subs).length > 0;
  const toggleTag = (t) => set("tags", form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t]);

  return (
    <div className="ov" onClick={onClose}>
      <div className="mod adm-mod" onClick={e => e.stopPropagation()}>
        <div className="fmh">
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic.Shield />
          </div>
          <div><div className="fmti">{title}</div><div className="fmts">Fill in the product details below</div></div>
          <div className="mcl" style={{ marginLeft: "auto" }} onClick={onClose}><Ic.X /></div>
        </div>

        <div className="fmb">
          <div className="fg">
            <div className="fgr">
              <label className="flb">Product Name <span>*</span></label>
              <input className={`fi ${err.name ? "er" : ""}`} placeholder="e.g. LED Panel Light 24W" value={form.name} onChange={e => set("name", e.target.value)} />
              {err.name && <div className="fer">{err.name}</div>}
            </div>
            <div className="fgr">
              <label className="flb">SKU / Product Code <span>*</span></label>
              <input className={`fi ${err.sku ? "er" : ""}`} placeholder="e.g. AS-PNL-24W" value={form.sku} onChange={e => set("sku", e.target.value)} />
              {err.sku && <div className="fer">{err.sku}</div>}
            </div>
            <div className="fgr">
              <label className="flb">Main Category <span>*</span></label>
              <select className={`fsl ${err.category ? "er" : ""}`} value={form.category}
                onChange={e => { set("category", e.target.value); set("subcategory", ""); }}>
                <option value="">Select category…</option>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              {err.category && <div className="fer">{err.category}</div>}
            </div>
            <div className="fgr">
              <label className="flb">Subcategory</label>
              <select className="fsl" value={form.subcategory} onChange={e => set("subcategory", e.target.value)} disabled={!hasSub}>
                <option value="">{hasSub ? "Select subcategory…" : "No subcategories"}</option>
                {Object.entries(subs).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="fgr full">
              <label className="flb">Short Description <span>*</span></label>
              <input className={`fi ${err.shortDesc ? "er" : ""}`} placeholder="Brief one-line description for catalogue cards" value={form.shortDesc} onChange={e => set("shortDesc", e.target.value)} />
              {err.shortDesc && <div className="fer">{err.shortDesc}</div>}
            </div>
            <div className="fgr full">
              <label className="flb">Full Description</label>
              <textarea className="fta" rows={4} placeholder="Detailed product description, features, applications…" value={form.fullDesc} onChange={e => set("fullDesc", e.target.value)} />
            </div>
            <div className="fgr">
              <label className="flb">Status Tags</label>
              <div className="tgs">
                {STATUS_TAGS.map(t => (
                  <div key={t} className={`tgo ${t} ${form.tags.includes(t) ? "sel" : ""}`} onClick={() => toggleTag(t)}>{t}</div>
                ))}
              </div>
            </div>
            <div className="fgr">
              <label className="flb">Product Image</label>
              <ImgUpload value={form.image} onChange={v => set("image", v)} />
            </div>
          </div>
        </div>

        <div className="fmf">
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn bpu" onClick={() => validate() && onSave(form)}><Ic.Check /> Save Product</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
function ConfirmDel({ product, onConfirm, onClose }) {
  return (
    <div className="ov" onClick={onClose}>
      <div className="mod cf-mod" onClick={e => e.stopPropagation()}>
        <div className="cfb">
          <div className="cfi"><Ic.Trash /></div>
          <div className="cft">Delete Product?</div>
          <div className="cfs">
            You are about to permanently delete<br />
            <strong style={{ color: "var(--t)" }}>{product.name}</strong><br />
            <span style={{ color: "var(--acc)", fontFamily: "var(--mono)", fontSize: 11 }}>{product.sku}</span><br /><br />
            This cannot be undone. The product will be immediately removed from the catalogue and the Priority Sales Board.
          </div>
        </div>
        <div className="cff">
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn bd2" onClick={onConfirm}><Ic.Trash /> Delete Product</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ onToast }) {
  const { products, add, update, remove } = useProducts();
  const [q, setQ] = useState("");
  const [catF, setCatF] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const list = useMemo(() => {
    let r = [...products];
    if (catF) r = r.filter(p => p.category === catF);
    if (q.trim()) r = fuzzy(r, q);
    return r;
  }, [products, catF, q]);

  const adminCount = products.filter(p => p.isAdmin).length;
  const focusCount = products.filter(p => p.tags.some(t => ["slow-moving","priority"].includes(t))).length;

  const handleAdd = (form) => {
    add(form);
    setShowAdd(false);
    onToast(`"${form.name}" added to catalogue`, "ok");
  };
  const handleEdit = (form) => {
    update(editing.id, form);
    setEditing(null);
    onToast(`"${form.name}" updated`, "ok");
  };
  const handleDel = () => {
    remove(delTarget.id);
    onToast(`"${delTarget.name}" removed from catalogue`, "err");
    setDelTarget(null);
  };

  return (
    <div className="adp">
      {/* Hero */}
      <div className="adh">
        <div className="adht"><Ic.Shield /> Admin Panel — Product Management</div>
        <div className="adhs">Add, edit, and delete products. All changes reflect immediately in the Sales Catalogue and Priority Sales Board.</div>
        <div className="adss">
          <div className="ads"><div className="adsv">{products.length.toLocaleString()}</div><div className="adsl">Total Products</div></div>
          <div className="ads"><div className="adsv" style={{ color: "var(--ok)" }}>{adminCount}</div><div className="adsl">Admin Added</div></div>
          <div className="ads"><div className="adsv" style={{ color: "var(--gold)" }}>{focusCount}</div><div className="adsl">Focus Items</div></div>
          <div className="ads"><div className="adsv" style={{ color: "var(--cy)" }}>{Object.keys(CATEGORIES).length}</div><div className="adsl">Categories</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="adtb">
        <div className="asw">
          <span className="as-ic"><Ic.Search /></span>
          <input className="asi" placeholder="Search products in table…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="fsl" style={{ width: 190, fontSize: 12, padding: "8px 30px 8px 10px" }} value={catF} onChange={e => setCatF(e.target.value)}>
          <option value="">All Categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <button className="btn bpu" style={{ marginLeft: "auto" }} onClick={() => setShowAdd(true)}>
          <Ic.Plus /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="atw">
        {list.length === 0 ? (
          <div className="emp"><div className="emp-i">🗂️</div><div className="emp-t">No products found</div><div className="emp-s">Adjust your search or category filter</div></div>
        ) : (
          <>
            <table className="at">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>SKU / Code</th>
                  <th>Category</th>
                  <th>Status Tags</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 300).map(p => (
                  <tr key={p.id} className={p.isAdmin ? "ar" : ""}>
                    <td>
                      <div className="timg">{p.image ? <img src={p.image} alt="" /> : getCatIcon(p.category)}</div>
                    </td>
                    <td>
                      <div className="tn">{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{(p.shortDesc || "").slice(0, 55)}{(p.shortDesc || "").length > 55 ? "…" : ""}</div>
                    </td>
                    <td><span className="tsk">{p.sku}</span></td>
                    <td>
                      <div style={{ fontSize: 12, color: "var(--t2)" }}>{CATEGORIES[p.category]?.icon} {CATEGORIES[p.category]?.label}</div>
                      {p.subcategory && <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{CATEGORIES[p.category]?.sub[p.subcategory]}</div>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {p.tags.length ? p.tags.map(t => <span key={t} className={`tag ${t}`}>{t}</span>) : <span style={{ color: "var(--t3)", fontSize: 11 }}>—</span>}
                      </div>
                    </td>
                    <td><span className={`tbg ${p.isAdmin ? "" : "sd"}`}>{p.isAdmin ? "Admin" : "Catalogue"}</span></td>
                    <td>
                      <div className="tac">
                        <button className="btn bg bsm bic" title="Edit" onClick={() => setEditing(p)}><Ic.Edit /></button>
                        <button className="btn bd2 bsm bic" title="Delete" onClick={() => setDelTarget(p)}><Ic.Trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 300 && <div className="pn">Showing 300 of {list.length}. Use search or filter to narrow results.</div>}
          </>
        )}
      </div>

      {showAdd && <ProductForm title="Add New Product" initial={BLANK} onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editing && <ProductForm title="Edit Product" initial={editing} onSave={handleEdit} onClose={() => setEditing(null)} />}
      {delTarget && <ConfirmDel product={delTarget} onConfirm={handleDel} onClose={() => setDelTarget(null)} />}
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function PCard({ p, onClick, onFav, isFav, view, q }) {
  const iL = view === "list";
  return (
    <div className={`pc ${iL?"lc":""} ${p.isAdmin?"adm":""}`} onClick={() => onClick(p)}>
      <div className="ci">
        {p.image ? <img src={p.image} alt={p.name} /> : <span className="ce">{getCatIcon(p.category)}</span>}
      </div>
      <div className="cb">
        {!iL && <div className="cbadge">{CATEGORIES[p.category]?.label?.split(" ")[0]}{p.subcategory ? ` · ${CATEGORIES[p.category]?.sub[p.subcategory]}` : ""}</div>}
        <div className="cn" dangerouslySetInnerHTML={{ __html: hl(p.name, q) }} />
        <div className="cd">{p.shortDesc}</div>
        <div className="csk">#{p.sku}</div>
        <div className="ct">
          {p.tags.slice(0, 2).map(t => <span key={t} className={`tag ${t}`}>{t}</span>)}
          {p.isAdmin && <span className="tag admt">admin</span>}
        </div>
      </div>
      <div className="ca" onClick={e => e.stopPropagation()}>
        <div className={`cab ${isFav?"fv":""}`} onClick={e => { e.stopPropagation(); onFav(p.id); }}>
          <Ic.Heart f={isFav} />
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL MODAL ─────────────────────────────────────────────────────
function PModal({ product, onClose, allProducts, onRelated }) {
  if (!product) return null;
  const related = allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 6);
  return (
    <div className="ov" onClick={onClose}>
      <div className="mod" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div className="mth">{product.image ? <img src={product.image} alt="" /> : getCatIcon(product.category)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mti">{product.name}</div>
            <div className="msk">{product.sku}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {product.tags.map(t => <span key={t} className={`tag ${t}`}>{t}</span>)}
              {product.isAdmin && <span className="tag admt">admin added</span>}
              <span className="cbadge">{CATEGORIES[product.category]?.label}</span>
              {product.subcategory && <span className="cbadge">{CATEGORIES[product.category]?.sub[product.subcategory]}</span>}
            </div>
          </div>
          <div className="mcl" onClick={onClose}><Ic.X /></div>
        </div>
        <div className="mb">
          <div className="ms">
            <div className="mst">Description</div>
            <div className="mdc">{product.fullDesc || product.shortDesc}</div>
          </div>
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="ms">
              <div className="mst">Specifications</div>
              <div className="sg">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="si2"><div className="sk">{k.replace(/([A-Z])/g," $1").trim()}</div><div className="sv">{v}</div></div>
                ))}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div className="ms">
              <div className="mst">Related Products</div>
              <div className="rg">
                {related.map(r => (
                  <div key={r.id} className="ri" onClick={() => onRelated(r)}>
                    <div className="ric">{r.image ? <img src={r.image} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} /> : getCatIcon(r.category)}</div>
                    <div className="rin">{r.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function AppInner() {
  const { products } = useProducts();
  const [page, setPage] = useState("catalogue");
  const [selCat, setSelCat] = useState(null);
  const [selSub, setSelSub] = useState(null);
  const [sq, setSq] = useState("");
  const [sfocus, setSfocus] = useState(false);
  const [selP, setSelP] = useState(null);
  const [favs, setFavs] = useState(new Set());
  const [recent, setRecent] = useState([]);
  const [view, setView] = useState("grid");
  const [tagF, setTagF] = useState(null);
  const [expFocus, setExpFocus] = useState({});
  const sRef = useRef(null);
  const { toasts, show } = useToast();

  // Keep selected product synced after edits/deletes
  useEffect(() => {
    if (selP) {
      const updated = products.find(p => p.id === selP.id);
      if (updated) setSelP(updated); else setSelP(null);
    }
  }, [products]);

  const filtered = useMemo(() => {
    let r = products;
    if (selCat) r = r.filter(p => p.category === selCat);
    if (selSub) r = r.filter(p => p.subcategory === selSub);
    if (tagF) r = r.filter(p => p.tags.includes(tagF));
    if (sq.trim()) r = fuzzy(r, sq);
    return r;
  }, [products, selCat, selSub, sq, tagF]);

  const ddResults = useMemo(() => sq.trim() ? fuzzy(products, sq).slice(0, 8) : [], [products, sq]);

  const focusPs = useMemo(() => products.filter(p => p.tags.some(t => ["slow-moving","priority","focus"].includes(t))), [products]);
  const focusByCat = useMemo(() => {
    const g = {};
    focusPs.forEach(p => { if (!g[p.category]) g[p.category] = []; g[p.category].push(p); });
    return g;
  }, [focusPs]);

  const clickP = useCallback((p) => {
    setSelP(p); setSq(""); setSfocus(false);
    setRecent(prev => [p, ...prev.filter(x => x.id !== p.id)].slice(0, 6));
  }, []);

  const toggleFav = useCallback((id) => {
    setFavs(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const navCat = (cat, sub) => { setPage("catalogue"); setSelCat(cat); setSelSub(sub || null); setSq(""); setTagF(null); };
  const navPage = (p) => { setPage(p); if (p !== "catalogue") { setSelCat(null); setSelSub(null); } setSq(""); setTagF(null); };

  const catCounts = useMemo(() => {
    const c = {};
    products.forEach(p => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [products]);

  useEffect(() => {
    const h = (e) => { if (sRef.current && !sRef.current.contains(e.target)) setSfocus(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showDD = sfocus && sq.trim().length > 0;
  const pageTitle = { catalogue: selCat ? CATEGORIES[selCat]?.label : "Product Catalogue", focus: "Priority Sales Board", favourites: "My Favourites", admin: "Admin Panel" }[page] || "Product Catalogue";

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* ─── SIDEBAR ─── */}
        <aside className="sb">
          <div className="sb-logo">
            <div className="logo-m">A</div>
            <div><div className="logo-t">Al-Safi</div><div className="logo-s">PRODUCT CATALOGUE</div></div>
          </div>

          <nav className="sb-nav">
            <div className="ns">
              <div className="nl">Navigation</div>
              <div className={`ni ${page==="catalogue"&&!selCat?"on":""}`} onClick={() => { navPage("catalogue"); setSelCat(null); setSelSub(null); }}>
                <span className="n-ico">🏠</span> All Products <span className="n-cnt">{products.length.toLocaleString()}</span>
              </div>
              <div className={`ni ${page==="focus"?"on":""}`} onClick={() => navPage("focus")}>
                <span className="n-ico">🎯</span> Priority Sales Board <span className="n-cnt">{focusPs.length}</span>
              </div>
              <div className={`ni ${page==="favourites"?"on":""}`} onClick={() => navPage("favourites")}>
                <span className="n-ico">❤️</span> Favourites <span className="n-cnt">{favs.size}</span>
              </div>
            </div>

            <div className="ns">
              <div className="nl">Categories</div>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <div key={k}>
                  <div className={`ni ${selCat===k&&!selSub&&page==="catalogue"?"on":""}`} onClick={() => navCat(k, null)}>
                    <span className="n-ico">{v.icon}</span>{v.label}<span className="n-cnt">{catCounts[k]||0}</span>
                  </div>
                  {Object.entries(v.sub||{}).length > 0 && (
                    <div className="sub-nav">
                      {Object.entries(v.sub).map(([sk, sv]) => (
                        <div key={sk} className={`ni ${selCat===k&&selSub===sk?"on":""}`} onClick={() => navCat(k, sk)}>
                          <span className="n-ico">↳</span>{sv}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="ns">
              <div className="nl">Filter by Status</div>
              {STATUS_TAGS.map(tag => (
                <div key={tag} className={`ni ${tagF===tag?"on":""}`}
                  onClick={() => { setTagF(tagF===tag?null:tag); setPage("catalogue"); setSelCat(null); setSelSub(null); }}>
                  <span className={`tag ${tag}`}>{tag}</span>
                  <span className="n-cnt">{products.filter(p=>p.tags.includes(tag)).length}</span>
                </div>
              ))}
            </div>

            <div className="ns">
              <div className="nl">Administration</div>
              <div className={`ni adm ${page==="admin"?"on":""}`} onClick={() => navPage("admin")}>
                <span className="n-ico">⚙️</span> Admin Panel
                <span className="n-cnt" style={{ background: page==="admin"?"rgba(139,92,246,.2)":"", color: page==="admin"?"var(--pu)":"" }}>
                  {products.filter(p=>p.isAdmin).length}
                </span>
              </div>
            </div>
          </nav>

          <div className="sb-foot">
            <div className="stat-g">
              <div className="s-it"><div className="s-v">{products.length.toLocaleString()}</div><div className="s-l">Products</div></div>
              <div className="s-it"><div className="s-v">{Object.keys(CATEGORIES).length}</div><div className="s-l">Categories</div></div>
              <div className="s-it"><div className="s-v">{focusPs.length}</div><div className="s-l">Priority</div></div>
              <div className="s-it"><div className="s-v">{products.filter(p=>p.isAdmin).length}</div><div className="s-l">Admin</div></div>
            </div>
          </div>
        </aside>

        {/* ─── MAIN ─── */}
        <div className="mn">
          {/* HEADER */}
          <header className="hd">
            <div className="pt">{pageTitle}</div>
            {page !== "admin" && (
              <div className="sw" ref={sRef}>
                <span className="s-ic"><Ic.Search /></span>
                <input className="si" placeholder="Search products, SKU, category…" value={sq}
                  onChange={e => { setSq(e.target.value); if (e.target.value) setPage("catalogue"); }}
                  onFocus={() => setSfocus(true)} />
                {sq && <span className="s-cl" onClick={() => setSq("")}><Ic.X /></span>}
                {showDD && (
                  <div className="s-dd">
                    {ddResults.length === 0 ? <div className="s-em">No products found for "{sq}"</div> :
                      ddResults.map(p => (
                        <div key={p.id} className="s-ri" onClick={() => clickP(p)}>
                          <div className="s-rth">{p.image ? <img src={p.image} alt="" /> : getCatIcon(p.category)}</div>
                          <div>
                            <div className="s-rn" dangerouslySetInnerHTML={{ __html: hl(p.name, sq) }} />
                            <div className="s-rm">{CATEGORIES[p.category]?.label}{p.subcategory?` · ${CATEGORIES[p.category]?.sub[p.subcategory]}`:""}</div>
                          </div>
                          <div className="s-rsk">{p.sku}</div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
            <div className="ha">
              {page !== "admin" && (
                <>
                  <div className={`ib ${view==="grid"?"on":""}`} onClick={() => setView("grid")}><Ic.Grid /></div>
                  <div className={`ib ${view==="list"?"on":""}`} onClick={() => setView("list")}><Ic.List /></div>
                </>
              )}
            </div>
          </header>

          {/* CATALOGUE */}
          {page === "catalogue" && (
            <>
              {recent.length > 0 && (
                <div className="rv">
                  <div className="rvt"><Ic.Eye /> Recently Viewed</div>
                  <div className="rvl">
                    {recent.map(p => (
                      <div key={p.id} className="rvc" onClick={() => clickP(p)}>
                        <span>{getCatIcon(p.category)}</span>
                        <span>{p.name.length > 28 ? p.name.slice(0,28)+"…" : p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="fb">
                <span className="fl">Filter:</span>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <div key={k} className={`fc ${selCat===k?"on":""}`}
                    onClick={() => { if(selCat===k){setSelCat(null);setSelSub(null);}else{setSelCat(k);setSelSub(null);} }}>
                    {v.icon} {v.label.split(" ")[0]}
                    {selCat===k && <span onClick={e=>{e.stopPropagation();setSelCat(null);setSelSub(null);}}><Ic.X /></span>}
                  </div>
                ))}
                {selCat && Object.entries(CATEGORIES[selCat]?.sub||{}).length > 0 && (
                  <><div className="fdiv"/>{Object.entries(CATEGORIES[selCat].sub).map(([sk,sv])=>(
                    <div key={sk} className={`fc ${selSub===sk?"on":""}`} onClick={()=>setSelSub(selSub===sk?null:sk)}>{sv}</div>
                  ))}</>
                )}
                {STATUS_TAGS.map(t => (
                  <div key={t} className={`fc ${tagF===t?"on":""}`} onClick={()=>setTagF(tagF===t?null:t)}>
                    <span className={`tag ${t}`}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="rb">
                <div className="rc">
                  Showing <strong>{Math.min(filtered.length,200).toLocaleString()}</strong> of <strong>{filtered.length.toLocaleString()}</strong> products
                  {sq && <> for "<strong>{sq}</strong>"</>}
                </div>
              </div>
              <div className="scrl">
                <div className="pa">
                  {filtered.length === 0 ? (
                    <div className="emp"><div className="emp-i">🔍</div><div className="emp-t">No products found</div><div className="emp-s">Adjust search or filters</div></div>
                  ) : (
                    <div className={`pg ${view==="list"?"lv":""}`}>
                      {filtered.slice(0,200).map(p => <PCard key={p.id} p={p} onClick={clickP} onFav={toggleFav} isFav={favs.has(p.id)} view={view} q={sq} />)}
                    </div>
                  )}
                  {filtered.length > 200 && <div className="pn">Showing first 200 of {filtered.length}. Refine your search to see more.</div>}
                </div>
              </div>
            </>
          )}

          {/* FOCUS */}
          {page === "focus" && (
            <div className="scrl">
              <div className="fh">
                <div className="fht"><Ic.Trophy /> Priority Sales Board</div>
                <div className="fhs">Products requiring immediate sales attention — slow-moving and priority stock</div>
                <div className="fst">
                  {["slow-moving","priority","focus"].map(t => {
                    const c = focusPs.filter(p=>p.tags.includes(t)).length;
                    return <div key={t}>
                      <div className={`fstv tag ${t}`} style={{fontSize:22,fontWeight:800,fontFamily:"var(--mono)",background:"transparent",padding:0}}>{c}</div>
                      <div className="fstl">{t}</div>
                    </div>;
                  })}
                  <div><div className="fstv" style={{color:"var(--t)",fontSize:22,fontWeight:800,fontFamily:"var(--mono)"}}>{focusPs.length}</div><div className="fstl">Total Focus</div></div>
                </div>
              </div>
              <div className="fs">
                {Object.keys(focusByCat).length === 0 ? (
                  <div className="emp" style={{marginTop:40}}><div className="emp-i">🎯</div><div className="emp-t">No priority products</div><div className="emp-s">Tag products as "priority", "slow-moving", or "focus" via the Admin Panel</div></div>
                ) : Object.entries(focusByCat).map(([cat, prods]) => {
                  const open = expFocus[cat] !== false;
                  return (
                    <div key={cat}>
                      <div className="fch" onClick={()=>setExpFocus(p=>({...p,[cat]:!open}))}>
                        <span className="n-ico">{getCatIcon(cat)}</span>
                        <span className="fct">{CATEGORIES[cat]?.label}</span>
                        <span className="fcc">{prods.length} items</span>
                        <span className={`chv ${open?"op":""}`}><Ic.Chev /></span>
                      </div>
                      {open && (
                        <div className={`pg ${view==="list"?"lv":""}`} style={{marginBottom:16}}>
                          {prods.map(p => <PCard key={p.id} p={p} onClick={clickP} onFav={toggleFav} isFav={favs.has(p.id)} view={view} q="" />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAVOURITES */}
          {page === "favourites" && (
            <div className="scrl">
              {favs.size === 0 ? (
                <div className="emp" style={{marginTop:60}}><div className="emp-i">💝</div><div className="emp-t">No favourites yet</div><div className="emp-s">Hover a product card and click the heart to save it here</div></div>
              ) : (
                <div className="pa">
                  <div className={`pg ${view==="list"?"lv":""}`}>
                    {products.filter(p=>favs.has(p.id)).map(p => <PCard key={p.id} p={p} onClick={clickP} onFav={toggleFav} isFav={true} view={view} q="" />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADMIN */}
          {page === "admin" && <AdminPanel onToast={show} />}
        </div>
      </div>

      {selP && <PModal product={selP} onClose={() => setSelP(null)} allProducts={products}
        onRelated={p => { setSelP(p); setRecent(prev => [p,...prev.filter(x=>x.id!==p.id)].slice(0,6)); }} />}

      <Toasts toasts={toasts} />
    </>
  );
}

export default function App() {
  return <ProductProvider><AppInner /></ProductProvider>;
}
