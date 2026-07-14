import { T } from "./utils.js";

function Badge({status,colors}){
  const c=(colors||STATUS_COLORS)[status]||{bg:T.mist,text:T.slate};
  return <span style={{background:c.bg,color:c.text,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{status}</span>;
}

function Btn({children,onClick,variant="primary",disabled,small}){
  const V={primary:{background:T.navy,color:T.white,border:"none"},accent:{background:T.vermil,color:T.white,border:"none"},ghost:{background:"transparent",color:T.slate,border:`1px solid ${T.sand}`},success:{background:T.green,color:T.white,border:"none"}};
  return <button onClick={onClick} disabled={disabled} style={{...V[variant],borderRadius:6,cursor:disabled?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",fontWeight:600,opacity:disabled?0.5:1,padding:small?"5px 12px":"9px 18px",fontSize:small?12:13}}>{children}</button>;
}

function Field({label,value,onChange,type="text",placeholder,as="input",rows=3,options}){
  const s={width:"100%",padding:"8px 12px",borderRadius:6,fontSize:13,color:T.ink,border:`1px solid ${T.sand}`,background:T.white,boxSizing:"border-box",fontFamily:"Inter,sans-serif",outline:"none",marginTop:4};
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:T.slate,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>}
      {as==="textarea"&&<textarea value={value||""} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{...s,resize:"vertical"}}/>}
      {as==="select"&&<select value={value||""} onChange={e=>onChange(e.target.value)} style={s}>{(options||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>}
      {as==="input"&&<input type={type} value={value||""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={s}/>}
    </div>
  );
}

function SH({title}){
  return <div style={{fontSize:11,fontWeight:800,color:T.indigo,textTransform:"uppercase",letterSpacing:"0.1em",borderBottom:`2px solid ${T.mist}`,paddingBottom:6,marginBottom:14,marginTop:20}}>{title}</div>;
}


export { Badge, Btn, Field, SH };