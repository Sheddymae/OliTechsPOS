import React, {useEffect, useMemo, useState} from 'react';
import {
  Activity, ArrowRight, Building2, Check, CheckCircle2, Clock3, CreditCard,
  Edit3, Layers3, LockKeyhole, LogOut, Package, Plus, RefreshCw, Save,
  ShieldCheck, ToggleLeft, ToggleRight, Users, X
} from 'lucide-react';

const FEATURE_CATALOG = [
  {id:'pms', label:'PMS', description:'Core hotel property management'},
  {id:'reservations', label:'Reservations', description:'Reservation and booking management'},
  {id:'frontdesk', label:'Front Desk / Check-in', description:'Check-in and check-out operations'},
  {id:'guests', label:'Guests', description:'Guest profiles and history'},
  {id:'housekeeping', label:'Housekeeping', description:'Room cleaning and status workflow'},
  {id:'pos', label:'POS', description:'Restaurant and outlet point of sale'},
  {id:'kds', label:'Kitchen / KDS', description:'Kitchen display and order routing'},
  {id:'reports_basic', label:'Reports', description:'Operational and revenue reports'},
  {id:'night_audit', label:'Night Audit', description:'End-of-day audit workflow'},
  {id:'reports_advanced', label:'Advanced Reports', description:'Advanced revenue and performance analytics'},
  {id:'multi_user', label:'Multi-user controls', description:'Staff access and role management'},
  {id:'advanced_admin', label:'Advanced administration', description:'Advanced property administration'},
  {id:'folios', label:'Guest Folios', description:'Folios and room charges'},
  {id:'maintenance', label:'Maintenance', description:'Maintenance task management'},
  {id:'rateplans', label:'Rates & Availability', description:'Rates, availability and inventory controls'},
  {id:'menu', label:'Menu & Products', description:'Menu and product administration'},
  {id:'multi_outlet', label:'Multi-outlet POS', description:'Multiple POS outlets and departments'},
];

const DEFAULT_PACKAGES = [
  {id:'standard', name:'Standard', tagline:'Core PMS for small properties', price:4900, billing:'month', trialDays:7, maxRooms:30, active:true, features:['pms','reservations','frontdesk','guests','housekeeping','reports_basic','multi_user']},
  {id:'premium', name:'Premium', tagline:'PMS + POS for growing hotels', price:8900, billing:'month', trialDays:7, maxRooms:100, active:true, features:['pms','reservations','frontdesk','guests','housekeeping','reports_basic','multi_user','pos','kds','folios','night_audit']},
  {id:'professional', name:'Professional', tagline:'Full hotel operations suite', price:15900, billing:'month', trialDays:7, maxRooms:500, active:true, features:['pms','reservations','frontdesk','guests','housekeeping','reports_basic','multi_user','pos','kds','folios','night_audit','reports_advanced','advanced_admin','maintenance','rateplans','menu','multi_outlet']},
];

const featureLabel = id => FEATURE_CATALOG.find(f=>f.id===id)?.label || id;

function formatMoney(value){
  return new Intl.NumberFormat('en-KE',{maximumFractionDigits:0}).format(Number(value||0));
}
function isoDate(value){
  return value ? new Date(value).toLocaleDateString('en-GB') : '—';
}
function statusClass(status){
  return ['active','trial'].includes(status) ? 'ok' : ['pending','submitted'].includes(status) ? 'pending' : 'blocked';
}

export function PlatformAdmin(){
  const [auth,setAuth]=useState(null);
  const [companies,setCompanies]=useState([]);
  const [packages,setPackages]=useState([]);
  const [audit,setAudit]=useState([]);
  const [tab,setTab]=useState('overview');
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState('');
  const [notice,setNotice]=useState('');
  const [editingPackage,setEditingPackage]=useState(null);
  const [companyEdit,setCompanyEdit]=useState(null);

  const load=async()=>{
    setErr('');
    try{
      const s=await fetch('/platform-api/session').then(r=>r.json());
      setAuth(s);
      if(!s.authenticated)return;
      const [c,p,a]=await Promise.all([
        fetch('/platform-api/admin/companies'),
        fetch('/platform-api/admin/packages'),
        fetch('/platform-api/admin/audit')
      ]);
      if(!c.ok||!p.ok||!a.ok)throw new Error('Unable to load central platform data');
      setCompanies(await c.json());
      setPackages(await p.json());
      setAudit(await a.json());
    }catch(e){setErr(e.message||'Platform unavailable');}
  };

  useEffect(()=>{load()},[]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(t)},[notice]);

  const login=async e=>{
    e.preventDefault();setBusy(true);setErr('');
    const f=new FormData(e.currentTarget);
    try{
      const r=await fetch('/platform-api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:f.get('username'),password:f.get('password')})});
      const x=await r.json();
      if(!r.ok)throw new Error(x.error||'Invalid platform administrator credentials');
      await load();
    }catch(e){setErr(e.message)}
    finally{setBusy(false)}
  };

  const logout=async()=>{
    await fetch('/platform-api/logout',{method:'POST'});
    setAuth({authenticated:false});setCompanies([]);setPackages([]);setAudit([]);
  };

  const saveCompany=async(company,payload)=>{
    setBusy(true);setErr('');
    try{
      const r=await fetch('/platform-api/admin/companies/'+encodeURIComponent(company.id),{
        method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)
      });
      const x=await r.json();
      if(!r.ok)throw new Error(x.error||'Unable to update company');
      setNotice('Hotel subscription updated and ready for local sync');
      setCompanyEdit(null);
      await load();
    }catch(e){setErr(e.message)}
    finally{setBusy(false)}
  };

  const savePackage=async pkg=>{
    setBusy(true);setErr('');
    try{
      const method=pkg.__new?'POST':'PUT';
      const url=pkg.__new?'/platform-api/admin/packages':'/platform-api/admin/packages/'+encodeURIComponent(pkg.id);
      const payload={...pkg};delete payload.__new;
      const r=await fetch(url,{method,headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const x=await r.json();
      if(!r.ok)throw new Error(x.error||'Unable to save package');
      setNotice(pkg.__new?'Package created':'Package updated');
      setEditingPackage(null);await load();
    }catch(e){setErr(e.message)}
    finally{setBusy(false)}
  };

  const deactivatePackage=async pkg=>{
    if(!confirm('Deactivate '+pkg.name+'? Existing hotel subscriptions will keep their assigned package until changed.'))return;
    const r=await fetch('/platform-api/admin/packages/'+encodeURIComponent(pkg.id),{method:'DELETE'});
    const x=await r.json();
    if(!r.ok)return setErr(x.error||'Unable to deactivate package');
    setNotice(pkg.name+' deactivated');await load();
  };

  if(!auth)return <div className="loading">Loading platform security…</div>;

  if(!auth.authenticated){
    return <div className="platformLogin">
      <div className="platformLoginGlow"/>
      <div className="platformLoginCard">
        <div className="platformLoginBrand"><img src="/olitechs-mark.svg" alt="OliTechs"/><div><b>OliTechs</b><small>Central Platform</small></div></div>
        <span className="adminShield"><ShieldCheck size={15}/> Protected Platform Administrator</span>
        <h1>Platform Admin</h1>
        <p>Manage every hotel installation, subscription package, room limit and licensed feature from one central control centre.</p>
        <form onSubmit={login} className="platformLoginForm">
          <label>Username<input name="username" autoComplete="username" autoFocus defaultValue="platformadmin"/></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required/></label>
          {err&&<div className="error">{err}</div>}
          <button className="primary fullBtn" disabled={busy}>{busy?'Signing in…':'Sign in to Platform Admin'} <ArrowRight size={16}/></button>
        </form>
        <div className="platformSecurity"><LockKeyhole size={13}/> Central licensing access is separate from hotel administrator access.</div>
        <a className="publicLink" href="/signup">Open customer registration <ArrowRight size={14}/></a>
      </div>
    </div>;
  }

  const pending=companies.filter(c=>['pending','submitted'].includes(c.status)).length;
  const active=companies.filter(c=>['active','trial'].includes(c.subscription?.status)&&(!c.subscription?.expiresAt||new Date(c.subscription.expiresAt)>new Date())).length;
  const suspended=companies.filter(c=>['suspended','expired','past_due'].includes(c.subscription?.status)).length;
  const livePackages=packages.filter(p=>p.active!==false);

  return <div className="platformShell">
    <header>
      <div className="platformBrand"><img src="/olitechs-mark.svg" alt="OliTechs"/><div><b>OliTechs</b><small>Platform Admin</small></div></div>
      <div className="top"><span className="live">● Central licensing server</span><a className="platformTopLink" href="/signup">Customer sign-up</a><button className="icon" onClick={load} title="Refresh"><RefreshCw size={17}/></button><button className="icon" onClick={logout} title="Sign out"><LogOut size={17}/></button></div>
    </header>
    <main className="platformMain">
      <div className="platformHead"><div><span className="adminShield"><ShieldCheck size={16}/> Protected Platform Administrator</span><h1>Central Administration</h1><p>Control hotel onboarding, package licensing, subscriptions, room limits and feature access.</p></div></div>
      {notice&&<div className="successBanner"><Check size={16}/>{notice}</div>}
      {err&&<div className="error platformError">{err}</div>}
      <div className="adminTabs">
        <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><Activity size={16}/>Overview</button>
        <button className={tab==='companies'?'active':''} onClick={()=>setTab('companies')}><Building2 size={16}/>Hotels</button>
        <button className={tab==='packages'?'active':''} onClick={()=>setTab('packages')}><Layers3 size={16}/>Packages & Features</button>
        <button className={tab==='audit'?'active':''} onClick={()=>setTab('audit')}><Activity size={16}/>Audit Log</button>
      </div>

      {tab==='overview'&&<section>
        <div className="adminStats">
          <Metric icon={Building2} value={companies.length} label="Registered hotels"/>
          <Metric icon={Clock3} value={pending} label="Awaiting approval"/>
          <Metric icon={CreditCard} value={active} label="Active / trial"/>
          <Metric icon={Package} value={suspended} label="Suspended / expired"/>
        </div>
        <div className="platformOverviewGrid">
          <div className="panel"><h2>Subscription model</h2><p className="muted">Every hotel is assigned one configurable package. The assigned package is synced to the local PMS, including enabled features, subscription status, expiry and room limit.</p>
            <div className="packageMiniGrid">{livePackages.map(p=><div className="packageMini" key={p.id}><b>{p.name}</b><span>{p.maxRooms||'Unlimited'} rooms</span><span>{p.features?.length||0} licensed features</span></div>)}</div>
          </div>
          <div className="panel"><h2>Platform actions</h2><div className="platformActionList"><button onClick={()=>setTab('companies')}><Building2 size={16}/>Review hotels <ArrowRight size={14}/></button><button onClick={()=>setTab('packages')}><Layers3 size={16}/>Configure packages <ArrowRight size={14}/></button><button onClick={()=>setTab('audit')}><Activity size={16}/>Review audit activity <ArrowRight size={14}/></button></div></div>
        </div>
      </section>}

      {tab==='companies'&&<section>
        <div className="sectionToolbar"><div><h2>Hotels & Companies</h2><p>Approve registrations, assign packages, control room limits and activate or suspend subscriptions.</p></div><button onClick={load}><RefreshCw size={15}/>Refresh</button></div>
        {!companies.length?<div className="empty"><Building2 size={24}/><b>No hotels registered yet</b><span>Customer registrations will appear here.</span></div>:<div className="platformCompanies">{companies.map(c=><CompanyCard key={c.id} company={c} packages={livePackages} editing={companyEdit===c.id} onEdit={()=>setCompanyEdit(c.id)} onCancel={()=>setCompanyEdit(null)} onSave={saveCompany} busy={busy}/>)}</div>}
      </section>}

      {tab==='packages'&&<section>
        <div className="sectionToolbar"><div><h2>Packages & Feature Licensing</h2><p>Change package features and limits without rebuilding the hotel PMS.</p></div><button className="primary" onClick={()=>setEditingPackage({...DEFAULT_PACKAGES[0],id:'pkg-'+Date.now(),name:'New Package',features:[],__new:true})}><Plus size={15}/>New package</button></div>
        <div className="featureLegend">{FEATURE_CATALOG.map(f=><span key={f.id}><b>{f.label}</b> — {f.description}</span>)}</div>
        <div className="packageAdminGrid">{packages.map(p=><PackageCard key={p.id} pkg={p} onEdit={()=>setEditingPackage({...p})} onDeactivate={()=>deactivatePackage(p)}/>)}</div>
      </section>}

      {tab==='audit'&&<section>
        <div className="sectionToolbar"><div><h2>Central Audit Log</h2><p>Platform changes are recorded with the platform administrator actor and timestamp.</p></div><button onClick={load}><RefreshCw size={15}/>Refresh</button></div>
        <div className="auditTable">{audit.map(a=><div className="auditRow" key={a.id}><span>{new Date(a.at).toLocaleString('en-GB')}</span><b>{a.action}</b><span>{a.companyId||'Platform'}</span><small>{a.actor}</small></div>)}{!audit.length&&<div className="empty">No audit entries yet.</div>}</div>
      </section>}

      {editingPackage&&<PackageEditor pkg={editingPackage} onChange={setEditingPackage} onClose={()=>setEditingPackage(null)} onSave={savePackage} busy={busy}/>}
    </main>
  </div>;
}

function Metric({icon:Icon,value,label}){return <div className="adminMetric"><Icon/><b>{value}</b><span>{label}</span></div>}

function CompanyCard({company,packages,editing,onEdit,onCancel,onSave,busy}){
  const s=company.subscription||{};
  const [draft,setDraft]=useState({packageId:s.packageId||packages[0]?.id||'standard',status:s.status||'pending',maxRooms:s.maxRooms||packages[0]?.maxRooms||0,startsAt:s.startsAt||new Date().toISOString(),expiresAt:s.expiresAt||'',features:s.features||[],plan:s.plan||''});
  useEffect(()=>{const sub=company.subscription||{};setDraft({packageId:sub.packageId||packages[0]?.id||'standard',status:sub.status||'pending',maxRooms:sub.maxRooms||packages[0]?.maxRooms||0,startsAt:sub.startsAt||new Date().toISOString(),expiresAt:sub.expiresAt||'',features:sub.features||[],plan:sub.plan||''})},[company.id,company.subscription,packages.length]);
  const selected=packages.find(p=>p.id===draft.packageId);
  const applyPackage=id=>{const p=packages.find(x=>x.id===id);if(!p)return;setDraft({...draft,packageId:p.id,plan:p.name,maxRooms:p.maxRooms,features:[...(p.features||[])]})};
  return <article className="platformCompany">
    <div className="platformCompanyHead"><div><div className="companyTitle"><Building2 size={19}/><h2>{company.company?.name||'Unnamed hotel'}</h2><span className={'sourceBadge '+statusClass(company.status)}>{company.status||'pending'}</span></div><small>{company.company?.email||'No email'} · {company.company?.phone||'No phone'}</small></div><span className={'subscriptionStatus '+statusClass(s.status)}>{s.status||'unassigned'}</span></div>
    <div className="companyDetails"><span><b>Registration:</b> {isoDate(company.createdAt)}</span><span><b>Installation:</b> {company.installationId||'Not synced yet'}</span><span><b>Last heartbeat:</b> {company.heartbeatAt?new Date(company.heartbeatAt).toLocaleString('en-GB'):'Never'}</span></div>
    {!editing?<div className="companySummary"><div><small>Package</small><b>{s.plan||'None'}</b></div><div><small>Room limit</small><b>{s.maxRooms||'Not assigned'}</b></div><div><small>Expires</small><b>{isoDate(s.expiresAt)}</b></div><div><small>Features</small><b>{s.features?.length||0} enabled</b></div><button className="primary" onClick={onEdit}><Edit3 size={14}/>Manage subscription</button></div>
    :<div className="subscriptionEditor">
      <div className="formGrid"><label>Package<select value={draft.packageId} onChange={e=>applyPackage(e.target.value)}>{packages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option value="pending">Pending</option><option value="trial">Trial</option><option value="active">Active</option><option value="past_due">Past due</option><option value="suspended">Suspended</option><option value="expired">Expired</option></select></label>
      <label>Maximum rooms<input type="number" min="0" value={draft.maxRooms} onChange={e=>setDraft({...draft,maxRooms:Number(e.target.value)})}/></label>
      <label>Start date/time<input type="datetime-local" value={draft.startsAt?String(draft.startsAt).slice(0,16):''} onChange={e=>setDraft({...draft,startsAt:e.target.value})}/></label>
      <label>Expiry date/time<input type="datetime-local" value={draft.expiresAt?String(draft.expiresAt).slice(0,16):''} onChange={e=>setDraft({...draft,expiresAt:e.target.value})}/></label>
      <label>Plan label<input value={draft.plan} onChange={e=>setDraft({...draft,plan:e.target.value})}/></label></div>
      <div className="assignedFeatures"><div className="assignedHeader"><b>Licensed features</b><span>{draft.features.length} enabled</span></div><div className="featureChips">{draft.features.map(f=><span key={f}><Check size={12}/>{featureLabel(f)}</span>)}</div></div>
      <div className="adminAccountBox"><div><b>Hotel administrator provisioning</b><small>Optional. The credentials are stored as a password hash and synced to the local hotel installation.</small></div><div className="adminCredentials"><input placeholder="Admin username" value={draft.adminUsername||company.provisionedAdmin?.username||''} onChange={e=>setDraft({...draft,adminUsername:e.target.value})}/><input type="password" placeholder="New password (8+ characters)" value={draft.adminPassword||''} onChange={e=>setDraft({...draft,adminPassword:e.target.value})}/></div></div>
      <div className="foot"><span>{selected?.name||'Package'} · {selected?.maxRooms||'Unlimited'} package rooms</span><button onClick={onCancel}>Cancel</button><button className="primary" disabled={busy} onClick={()=>onSave(company,{status:company.status==='pending'?'active':company.status,subscription:{plan:selected?.name||draft.plan,packageId:draft.packageId,status:draft.status,startsAt:draft.startsAt,expiresAt:draft.expiresAt,maxRooms:draft.maxRooms,features:draft.features,trialDays:selected?.trialDays||7},...(draft.adminUsername&&draft.adminPassword?{provisionedAdmin:{username:draft.adminUsername,password:draft.adminPassword,name:company.requestedAdmin?.name||draft.adminUsername,email:company.company?.email||''}}:{})})}><Save size={14}/>Save & sync-ready</button></div>
    </div>}
  </article>;
}

function PackageCard({pkg,onEdit,onDeactivate}){
  return <article className={'packageAdminCard '+(pkg.active===false?'inactive':'')}>
    <div className="packageAdminHead"><div><span className="packageCode">{pkg.id}</span><h3>{pkg.name}</h3><p>{pkg.tagline}</p></div><span className={'subscriptionStatus '+(pkg.active===false?'blocked':'ok')}>{pkg.active===false?'Inactive':'Active'}</span></div>
    <div className="packagePrice"><b>KES {formatMoney(pkg.price)}</b><span>/{pkg.billing||'month'}</span></div>
    <div className="packageMeta"><span>{pkg.maxRooms||'∞'} rooms</span><span>{pkg.trialDays||0} day trial</span><span>{pkg.features?.length||0} features</span></div>
    <ul>{(pkg.features||[]).slice(0,7).map(f=><li key={f}><Check size={14}/>{featureLabel(f)}</li>)}{(pkg.features||[]).length>7&&<li>+ {(pkg.features||[]).length-7} more features</li>}</ul>
    <div className="packageActions"><button onClick={onEdit}><Edit3 size={14}/>Edit package</button>{pkg.active!==false&&<button className="danger" onClick={onDeactivate}>Deactivate</button>}</div>
  </article>;
}

function PackageEditor({pkg,onChange,onClose,onSave,busy}){
  const set=(k,v)=>onChange({...pkg,[k]:v});
  const toggle=id=>set('features',(pkg.features||[]).includes(id)?pkg.features.filter(x=>x!==id):[...(pkg.features||[]),id]);
  return <div className="overlay"><div className="modal packageModal">
    <div className="modalHead"><div><h2>{pkg.__new?'Create package':'Edit '+pkg.name}</h2><p className="muted">Package changes are applied to new assignments and can be reassigned to existing hotels.</p></div><button onClick={onClose}><X size={18}/></button></div>
    <div className="formGrid"><label>Package ID<input value={pkg.id} disabled={!pkg.__new} onChange={e=>set('id',e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,''))}/></label><label>Name<input value={pkg.name} onChange={e=>set('name',e.target.value)}/></label><label>Tagline<input value={pkg.tagline||''} onChange={e=>set('tagline',e.target.value)}/></label><label>Monthly price (KES)<input type="number" min="0" value={pkg.price||0} onChange={e=>set('price',Number(e.target.value))}/></label><label>Trial days<input type="number" min="0" value={pkg.trialDays??7} onChange={e=>set('trialDays',Number(e.target.value))}/></label><label>Maximum rooms<input type="number" min="0" value={pkg.maxRooms||0} onChange={e=>set('maxRooms',Number(e.target.value))}/></label></div>
    <div className="featureEditor"><div className="assignedHeader"><b>Feature permissions</b><span>{(pkg.features||[]).length} selected</span></div><div className="featureCheckGrid">{FEATURE_CATALOG.map(f=><label key={f.id} className="featureCheck"><input type="checkbox" checked={(pkg.features||[]).includes(f.id)} onChange={()=>toggle(f.id)}/><span>{(pkg.features||[]).includes(f.id)?<Check size={14}/>:<span className="emptyCheck"/>}<span><b>{f.label}</b><small>{f.description}</small></span></span></label>)}</div></div>
    <div className="foot"><span className="muted">{pkg.active===false?'This package is inactive.':''}</span><button onClick={onClose}>Cancel</button><button className="primary" disabled={busy} onClick={()=>onSave({...pkg,active:pkg.active!==false})}><Save size={14}/>Save package</button></div>
  </div></div>;
}
