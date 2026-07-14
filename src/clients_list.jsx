import { useState, useRef } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { Badge, Btn, Field, SH } from "./components.jsx";

export default function ClientsList(props) {
  const { view, setView, clients, setClients, clientSearch, setClientSearch, setClientForm, setSelectedClient, notify } = props;
  return (
    <>
{/* ── CLIENTS LIST ── */}
      {!loading&&view==="clients"&&(
        <div style={{padding:24,maxWidth:1080,margin:"0 auto"}}>
          <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center"}}>
            <input value={clientSearch} onChange={e=>setClientSearch(e.target.value)} placeholder="Search clients…" style={{flex:1,minWidth:180,padding:"7px 12px",borderRadius:6,border:`1px solid ${T.sand}`,fontSize:13,outline:"none"}}/>
            <Btn onClick={()=>{setClientForm({id:uid(),status:"Prospect",origin:"Japanese",addedDate:today(),documents:[],openRoles:""});setView("editClient");}}>+ Add Client</Btn>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {Object.entries(CLIENT_STATUS_COLORS).map(([s,c])=>{const n=clients.filter(x=>x.status===s).length;return n>0?<span key={s} style={{background:c.bg,color:c.text,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{s}: {n}</span>:null;})}
          </div>
          <div style={{background:T.white,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.07)"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:T.navy,color:T.white}}>
                {["Company","Origin","Contact","Open Roles","Fee","Status","Actions"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredClients.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:T.slate}}>No clients yet — add your first client</td></tr>}
                {filteredClients.map((c,i)=>(
                  <tr key={c.id} style={{background:i%2===0?T.white:T.ivory,borderBottom:`1px solid ${T.sand}`}}>
                    <td style={{padding:"10px 14px"}}><div style={{fontWeight:700,color:T.navy}}>{c.company}</div><div style={{fontSize:11,color:T.slate}}>{c.industry} · {c.localOffice}</div></td>
                    <td style={{padding:"10px 14px"}}><div>{c.origin}</div><div style={{fontSize:11,color:T.slate}}>HQ: {c.hqCountry}</div></td>
                    <td style={{padding:"10px 14px"}}><div>{c.contactName}</div><div style={{fontSize:11,color:T.slate}}>{c.contactTitle}</div></td>
                    <td style={{padding:"10px 14px",fontSize:12,color:T.slate,maxWidth:180}}>{c.openRoles||"—"}</td>
                    <td style={{padding:"10px 14px",fontWeight:600}}>{c.feeAgreed||"—"}</td>
                    <td style={{padding:"10px 14px"}}><Badge status={c.status} colors={CLIENT_STATUS_COLORS}/></td>
                    <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:6}}>
                      <Btn small variant="ghost" onClick={()=>{setClientForm({...c});setView("editClient");}}>Edit</Btn>
                      <Btn small onClick={()=>{setSelectedClient(clients.find(x=>x.id===c.id));setView("clientDetail");}}>View</Btn>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{color:T.silver,fontSize:11,marginTop:8,textAlign:"right"}}>{filteredClients.length} client{filteredClients.length!==1?"s":""}</div>
        </div>
      )}
    </>
  );
}
