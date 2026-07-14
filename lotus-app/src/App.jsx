import { useState, useRef, useEffect } from "react";
import { T, uid, today } from "./utils.js";
import { ALL_LANGUAGES, ALL_COUNTRIES, JOB_STATUSES, JOB_CANDIDATE_STATUSES } from "./constants.js";
import { sbFetch, loadCandidates, saveCandidate, loadClients, saveClient, loadJobs, saveJob } from "./api.js";
import { rewriteExperience } from "./ai.js";
import { Badge, Btn, Field, SH } from "./components.jsx";
import CandidatesList from "./candidates_list.jsx";
import EditCandidate from "./edit_candidate.jsx";
import ClientCv from "./client_cv.jsx";
import EditJob from "./edit_job.jsx";
import JobDetail from "./job_detail.jsx";
import EditClient from "./edit_client.jsx";
import ClientDetail from "./client_detail.jsx";
import JobsList from "./jobs_list.jsx";
import ClientsList from "./clients_list.jsx";
import Settings from "./settings.jsx";

export default function App(){
  const [view,setView]=useState("candidates");
  const [candidates,setCandidates]=useState([]);
  const [clients,setClients]=useState([]);
  const [jobs,setJobs]=useState([]);
  const [selectedJob,setSelectedJob]=useState(null);
  const [jobForm,setJobForm]=useState(null);
  const [jobSearch,setJobSearch]=useState("");
  const [jobStatusFilter,setJobStatusFilter]=useState("All");
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [selectedClient,setSelectedClient]=useState(null);
  const [search,setSearch]=useState("");
  const [clientSearch,setClientSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("All");
  const [form,setForm]=useState(null);
  const [clientForm,setClientForm]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem("ltc_api_key")||"");
  const [toast,setToast]=useState(null);
  const fileRef=useRef();
  const docRef=useRef();

  useEffect(()=>{
    Promise.all([loadCandidates(),loadClients(),loadJobs()])
      .then(([c,cl,j])=>{setCandidates(c);setClients(cl);setJobs(j);})
      .catch(e=>notify("Could not connect to database: "+e.message,"err"))
      .finally(()=>setLoading(false));
  },[]);

  function notify(msg,type="ok"){setToast({msg,type});setTimeout(()=>setToast(null),4000);}
  function setF(k,v){setForm(f=>({...f,[k]:v}));}
  function setExp(i,k,v){setForm(f=>({...f,experience:f.experience.map((e,j)=>j===i?{...e,[k]:v}:e)}));}
  function setEdu(i,k,v){setForm(f=>({...f,education:f.education.map((e,j)=>j===i?{...e,[k]:v}:e)}));}
  function setCF(k,v){setClientForm(f=>({...f,[k]:v}));}
  function setJF(k,v){setJobForm(f=>({...f,[k]:v}));}

  async function handleFile(file){
    if(!file)return;
    if(!apiKey){notify("Add your Anthropic API key in Settings first","err");setView("settings");return;}
    setUploading(true);
    try{
      const isPdf=file.type==="application/pdf";
      let extracted;
      if(isPdf){
        const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
        const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},{type:"text",text:PROMPT}]}]})});
        const data=await resp.json();
        if(data.error)throw new Error(data.error.message);
        extracted=JSON.parse(data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim());
      } else {
        const arrayBuffer=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsArrayBuffer(file);});
        const result=await mammoth.extractRawText({arrayBuffer});
        const cvText=result.value;
        if(!cvText||cvText.trim().length<50)throw new Error("Could not read file");
        const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2000,messages:[{role:"user",content:`${PROMPT}\n\nCV TEXT:\n${cvText}`}]})});
        const data=await resp.json();
        if(data.error)throw new Error(data.error.message);
        extracted=JSON.parse(data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim());
      }
      setForm({id:uid(),...extracted,status:"New",source:"Upload",addedDate:today()});
      setView("editCandidate");
      notify("CV extracted — please review and save");
    }catch(err){
      console.error(err);
      setForm({id:uid(),status:"New",source:"Upload",addedDate:today(),education:[],experience:[],languages:[],skills:[]});
      setView("editCandidate");
      notify("Extraction failed — please fill in manually","err");
    }finally{setUploading(false);}
  }

  async function handleClientDoc(file,clientId){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=async e=>{
      const doc={id:uid(),name:file.name,type:file.type,size:Math.round(file.size/1024)+"KB",date:today(),data:e.target.result};
      const updated=clients.map(c=>c.id===clientId?{...c,documents:[...(c.documents||[]),doc]}:c);
      setClients(updated);
      const cl=updated.find(c=>c.id===clientId);
      if(selectedClient?.id===clientId)setSelectedClient(cl);
      try{await saveClient(cl);notify(file.name+" uploaded");}
      catch(err){notify("Upload failed: "+err.message,"err");}
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveCandidate(){
    if(!form?.name){notify("Name is required","err");return;}
    setSaving(true);
    try{
      await saveCandidate(form);
      setCandidates(prev=>prev.find(c=>c.id===form.id)?prev.map(c=>c.id===form.id?form:c):[form,...prev]);
      notify(form.name+" saved");
      setView("candidates");
    }catch(err){notify("Save failed: "+err.message,"err");}
    finally{setSaving(false);}
  }

  function generateJobId(clientName) {
    const year = new Date().getFullYear();
    const count = jobs.length + 1;
    const prefix = (clientName||"LTC").substring(0,3).toUpperCase().replace(/[^A-Z]/g,"X");
    return "LTC-" + year + "-" + String(count).padStart(3,"0");
  }

  async function handleSaveJob(){
    if(!jobForm?.title){notify("Job title is required","err");return;}
    if(!jobForm?.clientId){notify("Please link this job to a client","err");return;}
    setSaving(true);
    try{
      await saveJob(jobForm);
      setJobs(prev=>prev.find(j=>j.id===jobForm.id)?prev.map(j=>j.id===jobForm.id?jobForm:j):[jobForm,...prev]);
      notify(jobForm.title+" saved");
      setView("jobs");
    }catch(err){notify("Save failed: "+err.message,"err");}
    finally{setSaving(false);}
  }

  async function handleSaveClient(){
    if(!clientForm?.company){notify("Company name is required","err");return;}
    setSaving(true);
    try{
      await saveClient(clientForm);
      setClients(prev=>prev.find(c=>c.id===clientForm.id)?prev.map(c=>c.id===clientForm.id?clientForm:c):[clientForm,...prev]);
      notify(clientForm.company+" saved");
      setView("clients");
    }catch(err){notify("Save failed: "+err.message,"err");}
    finally{setSaving(false);}
  }

  async function deleteDoc(clientId,docId){
    const updated=clients.map(c=>c.id===clientId?{...c,documents:c.documents.filter(d=>d.id!==docId)}:c);
    setClients(updated);
    const cl=updated.find(c=>c.id===clientId);
    setSelectedClient(cl);
    try{await saveClient(cl);notify("Document removed");}
    catch(err){notify("Delete failed","err");}
  }

  const filteredCandidates=candidates.filter(c=>{
    const q=search.toLowerCase();
    return(!q||[c.name,c.currentRole,c.currentCompany].some(v=>v?.toLowerCase().includes(q)))&&(filterStatus==="All"||c.status===filterStatus);
  });

  const filteredClients=clients.filter(c=>{
    const q=clientSearch.toLowerCase();
    return !q||[c.company,c.contactName,c.industry,c.origin].some(v=>v?.toLowerCase().includes(q));
  });


  const viewProps = {
    view, setView, candidates, clients, jobs, setJobs,
    form, setForm, clientForm, setClientForm, jobForm, setJobForm,
    selected, setSelected, selectedClient, setSelectedClient, selectedJob, setSelectedJob,
    search, setSearch, filterStatus, setFilterStatus,
    clientSearch, setClientSearch, jobSearch, setJobSearch, jobStatusFilter, setJobStatusFilter,
    uploading, handleFile, handleSaveCandidate, handleSaveClient, handleSaveJob,
    saving, apiKey, setApiKey, sheetId, setSheetId, sheetKey, setSheetKey,
    notify, fileRef, docRef, setF, setExp, setEdu, setCF, setJF
  };

  return (
    <div style={{fontFamily:"Inter,system-ui,sans-serif",background:T.ivory,minHeight:"100vh",color:T.ink}}>
      {/* HEADER */}
{/* HEADER */}
      <div style={{background:T.navy,color:T.white,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,boxShadow:"0 2px 10px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:T.vermil,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🪷</div>
          <div>
            <div style={{fontSize:14,fontWeight:800}}>Lotus Talent Consultancy</div>
            <div style={{fontSize:9,color:T.silver,letterSpacing:"0.08em"}}>ATS & CRM</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["candidates","📋 Candidates"],["jobs","💼 Jobs"],["clients","🏢 Clients"],["settings","⚙ Settings"]].map(([v,label])=>(
            <button key={v} onClick={()=>setView(v)} style={{background:view.startsWith(v.slice(0,6))?T.indigo:"transparent",color:T.white,border:"none",borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{label}</button>
          ))}
        </div>
      </div>

      {toast&&<div style={{position:"fixed",top:16,right:16,zIndex:9999,background:toast.type==="err"?T.vermil:T.green,color:T.white,padding:"11px 18px",borderRadius:8,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>{toast.msg}</div>}

      {loading&&<div style={{textAlign:"center",padding:60,color:T.slate,fontSize:14}}>⏳ Loading from database…</div>}


      {!loading&&view==="candidates"&&<CandidatesList {...viewProps}/>}
      {view==="editCandidate"&&form&&<EditCandidate {...viewProps}/>}
      {view==="cv"&&selected&&<ClientCv {...viewProps}/>}
      {!loading&&view==="jobs"&&<JobsList {...viewProps} jobs={jobs} setJobs={setJobs}/>}
      {view==="editJob"&&jobForm&&<EditJob {...viewProps}/>}
      {view==="jobDetail"&&selectedJob&&<JobDetail {...viewProps}/>}
      {!loading&&view==="clients"&&<ClientsList {...viewProps}/>}
      {view==="editClient"&&clientForm&&<EditClient {...viewProps}/>}
      {view==="clientDetail"&&selectedClient&&<ClientDetail {...viewProps}/>}
      {view==="settings"&&<Settings {...viewProps}/>}
    </div>
  );
}
