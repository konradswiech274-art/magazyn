import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{createClient}from'@supabase/supabase-js';
import './style.css';

const URL=import.meta.env.VITE_SUPABASE_URL;
const KEY=import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb=URL&&KEY?createClient(URL,KEY):null;
const defaults=[['🪵','Drewno'],['🔩','Śruby'],['🧱','Cegły'],['🔧','Narzędzia'],['📦','Pudełka'],['🪙','Monety'],['💎','Klejnoty'],['🧪','Mikstury']];

function App(){
 const[items,setItems]=useState([]),[name,setName]=useState(''),[emoji,setEmoji]=useState('📦'),[qty,setQty]=useState(1),[search,setSearch]=useState(''),[status,setStatus]=useState('Ładowanie…');
 const[session,setSession]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[authBusy,setAuthBusy]=useState(false);
 const isAdmin=!!session;
 async function load(){
  if(!sb){setStatus('Ustaw dane Supabase w Vercel');return}
  const{data,error}=await sb.from('items').select('*').order('name');
  if(error)setStatus(error.message);else{setItems(data||[]);setStatus('Połączono · wspólny magazyn')}
 }
 useEffect(()=>{
  if(!sb){setStatus('Brak konfiguracji Supabase');return}
  sb.auth.getSession().then(({data})=>setSession(data.session));
  const{data:{subscription}}=sb.auth.onAuthStateChange((_event,s)=>setSession(s));
  load();
  const ch=sb.channel('items-live').on('postgres_changes',{event:'*',schema:'public',table:'items'},load).subscribe();
  return()=>{subscription.unsubscribe();sb.removeChannel(ch)};
 },[]);
 async function login(e){
  e.preventDefault();if(!sb)return;setAuthBusy(true);
  const{error}=await sb.auth.signInWithPassword({email:email.trim(),password});
  setAuthBusy(false);
  if(error)alert('Nie udało się zalogować: '+error.message);else setPassword('');
 }
 async function logout(){await sb.auth.signOut()}
 async function add(icon,itemName,quantity=1){
  if(!isAdmin){alert('Zaloguj się jako administrator.');return}
  if(!itemName?.trim())return;
  const{error}=await sb.from('items').insert({name:itemName.trim(),emoji:icon||'📦',quantity:Number(quantity)||1});
  if(error)alert(error.message);else{setName('');setEmoji('📦');setQty(1);load()}
 }
 async function change(id,delta){
  if(!isAdmin)return;const it=items.find(x=>x.id===id);if(!it)return;
  const next=it.quantity+delta;if(next<=0){remove(id);return}
  const{error}=await sb.from('items').update({quantity:next}).eq('id',id);if(error)alert(error.message)
 }
 async function remove(id){
  if(!isAdmin)return;if(!confirm('Usunąć przedmiot z magazynu?'))return;
  const{error}=await sb.from('items').delete().eq('id',id);if(error)alert(error.message)
 }
 const filtered=items.filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
 return <main>
  <header><div><h1>📦 Wspólny magazyn</h1><p>Wspólna lista rzeczy dla wszystkich użytkowników</p></div><span className="status">{status}</span></header>
  <section className="auth">
   {isAdmin?<div className="authrow"><div><strong>🔓 Tryb administratora</strong><p>Zalogowano jako {session.user.email}. Możesz zarządzać magazynem.</p></div><button type="button" onClick={logout}>Wyloguj</button></div>:
   <form className="loginform" onSubmit={login}><div className="logintext"><strong>🔐 Logowanie administratora</strong><p>Podgląd magazynu jest publiczny. Zaloguj się, aby edytować.</p></div><label>Login (e-mail)<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="adres e-mail administratora" required/></label><label>Hasło<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Hasło" required/></label><button disabled={authBusy}>{authBusy?'Logowanie…':'Zaloguj'}</button></form>}
  </section>
  {isAdmin&&<section className="add"><h2>Dodaj własny przedmiot</h2><form onSubmit={e=>{e.preventDefault();add(emoji,name,qty)}}><label>Ikona<input value={emoji} onChange={e=>setEmoji(e.target.value)} maxLength="8" /></label><label>Nazwa<input placeholder="np. Wkręty" value={name} onChange={e=>setName(e.target.value)} required/></label><label>Ilość<input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}/></label><button>＋ Dodaj</button></form><div className="presets"><span>Dodaj szybko:</span>{defaults.map(([icon,n])=><button type="button" key={n} onClick={()=>add(icon,n,1)} title={n}>{icon} {n}</button>)}</div></section>}
  <section><div className="toolbar"><h2>Stan magazynu <small>({items.length})</small></h2><input className="search" placeholder="🔎 Szukaj…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="grid">{filtered.map(it=><article key={it.id}><div className="emoji">{it.emoji}</div><strong>{it.name}</strong><div className="counter">{isAdmin&&<button onClick={()=>change(it.id,-1)} aria-label="odejmij">−</button>}<b>{it.quantity}</b>{isAdmin&&<button onClick={()=>change(it.id,1)} aria-label="dodaj">＋</button>}</div>{isAdmin&&<button className="del" onClick={()=>remove(it.id)} title="Usuń">×</button>}</article>)}</div>{!filtered.length&&<p className="empty">{items.length?'Brak wyników wyszukiwania.':'Magazyn jest pusty — dodaj pierwszy przedmiot!'}</p>}</section>
  <footer>{isAdmin?'Jesteś zalogowany jako administrator. Zmiany synchronizują się na żywo.':'Tryb podglądu · zaloguj się jako administrator, aby dodawać, zmieniać i usuwać produkty.'}</footer>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
