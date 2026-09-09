const $=(s,ctx=document)=>ctx.querySelector(s);
const $$=(s,ctx=document)=>[...ctx.querySelectorAll(s)];

const STORAGE='usfq-gd-v060-state';

const defaultRubrics={
  score:{1:'Nivel 1',2:'Nivel 2',3:'Nivel 3',4:'Nivel 4',5:'Nivel 5'},
  frequency:{1:'Nunca',2:'Ocasionalmente',3:'Regularmente',4:'Frecuentemente',5:'Siempre'}
};
const baseQuestionConfig={
  self:[
    {type:'score',title:'Cumplimiento de funciones y objetivos',text:'¿En qué medida has cumplido tus funciones y objetivos?',evidence:true,weight:50,rubrics:{1:'No cumplí responsabilidades u objetivos clave del período.',2:'Cumplí parcialmente; tuve retrasos, omisiones o brechas relevantes.',3:'Cumplí lo principal, aunque pude hacerlo mejor en algunos aspectos.',4:'Cumplí de forma consistente y con resultados sólidos.',5:'Superé ampliamente lo esperado, asumí retos adicionales y generé un impacto excepcional comprobable.'}},
    {type:'score',title:'Calidad',text:'¿Cómo calificarías la calidad de tu trabajo?',evidence:true,weight:50,rubrics:{1:'Mi trabajo no alcanzó el estándar esperado.',2:'Mi trabajo presentó errores o reprocesos frecuentes.',3:'Mi trabajo fue adecuado, aunque requirió ajustes puntuales.',4:'Mi trabajo fue confiable, preciso y cumplió los estándares esperados.',5:'Entregué un trabajo excepcional, superior al estándar del rol y con valor agregado comprobable.'}},
    {type:'open',title:'Principales contribuciones',text:'¿Cuáles fueron tus principales contribuciones durante este período y qué evidencia concreta demuestra el impacto de tu trabajo?',evidence:false,weight:0},
    {type:'open',title:'Aspectos a fortalecer',text:'¿Qué aspectos de tu desempeño consideras que debes fortalecer y qué acciones concretas propones para mejorar en el siguiente período?',evidence:false,weight:0}
  ],
  upward:[
    ['Claridad','¿Me comunica con claridad mis responsabilidades, prioridades y expectativas?'],['Propósito','¿Me ayuda a comprender cómo mi trabajo se conecta con los objetivos del área y de la USFQ?'],['Iniciativa','¿Impulsa mejoras en la forma de trabajar del área, promoviendo soluciones ante oportunidades o desafíos?'],['Reconocimiento','¿Reconoce de manera oportuna y genuina el trabajo bien hecho?'],['Feedback','¿Me brinda retroalimentación clara, respetuosa y útil para mejorar mi desempeño?'],['Fortalezas','¿Reconoce mis fortalezas y me ayuda a utilizarlas en responsabilidades o nuevos retos?'],['Apoyo','¿Me brinda herramientas que me permitan cumplir con mi trabajo?'],['Interés','¿Demuestra interés genuino por comprender mis necesidades, cargas o preocupaciones laborales?'],['Equipo','¿Fomenta un ambiente de respeto, confianza y colaboración en el equipo?'],['Desarrollo','¿Me brinda apoyo en mi aprendizaje y desarrollo?']
  ].map(([title,text])=>({type:'frequency',title,text,evidence:false,weight:10,rubrics:{1:'Nunca',2:'Ocasionalmente',3:'Regularmente',4:'Frecuentemente',5:'Siempre'}})).concat([{type:'open',optional:true,title:'Feedback adicional',text:'Si deseas, agrega un comentario adicional para aportar al desarrollo de tu jefe.',evidence:false,weight:0}]),
  manager:[
    {type:'score',title:'Cumplimiento de funciones y objetivos',text:'¿En qué medida ha cumplido sus funciones y objetivos?',evidence:true,weight:20,rubrics:{1:'No cumplió la mayoría de funciones u objetivos esenciales.',2:'Cumplió de forma limitada; varias responsabilidades clave quedaron por debajo de lo esperado.',3:'Cumplió la mayoría, con algunos entregables incompletos o que requirieron seguimiento.',4:'Cumplió funciones y objetivos esenciales de forma consistente.',5:'Cumplió todas sus funciones y objetivos y generó resultados adicionales de impacto.'}},
    {type:'score',title:'Calidad',text:'¿Cómo calificarías la calidad de su trabajo?',evidence:true,weight:20,rubrics:{1:'La calidad es insuficiente de manera recurrente.',2:'La calidad es irregular y genera errores o reprocesos frecuentes.',3:'La calidad es aceptable con correcciones ocasionales.',4:'Entrega trabajo confiable, preciso y conforme a procedimientos.',5:'Produce trabajo de alta calidad, con muy baja tasa de error.'}},
    ['Orientación al servicio','¿Muestra interés genuino en comprender las necesidades y expectativas del cliente interno/externo?'],['Orientación al servicio','¿Mantiene una actitud positiva y amable en cada contacto con sus clientes?'],['Claridad','¿Comprende claramente las responsabilidades, prioridades y expectativas de su rol?'],['Iniciativa','¿Toma la delantera al detectar oportunidades o desafíos, proponiendo soluciones concretas?'],['Mejora continua','¿Implementa acciones concretas para mejorar las formas de trabajo existentes?'],['Compromiso institucional','¿Comprende las dinámicas de la universidad para alcanzar los resultados esperados?'],['Empatía','¿Comprende y apoya las necesidades de sus compañeros, fomentando respeto y colaboración?'],['Desarrollo','¿Muestra disposición para aprender, recibir retroalimentación y desarrollar nuevas capacidades?']
  ].map((q,i)=>Array.isArray(q)?{type:'frequency',title:q[0],text:q[1],evidence:false,weight:7.5,rubrics:{1:'Nunca',2:'Ocasionalmente',3:'Regularmente',4:'Frecuentemente',5:'Siempre'}}:q)
};

const defaultState={
  role:'jefe',cycle:'annual',stage:'eval2',page:'dashboard',campaignStarted:false,selectedMember:'ana',selectedArea:'Mejoramiento Continuo',instrumentType:'manager',
  committeeFilters:{department:'all',area:'all',person:'',band:'all',sort:'scoreDesc'},
  notificationsRead:false,
  own:{selfSubmitted1:false,upwardSubmitted1:false,selfSubmitted2:false,upwardSubmitted2:false,lastResult:87,serviceEligible:false},
  weightSchemes:{
    withSubsNoService:{self:5,manager:60,upward:35,service:0,configured:true},
    withSubsService:{self:5,manager:35,upward:35,service:25,configured:true},
    noSubsNoService:{self:null,manager:null,upward:0,service:0,configured:false},
    noSubsService:{self:null,manager:null,upward:0,service:null,configured:false}
  },
  questionConfig:JSON.parse(JSON.stringify(baseQuestionConfig)),
  kpis:[
    {id:1,title:'Reducir tiempo de respuesta de solicitudes',meta:'24 horas',base:'48 horas',indicator:'Tiempo promedio de respuesta',progress:72},
    {id:2,title:'Digitalizar expedientes administrativos',meta:'100%',base:'35%',indicator:'Porcentaje de expedientes digitalizados',progress:64}
  ],
  sessions:[
    {id:1,date:'15/08/2027',type:'Sesión de inicio',summary:'Perfil, objetivos/KPIs, acuerdos y próximos pasos.',status:'Completada',participants:'Ricardo / María',general:'Se revisó el perfil de cargo y se acordaron prioridades del ciclo.',agreements:['Priorizar automatización de solicitudes repetitivas.','Medir semanalmente el tiempo promedio de respuesta.'],next:['Revisar primer avance en el check-in de octubre.']},
    {id:2,date:'18/10/2027',type:'Check-in 1',summary:'Avances, obstáculos y acuerdos.',status:'Completada',participants:'Ricardo / María',advances:'Se automatizó el primer grupo de solicitudes y mejoró el tiempo de respuesta.',obstacles:'Acceso parcial a datos históricos.',agreements:['Completar acceso a datos antes de noviembre.'],next:['Validar tendencia del indicador al cierre de diciembre.']}
  ],
  team:[
    {id:'ana',name:'Ana Torres',initials:'AT',role:'Analista de Procesos',area:'Mejoramiento Continuo',profile:true,start:true,check1:true,check2:true,self:true,upward:true,manager:false,s1:93,s2:null,kpis:2,plan:'Pendiente',serviceEligible:false},
    {id:'diego',name:'Diego Vega',initials:'DV',role:'Analista de Datos',area:'Mejoramiento Continuo',profile:true,start:true,check1:true,check2:true,self:true,upward:true,manager:true,s1:88,s2:92,kpis:2,plan:'Pendiente',serviceEligible:true,serviceScore:94},
    {id:'carolina',name:'Carolina Paz',initials:'CP',role:'Asistente de Proyecto',area:'Proyectos',profile:false,start:true,check1:true,check2:true,self:true,upward:true,manager:true,s1:95,s2:91,kpis:2,plan:'En seguimiento',serviceEligible:false},
    {id:'miguel',name:'Miguel León',initials:'ML',role:'Coordinador de Datos',area:'Analítica',profile:true,start:false,check1:false,check2:false,self:false,upward:false,manager:false,s1:null,s2:null,kpis:0,plan:'Pendiente',serviceEligible:true,serviceScore:91}
  ],
  evalAnswers:{},
  exceptions:[{person:'Valeria Ruiz',official:'Jorge Lara',evaluation:'María Andrade',reason:'Asignación temporal de proyecto',period:'S1 2027'}]
};
let state=loadState();
let currentEval={type:'self',targetId:null};

function clone(x){return JSON.parse(JSON.stringify(x));}
function loadState(){try{const s=JSON.parse(localStorage.getItem(STORAGE));return s?Object.assign(clone(defaultState),s):clone(defaultState);}catch(e){return clone(defaultState)}}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(state));}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function status(text,kind='neutral'){return `<span class="status-pill ${kind}">${text}</span>`}
function btn(label,cls='',attrs=''){return `<button class="btn ${cls}" ${attrs}>${label}</button>`}
function finalCycleScore(s1,s2){const has1=s1!==null&&s1!==undefined&&s1!=='';const has2=s2!==null&&s2!==undefined&&s2!=='';return has1&&has2&&Number.isFinite(+s1)&&Number.isFinite(+s2)?((+s1)+(+s2))/2:null}
function weightScenarioKey(hasSubordinates,serviceEligible){return hasSubordinates?(serviceEligible?'withSubsService':'withSubsNoService'):(serviceEligible?'noSubsService':'noSubsNoService')}
function applicableWeightComponents(key){return {withSubsNoService:['self','manager','upward'],withSubsService:['self','manager','upward','service'],noSubsNoService:['self','manager'],noSubsService:['self','manager','service']}[key]||[]}
function isDefinedWeight(v){return v!==null&&v!==undefined&&v!==''&&Number.isFinite(+v)}

const annualSteps=[
  {key:'start',month:'Agosto',label:'Sesión de inicio'},
  {key:'check1',month:'Octubre',label:'Check-in 1'},
  {key:'eval1',month:'Enero',label:'Evaluación 1'},
  {key:'check2',month:'Abril',label:'Check-in 2'},
  {key:'eval2',month:'Junio',label:'Evaluación 2'}
];
const pilotSteps=[
  {key:'start',month:'Enero',label:'Sesión de inicio'},
  {key:'check1',month:'Marzo',label:'Check-in'},
  {key:'eval1',month:'Abril',label:'Evaluación formal'},
  {key:'committee',month:'Mayo',label:'Comité de Talento'}
];
function cycleSteps(){return state.cycle==='annual'?annualSteps:pilotSteps}

function navigate(page){
  state.page=page;saveState();
  $$('.page').forEach(x=>x.classList.toggle('active-page',x.id===page));
  $$('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  if(page==='dashboard')renderDashboard();
  if(page==='kpis')renderKpis();
  if(page==='sessions')renderSessions();
  if(page==='evaluations')renderEvaluationHub();
  if(page==='results')renderResults();
  if(page==='team')renderTeam();
  if(page==='teamMember')renderTeamMember();
  if(page==='admin')renderAdmin();
  if(page==='committee')renderCommittee();
  setDrawer(false);
  window.scrollTo({top:0,behavior:'smooth'});
}

function stageLabel(key=state.stage){return ({start:'Sesión de inicio',check1:'Check-in 1',eval1:'Evaluación 1',check2:'Check-in 2',eval2:'Evaluación 2 y cierre'})[key]||'Evaluación 2 y cierre'}
function stageIndex(key=state.stage){return ['start','check1','eval1','check2','eval2'].indexOf(key)}
function applyRole(){
  const r=state.role;
  $$('.role-person,.role-jefe,.role-admin,.role-comite,.role-jefe-inline').forEach(x=>x.style.display='none');
  if(r==='colaborador') $$('.role-person').forEach(x=>x.style.display='');
  if(r==='jefe'){ $$('.role-person,.role-jefe,.role-jefe-inline').forEach(x=>x.style.display=''); }
  if(r==='admin') $$('.role-admin').forEach(x=>x.style.display='');
  if(r==='comite') $$('.role-comite').forEach(x=>x.style.display='');
  const roleLabel={colaborador:'Colaborador',jefe:'Jefe / Evaluador',admin:'RRHH / Administrador',comite:'Comité de Talento'}[r];
  $('#identityRole').textContent=roleLabel;
  $('#identityCycle').textContent=state.cycle==='annual'?'2027-2028':'Piloto 2027';
  $('#identityStage').textContent=stageLabel();
  renderNotifications();
  const dashboardNav=$('.nav-link[data-page="dashboard"]');
  if(dashboardNav) dashboardNav.style.display=(r==='admin'||r==='comite')?'none':'';
  const kpiNav=$('.nav-link[data-page="kpis"]');
  if(kpiNav && state.cycle==='pilot') kpiNav.style.display='none';
  if(r==='admin') state.page='admin';
  if(r==='comite' && state.page!=='processGuide') state.page='committee';
  if((r==='colaborador'||r==='jefe') && ['admin','committee'].includes(state.page)) state.page='dashboard';
  if(state.cycle==='pilot' && state.page==='kpis') state.page='dashboard';
  navigate(state.page||'dashboard');
}

function renderNotifications(){
  const common=state.campaignStarted?[{title:'Ciclo de evaluación iniciado',body:'Revisa tu próxima actividad y las fechas definidas por RRHH.',when:'Hoy'}]:[{title:'Próximo ciclo de evaluación',body:'RRHH publicará el calendario y activará el proceso.',when:'Próximamente'}];
  const byRole={
    colaborador:[{title:'Completa tus evaluaciones',body:'Autoevaluación y evaluación a tu jefe disponibles en la etapa de evaluación.',when:'Pendiente'},{title:'Revisa tus objetivos',body:'Tus KPIs acordados están disponibles para consulta.',when:'Activo'}],
    jefe:[{title:'Evalúa a tu equipo',body:'Ana Torres está lista para que completes su evaluación.',when:'Pendiente'},{title:'Actividad bloqueada',body:'Miguel aún debe completar las actividades previas de su ciclo.',when:'Seguimiento'}],
    admin:[{title:'Seguimiento de pendientes',body:'El sistema puede recordar automáticamente a quienes no completaron actividades.',when:'Configuración'},{title:'Validación de matriz',body:'Revisa perfiles y relaciones antes de iniciar el ciclo.',when:'Antes del inicio'}],
    comite:[{title:'Resultados disponibles',body:'Usa los filtros del dashboard para analizar departamentos, áreas, personas y clasificaciones antes de registrar decisiones.',when:'Cierre'}]
  };
  const items=[...common,...byRole[state.role]];
  $('#notificationList').innerHTML=items.map(n=>`<div class="notification-item ${state.notificationsRead?'read':''}"><div class="notification-dot"></div><div><strong>${n.title}</strong><p>${n.body}</p><small>${n.when}</small></div></div>`).join('');
  $('#notificationCount').textContent=state.notificationsRead?'0':items.length;
  $('#notificationCount').style.display=state.notificationsRead?'none':'block';
}

function timelineHtml(currentKey=state.stage){
  const steps=cycleSteps();
  const cur=steps.findIndex(s=>s.key===currentKey);
  return `<div class="timeline ${steps.length===5?'five':'four'}">${steps.map((s,i)=>`<div class="step ${i<cur?'done':i===cur?'current':''}"><div class="step-dot">${i<cur?'✓':i+1}</div><div><strong>${s.label}</strong><span>${s.month} · ${i<cur?'Completado':i===cur?'En curso':'Pendiente'}</span></div></div>`).join('')}</div>`;
}

function nextStageCopy(role){
  const stage=state.stage;
  const pilot=state.cycle==='pilot';
  const map={
    colaborador:{start:['Revisa tu perfil y participa en la sesión de inicio',pilot?'Consulta tu perfil y participa en la conversación de inicio.':'Consulta tu perfil, funciones y objetivos que se acordarán con tu jefatura.','profile'],check1:['Prepárate para el Check-in 1',pilot?'Revisa los acuerdos anteriores antes de la conversación de seguimiento.':'Revisa tus objetivos y avances antes de la conversación de seguimiento.',pilot?'sessions':'kpis'],eval1:['Completa tus evaluaciones','Realiza tu autoevaluación y la evaluación a tu jefe.','evaluations'],check2:['Revisa tus avances del segundo período',pilot?'Consulta los acuerdos anteriores antes del Check-in 2.':'Consulta tus objetivos y los acuerdos anteriores antes del Check-in 2.','sessions'],eval2:['Completa la Evaluación 2','Realiza las evaluaciones habilitadas para el cierre del ciclo.','evaluations']},
    jefe:{start:['Realiza las sesiones de inicio de tu equipo','Las sesiones se registran desde la pestaña Sesiones.','sessions'],check1:['Realiza el Check-in 1 de tu equipo','Registra avances, obstáculos, acuerdos y próximos pasos.','sessions'],eval1:['Evalúa a tu equipo','En Evaluaciones se habilita cada colaborador cuando complete sus pasos previos.','evaluations'],check2:['Realiza el Check-in 2 de tu equipo',pilot?'Da seguimiento a resultados y acuerdos del período.':'Da seguimiento a objetivos, resultados del primer período y acuerdos.','sessions'],eval2:['Completa la Evaluación 2 de tu equipo','En Evaluaciones se muestran las personas listas para la segunda evaluación.','evaluations']}
  };
  return (map[role]||map.colaborador)[stage]||map.colaborador.eval2;
}
function renderDashboard(){
  const c=$('#dashboardContent');
  if(state.role==='comite'){renderCommittee();return;}
  if(state.role==='admin'){navigate('admin');return;}
  const isBoss=state.role==='jefe'; const copy=nextStageCopy(state.role); const pilot=state.cycle==='pilot';
  const utilityCards=pilot
    ? `<div class="cards-grid two"><article class="metric-card"><div class="metric-icon">▣</div><div><span class="metric-label">Última conversación</span><h3>${stageIndex()>=3?'Check-in 2':'Check-in 1'}</h3><p>Consulta las actas registradas del ciclo.</p><button class="text-action" data-go="sessions">Ver sesiones →</button></div></article><article class="metric-card"><div class="metric-icon">%</div><div><span class="metric-label">Resultados</span><h3>${stageIndex()>=2?state.own.lastResult+'%':'Pendientes'}</h3><p>${stageIndex()>=2?'Consulta el resultado general disponible.':'Se habilitan al cerrar la evaluación.'}</p>${stageIndex()>=2?'<button class="text-action" data-go="results">Ver resultados →</button>':''}</div></article></div>`
    : `<div class="cards-grid three"><article class="metric-card"><div class="metric-icon">◎</div><div><span class="metric-label">Objetivos / KPIs</span><h3>2 objetivos</h3><p>Avance promedio: <strong>68%</strong></p><button class="text-action" data-go="kpis">Ver objetivos →</button></div></article><article class="metric-card"><div class="metric-icon">▣</div><div><span class="metric-label">Última conversación</span><h3>${stageIndex()>=3?'Check-in 2':'Check-in 1'}</h3><p>Consulta las actas registradas del ciclo.</p><button class="text-action" data-go="sessions">Ver sesiones →</button></div></article><article class="metric-card"><div class="metric-icon">%</div><div><span class="metric-label">Resultados</span><h3>${stageIndex()>=2?state.own.lastResult+'%':'Pendientes'}</h3><p>${stageIndex()>=2?'Consulta el resultado general disponible.':'Se habilitan al cerrar la evaluación.'}</p>${stageIndex()>=2?'<button class="text-action" data-go="results">Ver resultados →</button>':''}</div></article></div>`;
  c.innerHTML=`<div class="dashboard-hero page-heading"><div><p class="eyebrow">Ciclo de evaluación ${pilot?'Piloto 2027':'2027-2028'}</p><h1>Hola, Ricardo</h1><p class="lead">${isBoss?'Gestiona tu propio ciclo de evaluación y consulta los resultados de tu equipo.':'Gestiona tu ciclo de evaluación y consulta tus actividades, acuerdos y resultados.'}</p></div>${status('Ciclo activo','success')}</div>
    <div class="alert-banner"><div><strong>Próxima actividad: ${copy[0]}</strong><p>${copy[1]}</p></div><button class="btn primary" data-go="${copy[2]}">Continuar</button></div>
    <div class="cycle-card panel"><div class="panel-heading"><div><h2>Mi ciclo de evaluación</h2><p>${pilot?'Enero - Julio 2027':'Agosto 2027 - Junio 2028'}</p></div><div class="progress-summary"><strong>${Math.round((stageIndex()+1)/5*100)}%</strong><span>etapa simulada</span></div></div>${timelineHtml(state.stage)}</div>
    ${utilityCards}
    ${isBoss?`<section class="panel"><div class="panel-heading"><div><h2>Resultados de mi equipo</h2><p>Mi equipo consolida las calificaciones de cada colaborador; el avance operativo permanece en Evaluaciones.</p></div></div><button class="btn secondary" data-go="team">Ver resultados del equipo</button></section>`:''}`;
  $$('[data-go]',c).forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
}

function renderKpis(){
  const c=$('#kpiList');c.innerHTML='';
  state.kpis.forEach(k=>{const el=document.createElement('article');el.className='panel kpi-card';el.innerHTML=`<div class="panel-heading"><div><h2>${k.title}</h2><p>${k.indicator}</p></div>${status(`${k.progress}% avance`,k.progress>=70?'success':'warning')}</div><div class="kpi-grid"><div><span class="kpi-value">Indicador<strong>${k.indicator}</strong></span></div><div><span class="kpi-value">Línea base<strong>${k.base}</strong></span></div><div><span class="kpi-value">Meta<strong>${k.meta}</strong></span></div></div><div style="margin-top:16px"><div class="goal-top"><span>Progreso registrado en check-in</span><strong>${k.progress}%</strong></div><div class="progress"><div style="width:${k.progress}%"></div></div></div>`;c.appendChild(el)});
}

function sessionStageConfig(){
  if(state.stage==='start')return {type:'Sesión de inicio',field:'start'};
  if(state.stage==='check1')return {type:'Check-in 1',field:'check1'};
  if(state.stage==='check2')return {type:'Check-in 2',field:'check2'};
  return null;
}
function renderSessions(){
  const teamBox=$('#teamSessionActions');
  if(state.role==='jefe'){
    const cfg=sessionStageConfig();
    if(cfg){
      teamBox.innerHTML=`<section class="panel session-team-panel"><div class="panel-heading"><div><h2>${cfg.type} · Mi equipo</h2><p>Registra esta conversación desde Sesiones. Los resultados del equipo se consultan en Mi equipo y las evaluaciones se realizan en Evaluaciones.</p></div>${status(stageLabel(),'neutral')}</div><div class="session-team-grid">${state.team.map(m=>{const done=!!m[cfg.field];return `<article><div><strong>${m.name}</strong><small>${m.role}</small></div>${done?status('Completada','success'):`<button class="btn small primary team-session-register" data-member="${m.id}" data-type="${cfg.type}">Registrar</button>`}</article>`}).join('')}</div></section>`;
    }else teamBox.innerHTML=`<div class="info-callout"><strong>Etapa actual:</strong> ${stageLabel()}. No hay una conversación obligatoria abierta en esta etapa; puedes consultar las actas registradas.</div>`;
  }else teamBox.innerHTML='';
  const legend=$('.session-legend'); if(legend) legend.innerHTML=state.cycle==='pilot'?'<span><i class="dot red"></i> Sesión de inicio: perfil, observaciones, acuerdos y próximos pasos</span><span><i class="dot gray"></i> Check-in: avances, obstáculos, acuerdos y próximos pasos</span>':'<span><i class="dot red"></i> Sesión de inicio: perfil, objetivos/KPIs, acuerdos y próximos pasos</span><span><i class="dot gray"></i> Check-in: avances, obstáculos, acuerdos y próximos pasos</span>';
  $('#sessionRows').innerHTML=state.sessions.map(s=>`<tr><td>${s.date}</td><td>${s.type}</td><td>${s.participants}</td><td>${state.cycle==='pilot'&&s.type==='Sesión de inicio'?'Perfil, acuerdos y próximos pasos.':s.summary}</td><td>${status(s.status,s.status==='Completada'?'success':'neutral')}</td><td><button class="link-btn view-minute" data-session="${s.id}">Ver acta</button></td></tr>`).join('')+`<tr><td>15/04/2028</td><td>Check-in 2</td><td>Ricardo / María</td><td>Seguimiento del segundo período</td><td>${stageIndex()>=3?status('Disponible','neutral'):status('Pendiente','neutral')}</td><td>${state.role==='jefe'&&state.stage==='check2'?'<button class="link-btn register-own-checkin">Registrar</button>':'-'}</td></tr>`;
  $$('.view-minute').forEach(b=>b.addEventListener('click',()=>viewMinute(+b.dataset.session)));
  $$('.register-own-checkin').forEach(b=>b.addEventListener('click',()=>openSessionBuilder('Check-in 2',null)));
  $$('.team-session-register').forEach(b=>b.addEventListener('click',()=>openSessionBuilder(b.dataset.type,b.dataset.member)));
}

function viewMinute(sessionId,targetId=null,typeOverride=null){
  let data;
  if(targetId){const m=member(targetId)||committeePerson(targetId)||{name:'Colaborador'}; data={date:typeOverride==='Sesión de inicio'?'15/08/2027':'18/10/2027',type:typeOverride||'Check-in 1',participants:`${m.name} / Jefatura`,general:'Se revisó el perfil del cargo y las prioridades del período.',advances:'Se reportaron avances en los objetivos acordados.',obstacles:'Se identificó una dependencia de información externa.',agreements:['Mantener seguimiento quincenal del indicador.','Priorizar las actividades acordadas.'],next:['Revisar resultados en la siguiente conversación.']};}
  else data=state.sessions.find(x=>x.id===sessionId);
  if(!data)return;
  openModal(`Acta · ${data.type}`,`<div class="minutes-card"><div class="minutes-cover"><h3>${data.type}</h3><div class="minutes-meta"><span><strong>Fecha:</strong> ${data.date}</span><span><strong>Participantes:</strong> ${data.participants}</span></div></div><div class="minutes-body">${(data.type.includes('inicio')||data.type.includes('arranque'))?`<div class="minutes-section"><h4>Revisión del perfil</h4><p>${data.general||'Perfil revisado conjuntamente.'}</p></div>${state.cycle==='pilot'?'':`<div class="minutes-section"><h4>Objetivos / KPIs acordados</h4><ul><li>Objetivo 1 · indicador, línea base y meta definidos.</li><li>Objetivo 2 · indicador, línea base y meta definidos.</li></ul></div>`}`:`<div class="minutes-section"><h4>Avances</h4><p>${data.advances||'-'}</p></div><div class="minutes-section"><h4>Obstáculos</h4><p>${data.obstacles||'-'}</p></div>`}<div class="minutes-section"><h4>Acuerdos</h4><ul>${(data.agreements||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="minutes-section"><h4>Próximos pasos</h4><ul>${(data.next||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div></div></div>`,true);
}

function evaluationQuestions(type){return state.questionConfig?.[type]||baseQuestionConfig[type]||[]}

function evaluationDef(){
  const scaleText='Califica del 1 al 5, donde 1 es la calificación más baja y 5 la más alta. Selecciona un valor para consultar su significado.';
  if(currentEval.type==='self')return {title:'Autoevaluación',lead:'Reflexiona sobre tu desempeño durante el período y registra evidencia que sustente tus calificaciones.',helper:scaleText+' La evidencia de Cumplimiento de funciones y objetivos y Calidad es obligatoria.',questions:evaluationQuestions('self')};
  if(currentEval.type==='upward')return {title:'Evaluación a mi jefe',lead:'Valora los comportamientos de liderazgo observados durante el período.',helper:scaleText,questions:evaluationQuestions('upward')};
  const m=member(currentEval.targetId);return {title:`Evaluación de ${m?.name||'colaborador'}`,lead:'Completa la evaluación de desempeño del colaborador utilizando los criterios definidos.',helper:scaleText,questions:evaluationQuestions('manager')};
}
function evalKey(){if(currentEval.type==='manager')return `${currentEval.period===2?'manager2':'manager1'}-${currentEval.targetId}`;return `${currentEval.type}-${currentEval.period||1}`}

function ownEvalDone(kind,period){const k=kind+(period===2?'2':'1');return !!state.own[k]}
function setOwnEvalDone(kind,period,value=true){const k=kind+(period===2?'2':'1');state.own[k]=value}
function renderEvaluationHub(){
  const c=$('#evaluationHub');
  const evaluationOpen=['eval1','eval2'].includes(state.stage);
  if(!evaluationOpen){c.innerHTML=`<section class="panel empty-stage"><h2>Evaluaciones no habilitadas en esta etapa</h2><p>La etapa simulada es <strong>${stageLabel()}</strong>. Cambia la etapa desde el menú del prototipo para visualizar la experiencia de Evaluación 1 o Evaluación 2.</p></section>`;return;}
  if(state.role==='jefe'){
    const period=state.stage==='eval2'?2:1;
    const ownSelf=ownEvalDone('selfSubmitted',period), ownUp=ownEvalDone('upwardSubmitted',period);
    const rows=state.team.map(m=>{const ready=period===1?(m.self&&m.upward&&!m.manager):(m.check2&&m.s1!=null&&m.s2==null);const complete=period===1?!!m.manager:m.s2!=null;const pending=!ready&&!complete;return `<tr><td><strong>${m.name}</strong><small>${m.role}</small></td><td>${period===1?(m.self?'Autoevaluación ✓':'Autoevaluación pendiente'):(m.check2?'Check-in 2 ✓':'Check-in 2 pendiente')}</td><td>${period===1?(m.upward?'Evaluación a jefe ✓':'Evaluación a jefe pendiente'):(m.s1!=null?'Evaluación 1 ✓':'Evaluación 1 pendiente')}</td><td>${complete?status('Completada','success'):ready?status('Lista para evaluar','success'):status('Pendiente','warning')}</td><td>${ready?`<button class="btn small primary team-eval-start" data-member="${m.id}">Evaluar</button>`:complete?'<span class="small-muted">Finalizada</span>':'<button class="btn small secondary" disabled>No disponible</button>'}</td></tr>`}).join('');
    c.innerHTML=`<div class="evaluation-cards"><article class="evaluation-card"><div class="evaluation-card-head"><h2>Mi autoevaluación</h2>${status(ownSelf?'Enviada':'Pendiente',ownSelf?'success':'warning')}</div><p>Completa tu propia evaluación cuando corresponda.</p><div class="evaluation-card-actions">${btn(ownSelf?'Consultar':'Comenzar','primary','data-start-eval="self"')}</div></article><article class="evaluation-card"><div class="evaluation-card-head"><h2>Evaluación a mi jefe</h2>${status(ownUp?'Enviada':'Pendiente',ownUp?'success':'warning')}</div><p>Completa la evaluación de tu jefatura.</p><div class="evaluation-card-actions">${btn(ownUp?'Consultar':'Comenzar','primary','data-start-eval="upward"')}</div></article></div>
    <section class="panel table-panel" style="margin-top:18px"><div class="panel-heading"><div><h2>Evaluación ${period} · Mi equipo</h2><p>El botón Evaluar se habilita únicamente cuando la persona cumple los prerrequisitos de la etapa.</p></div><span class="status-pill neutral">${stageLabel()}</span></div><table><thead><tr><th>Colaborador</th><th>Prerrequisito 1</th><th>Prerrequisito 2</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  }else{
    const period=state.stage==='eval2'?2:1;const ownSelf=ownEvalDone('selfSubmitted',period), ownUp=ownEvalDone('upwardSubmitted',period);
    const both=ownSelf&&ownUp;
    c.innerHTML=`${both?'<div class="alert-banner"><div><strong>Actividades completadas</strong><p>Has finalizado las evaluaciones que te corresponden en esta etapa.</p></div></div>':''}<div class="evaluation-cards"><article class="evaluation-card"><div class="evaluation-card-head"><h2>Autoevaluación</h2>${status(ownSelf?'Enviada':'Pendiente',ownSelf?'success':'warning')}</div><p>Valora tu desempeño y registra las evidencias solicitadas.</p><div class="evaluation-card-actions">${btn(ownSelf?'Consultar':'Comenzar','primary','data-start-eval="self"')}</div></article><article class="evaluation-card"><div class="evaluation-card-head"><h2>Evaluación a mi jefe</h2>${status(ownUp?'Enviada':'Pendiente',ownUp?'success':'warning')}</div><p>Valora los comportamientos de liderazgo observados durante el período.</p><div class="evaluation-card-actions">${btn(ownUp?'Consultar':'Comenzar','primary','data-start-eval="upward"')}</div></article></div>`;
  }
  $$('[data-start-eval]',c).forEach(b=>b.addEventListener('click',()=>startEvaluation(b.dataset.startEval)));
  $$('.team-eval-start',c).forEach(b=>b.addEventListener('click',()=>startEvaluation('manager',b.dataset.member)));
}

function startEvaluation(type,targetId=null){
  if(type==='manager'){
    const m=member(targetId);
    const ready=state.stage==='eval2'?(m.check2&&m.s1!=null&&m.s2==null):(m.self&&m.upward&&!m.manager);
    if(!ready){toast('Esta evaluación todavía no cumple los prerrequisitos de la etapa.');return;}
  }
  currentEval={type,targetId,period:state.stage==='eval2'?2:1};renderEvaluationForm();navigate('evaluationForm');
}
function renderEvaluationForm(){
  const def=evaluationDef();$('#evalTitle').textContent=def.title;$('#evalLead').textContent=def.lead;$('#evalHelper').textContent=def.helper;$('#evalStatus').textContent='En progreso';$('#evalStatus').className='status-pill warning';
  const key=evalKey();const answers=state.evalAnswers[key]||{};const c=$('#questionList');
  c.innerHTML=def.questions.map((q,i)=>{const a=answers[i]||{};if(q.type==='open')return `<article class="panel question-card open-question"><div class="question-head"><div class="question-number">${i+1}</div><div><h2>${q.title}${q.optional?' · opcional':''}</h2><p>${q.text}</p></div></div><div class="question-body"><textarea data-open="${i}" placeholder="Escribe tu respuesta...">${a.text||''}</textarea></div></article>`;
    return `<article class="panel question-card"><div class="question-head"><div class="question-number">${i+1}</div><div><h2>${q.title}</h2><p>${q.text}</p></div></div><div class="question-body"><div class="scale ${q.type==='frequency'?'labels':''}">${[1,2,3,4,5].map(n=>`<button type="button" data-q="${i}" data-value="${n}" class="${a.score==n?'selected':''}">${n}${q.type==='frequency'?`<small>${q.rubrics[n]}</small>`:''}</button>`).join('')}</div>${q.type==='score'?`<div class="rubric">${a.score?q.rubrics[a.score]:'Selecciona una valoración para ver la rúbrica asociada.'}</div>`:''}${q.evidence?`<label class="field-label">Evidencia que respalda tu respuesta${currentEval.type==='self'?' · obligatoria':''}</label><textarea class="evidence" data-evidence="${i}" placeholder="Describe brevemente la evidencia...">${a.evidence||''}</textarea>`:''}</div></article>`}).join('');
  $$('.scale button',c).forEach(b=>b.addEventListener('click',()=>{const a=state.evalAnswers[key]||(state.evalAnswers[key]={});a[b.dataset.q]=a[b.dataset.q]||{};a[b.dataset.q].score=+b.dataset.value;saveState();renderEvaluationForm();}));
  $$('[data-evidence]',c).forEach(t=>t.addEventListener('input',e=>{const a=state.evalAnswers[key]||(state.evalAnswers[key]={});a[e.target.dataset.evidence]=a[e.target.dataset.evidence]||{};a[e.target.dataset.evidence].evidence=e.target.value;saveState();updateEvalProgress();}));
  $$('[data-open]',c).forEach(t=>t.addEventListener('input',e=>{const a=state.evalAnswers[key]||(state.evalAnswers[key]={});a[e.target.dataset.open]=a[e.target.dataset.open]||{};a[e.target.dataset.open].text=e.target.value;saveState();updateEvalProgress();}));
  updateEvalProgress();
}
function questionComplete(q,a){
  if(q.type==='open')return q.optional?true:!!a?.text?.trim();
  if(!a?.score)return false;
  if(currentEval.type==='self'&&q.evidence&&!a?.evidence?.trim())return false;
  return true;
}
function updateEvalProgress(){
  const def=evaluationDef(),answers=state.evalAnswers[evalKey()]||{};const required=def.questions.filter(q=>q.type!=='open'||!q.optional);const reqDone=def.questions.reduce((n,q,i)=>n+(q.optional?0:(questionComplete(q,answers[i])?1:0)),0);const pct=Math.round(reqDone/required.length*100);$('#evalPercent').textContent=pct+'%';$('#evalCounter').textContent=`${reqDone} de ${required.length} requeridas`;$('#evalBar').style.width=pct+'%';
}
function submitEvaluation(){
  const def=evaluationDef(),answers=state.evalAnswers[evalKey()]||{};const missing=def.questions.some((q,i)=>q.optional?false:!questionComplete(q,answers[i]));if(missing){toast(currentEval.type==='self'?'Completa las preguntas y evidencias obligatorias antes de enviar.':'Completa las preguntas requeridas antes de enviar.');return;}
  if(currentEval.type==='self')setOwnEvalDone('selfSubmitted',currentEval.period||1,true);
  if(currentEval.type==='upward')setOwnEvalDone('upwardSubmitted',currentEval.period||1,true);
  if(currentEval.type==='manager'){const m=member(currentEval.targetId);if(state.stage==='eval2'){m.s2={ana:94,diego:92,miguel:86}[m.id]||92;}else{m.manager=true;if(!m.s1)m.s1={ana:93,diego:87,miguel:84}[m.id]||90;}}
  saveState();$('#evalStatus').textContent='Enviada';$('#evalStatus').className='status-pill success';toast('Evaluación enviada correctamente');setTimeout(()=>navigate('evaluations'),500);
}

function memberProgress(m){const checks=[m.start,m.check1,m.s1!=null,m.check2,m.s2!=null];return Math.round(checks.filter(Boolean).length/checks.length*100)}
function teamStageLabel(m){if(m.s2!=null)return'Ciclo completado';if(m.check2)return'Evaluación 2';if(m.s1!=null)return'Check-in 2';if(m.self&&m.upward)return'Listo para Evaluación 1';if(m.check1)return'Preparación Evaluación 1';if(m.start)return'Check-in 1';return'Sesión de inicio'}
function teamStatusKey(m){const p=memberProgress(m);return p>=100?'complete':(p>=40?'ready':'blocked')}
function teamStatusPill(m){const p=memberProgress(m);return p>=100?status('Ciclo completado','success'):(p>=40?status('En proceso','neutral'):status('Requiere seguimiento','warning'))}
function nextAction(m){return teamStageLabel(m)}
function teamFinalScore(m){return finalCycleScore(m.s1,m.s2)}
function teamResultDetails(m){
  const final=teamFinalScore(m);
  const finalLabel=final===null?'Pendiente':`${final.toFixed(1)}/100`;
  return `<details class="team-result-person"><summary><div class="team-result-person-main"><div class="mini-avatar">${m.initials}</div><div><strong>${m.name}</strong><small>${m.role} · ${m.area}</small></div></div><div class="team-result-scores"><span><small>E1</small><strong>${m.s1!=null?m.s1.toFixed(1):'-'}</strong></span><span><small>E2</small><strong>${m.s2!=null?m.s2.toFixed(1):'-'}</strong></span><span class="team-final-score"><small>Resultado final</small><strong>${finalLabel}</strong></span>${final!==null?status(performanceLabel(final),final>=92?'success':final>=81?'warning':'danger'):status('Pendiente','neutral')}</div></summary><div class="team-result-detail"><div class="summary-grid three"><div class="summary-box"><span class="label">Evaluación 1</span><strong>${m.s1!=null?m.s1.toFixed(1)+'/100':'-'}</strong><small>Primer período</small></div><div class="summary-box"><span class="label">Evaluación 2</span><strong>${m.s2!=null?m.s2.toFixed(1)+'/100':'-'}</strong><small>Segundo período</small></div><div class="summary-box highlight-final"><span class="label">Promedio final</span><strong>${final!==null?final.toFixed(1)+'/100':'Pendiente'}</strong><small>${final!==null?`(${m.s1.toFixed(1)} + ${m.s2.toFixed(1)}) / 2`:'Se calcula cuando existan ambas evaluaciones'}</small></div></div><div class="team-detail-actions"><span class="small-muted">Evaluación de servicio: ${m.serviceEligible?'Aplica':'No aplica'}</span>${final!==null?`<button class="btn small secondary open-team-result-detail" data-member="${m.id}">Ver ficha resumida</button>`:''}</div></div></details>`;
}
function renderTeam(){
  const root=$('#teamResultsDashboard'); if(!root)return;
  const completed=state.team.filter(m=>teamFinalScore(m)!==null); const finals=completed.map(teamFinalScore); const avg=finals.length?finals.reduce((a,b)=>a+b,0)/finals.length:null;
  root.innerHTML=`<div class="summary-grid team-result-summary"><div class="summary-box"><span class="label">Colaboradores</span><strong>${state.team.length}</strong><small>Equipo directo</small></div><div class="summary-box"><span class="label">Resultados finales disponibles</span><strong>${completed.length}</strong><small>Con E1 y E2 cerradas</small></div><div class="summary-box"><span class="label">Promedio del equipo</span><strong>${avg!==null?avg.toFixed(1)+'%':'-'}</strong><small>Promedio de resultados finales</small></div></div><section class="panel team-results-panel"><div class="panel-heading"><div><h2>Calificaciones del equipo</h2><p>Despliega a cada colaborador para revisar sus dos evaluaciones y el promedio final del ciclo.</p></div></div><div class="team-result-list">${state.team.map(teamResultDetails).join('')}</div></section>`;
  $$('.open-team-result-detail',root).forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const m=member(b.dataset.member);const final=teamFinalScore(m);openModal(`Resultados · ${m.name}`,`<div class="period-result-hero"><span>Resultado final del ciclo</span><strong>${final.toFixed(1)}<small>/100</small></strong><p>${performanceLabel(final)}</p></div><div class="summary-grid two"><div class="summary-box"><span class="label">Evaluación 1</span><strong>${m.s1.toFixed(1)}/100</strong></div><div class="summary-box"><span class="label">Evaluación 2</span><strong>${m.s2.toFixed(1)}/100</strong></div></div><div class="info-callout"><strong>Cálculo:</strong> (${m.s1.toFixed(1)} + ${m.s2.toFixed(1)}) / 2 = ${final.toFixed(1)}/100.</div>`,true);}));
}
function member(id){return state.team.find(x=>x.id===id)}
function openMember(id){state.selectedMember=id;saveState();renderTeamMember();navigate('teamMember')}
function renderTeamMember(){renderTeam();navigate('team')}

function viewMemberSelfEvaluation(m){
  openModal(`Autoevaluación · ${m.name}`,`<div class="info-callout"><strong>Visible para la jefatura:</strong> la autoevaluación sirve como contexto antes de evaluar al colaborador.</div><div class="open-answers"><div class="open-answer"><strong>Cumplimiento de funciones y objetivos</strong><p>4 / 5 · “Cumplí de forma consistente y con resultados sólidos.”</p></div><div class="open-answer"><strong>Calidad</strong><p>4 / 5 · “Mi trabajo fue confiable, preciso y cumplió los estándares esperados.”</p></div><div class="open-answer"><strong>Principales contribuciones e impacto</strong><p>Automatización de un proceso, reducción de tiempos de atención y documentación de mejoras con evidencia de reducción de reprocesos.</p></div><div class="open-answer"><strong>Aspectos a fortalecer y acciones propuestas</strong><p>Fortalecer el seguimiento de dependencias externas y acordar hitos intermedios de control para el siguiente período.</p></div></div>`);
}

const resultSamples={
  own:{self:[4,5],manager:[4,4,4,5,4,4,5,4,4,5],upward:[4,5,4,4,5,4,4,5,4,5],serviceEligible:false,serviceScore:null},
  ana:{self:[4,4],manager:[4,4,4,4,5,4,4,4,5,4],upward:[4,4,4,5,4,4,4,4,5,4],serviceEligible:false,serviceScore:null},
  diego:{self:[5,4],manager:[4,5,4,4,5,4,4,5,4,4],upward:[4,4,5,4,4,5,4,4,5,4],serviceEligible:true,serviceScore:94},
  carolina:{self:[5,5],manager:[5,5,5,5,5,5,5,4,4,4],upward:[5,5,5,5,5,5,4,4,5,4],serviceEligible:false,serviceScore:null},
  miguel:{self:[4,4],manager:[4,4,4,4,4,4,4,4,4,4],upward:[4,4,4,4,4,4,4,4,4,4],serviceEligible:true,serviceScore:91}
};
function scoreTo100(score){return (+score||0)*20}
function scoredQuestions(type){return evaluationQuestions(type).filter(q=>q.type!=='open')}
function normalizeSampleScores(type,scores=[]){const qs=scoredQuestions(type);return qs.map((q,i)=>scores[i]??4)}
function instrumentBreakdown(type,scores=[]){
  const qs=scoredQuestions(type),vals=normalizeSampleScores(type,scores);let total=0;
  const rows=qs.map((q,i)=>{const raw=vals[i],equiv=scoreTo100(raw),weight=+q.weight||0,points=equiv*weight/100;total+=points;return {q,raw,equiv,weight,points};});
  return {score:total,rows,totalWeight:rows.reduce((a,r)=>a+r.weight,0)};
}
function resultModel(key='own'){
  const sample=resultSamples[key]||resultSamples.own;const hasSubordinates=key==='own';const schemeKey=weightScenarioKey(hasSubordinates,sample.serviceEligible);const scheme=state.weightSchemes[schemeKey];
  const parts={self:instrumentBreakdown('self',sample.self),manager:instrumentBreakdown('manager',sample.manager),upward:instrumentBreakdown('upward',sample.upward)};
  const components=[
    {key:'self',label:'Autoevaluación',score:parts.self.score,weight:scheme.self,detail:parts.self},
    {key:'manager',label:'Evaluación del jefe',score:parts.manager.score,weight:scheme.manager,detail:parts.manager},
    {key:'upward',label:'Evaluación de subordinados',score:parts.upward.score,weight:scheme.upward,detail:parts.upward}
  ];
  if(scheme.service>0)components.push({key:'service',label:'Evaluación de servicio',score:+sample.serviceScore||0,weight:scheme.service,detail:null});
  components.forEach(c=>c.finalPoints=c.score*c.weight/100);
  const overall=components.reduce((a,c)=>a+c.finalPoints,0);
  return {key,schemeKey,scheme,components,overall,serviceEligible:sample.serviceEligible};
}
function performanceLabel(score){if(score>=97)return'Sobresaliente';if(score>=92)return'Óptimo';if(score>=81)return'Buen desempeño con oportunidades de mejora';return'Bajo desempeño'}
function componentSummaryRows(model){return model.components.map(c=>`<tr><td><strong>${c.label}</strong>${c.key==='service'?'<small>Puntaje /100 del componente</small>':''}</td><td>${c.score.toFixed(1)}/100</td><td>${c.weight}%</td><td><strong>${c.finalPoints.toFixed(1)} pts</strong></td></tr>`).join('')}
function questionDetailHtml(component){
  if(!component.detail)return `<div class="service-result-note"><strong>Puntaje del componente:</strong> ${component.score.toFixed(1)}/100 · <strong>Peso general:</strong> ${component.weight}% · <strong>Aporte final:</strong> ${component.finalPoints.toFixed(1)} puntos.</div>`;
  const rows=component.detail.rows.map((r,i)=>{const final=r.points*component.weight/100;return `<tr><td>${i+1}. ${r.q.title}<small>${r.q.text}</small></td><td>${r.raw}/5</td><td>${r.equiv.toFixed(0)}/100</td><td>${r.weight}%</td><td>${r.points.toFixed(1)}</td><td><strong>${final.toFixed(2)} pts</strong></td></tr>`}).join('');
  return `<div class="question-result-table table-panel"><table><thead><tr><th>Pregunta</th><th>Puntaje</th><th>Equiv.</th><th>Peso pregunta</th><th>Aporte al componente</th><th>Aporte al resultado final</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3"><strong>Total ${component.label}</strong></td><td><strong>${component.detail.totalWeight}%</strong></td><td><strong>${component.score.toFixed(1)}/100</strong></td><td><strong>${component.finalPoints.toFixed(2)} pts</strong></td></tr></tfoot></table></div>`;
}
function detailedCalculationHtml(model,showQuestions=false){
  return `<section class="panel calculation-panel"><div class="panel-heading"><div><h2>Cómo se calcula el resultado</h2><p>La nota final /100 es la suma de los aportes ponderados de cada componente.</p></div><span class="status-pill neutral">${model.serviceEligible?'Con servicio':'Sin servicio'}</span></div>
  <div class="formula-strip"><div><span>Resultado final</span><strong>${model.overall.toFixed(1)}/100</strong></div><div class="formula-arrow">=</div>${model.components.map(c=>`<div><span>${c.label}</span><strong>${c.finalPoints.toFixed(1)} pts</strong><small>${c.score.toFixed(1)}/100 × ${c.weight}%</small></div>`).join('<div class="formula-plus">+</div>')}</div>
  <div class="table-panel component-table"><table><thead><tr><th>Componente</th><th>Nota componente</th><th>Peso general</th><th>Aporte a nota final</th></tr></thead><tbody>${componentSummaryRows(model)}</tbody><tfoot><tr><td colspan="2"><strong>Nota general</strong></td><td><strong>100%</strong></td><td><strong>${model.overall.toFixed(1)}/100</strong></td></tr></tfoot></table></div>
  ${showQuestions?`<div class="component-details">${model.components.map(c=>`<details ${c.key==='manager'?'open':''}><summary><span>${c.label}</span><strong>${c.score.toFixed(1)}/100 · peso ${c.weight}%</strong></summary><div class="detail-inner">${questionDetailHtml(c)}</div></details>`).join('')}</div>`:`<div class="info-callout"><strong>Resultado general:</strong> esta vista presenta la información agregada del período. El detalle por pregunta se reserva a los perfiles autorizados definidos por RRHH.</div>`}</section>`;
}
function resultSummaryHtml(model,label='Resultado disponible · S1'){
  return `<section class="panel score-card"><span class="metric-label">${label}</span><div class="score">${model.overall.toFixed(1)}<small>/100</small></div><p>${performanceLabel(model.overall)}</p><div class="score-breakdown">${model.components.map(c=>`<div class="score-row"><span>${c.label}<small>${c.weight}% del resultado</small></span><strong>${c.score.toFixed(1)}</strong></div>`).join('')}</div></section>`;
}
function viewMemberResult(m){
  const model=resultModel(m.id);openModal(`Resultado · ${m.name}`,`${detailedCalculationHtml(model,false)}<div class="info-callout"><strong>Lectura del período:</strong> la nota general aparece únicamente cuando la evaluación correspondiente está cerrada. La comparación anual de S1 y S2 permanece separada.</div>`,true);
}

function openSessionBuilder(type,targetId){
  const m=targetId?member(targetId):{name:'Ricardo García Ortiz',role:'Coordinador de Procesos y Automatización',profile:true};const isStart=type==='Sesión de inicio';const pilot=state.cycle==='pilot';
  const objectiveRows=state.kpis.map((k,i)=>`<div class="goal-row"><div class="goal-name"><strong>${k.title}</strong><small>${k.indicator} · Meta: ${k.meta}</small></div><div class="goal-top"><span>Avance registrado</span><strong>${k.progress}%</strong></div><input type="range" min="0" max="100" value="${k.progress}" style="width:100%"></div>`).join('');
  const startSections=`<div class="meeting-section"><h3>1. Perfil y contexto</h3><div class="read-only-block"><h4>${m.name}</h4><p>${m.role} · Perfil de cargo ${targetId&&m.profile===false?'no disponible':'disponible para revisión'}.</p></div></div>${pilot?'':`<div class="meeting-section"><h3>2. Objetivos y KPIs construidos en conjunto</h3><p class="helper">Registra cada objetivo con indicador, línea base y meta.</p><div class="objective-edit"><input class="control" value="Reducir tiempo de respuesta de solicitudes"/><input class="control" value="Tiempo promedio de respuesta"/><input class="control" value="48 horas"/><input class="control" value="24 horas"/></div><div class="objective-edit"><input class="control" value="Digitalizar expedientes administrativos"/><input class="control" value="% de expedientes digitalizados"/><input class="control" value="35%"/><input class="control" value="100%"/></div></div>`}<div class="meeting-section"><h3>${pilot?'2':'3'}. Observaciones generales</h3><textarea class="control" placeholder="Aspectos relevantes conversados al inicio del ciclo..."></textarea></div>`;
  const checkSections=`<div class="meeting-section"><h3>1. Contexto desde la conversación anterior</h3><p class="helper">Resume los principales temas revisados desde el último check-in: cambios relevantes, compromisos previos o situaciones que dan contexto a esta conversación.</p><textarea class="control" placeholder="Ej.: se revisaron los acuerdos anteriores, cambios de prioridad y avances que requieren seguimiento..."></textarea></div>${pilot?'':`<div class="meeting-section"><h3>2. Seguimiento de objetivos</h3>${objectiveRows}</div>`}<div class="meeting-section"><h3>${pilot?'2':'3'}. Avances</h3><textarea class="control" placeholder="Principales avances desde la conversación anterior..."></textarea></div><div class="meeting-section"><h3>${pilot?'3':'4'}. Obstáculos / ajustes</h3><textarea class="control" placeholder="Obstáculos, dependencias o ajustes requeridos..."></textarea></div>`;
  const base=isStart?(pilot?2:4):(pilot?4:5);
  const html=`<div class="meeting-builder">${isStart?startSections:checkSections}<div class="meeting-section"><h3>${base}. Acuerdos</h3><textarea class="control" placeholder="Acuerdos concretos..."></textarea></div><div class="meeting-section"><h3>${base+1}. Próximos pasos</h3><textarea class="control" placeholder="Próximos pasos, responsables o fechas..."></textarea></div></div><div class="modal-actions"><button class="btn secondary" id="cancelSession">Cancelar</button><button class="btn primary" id="saveSession" data-session-type="${type}" data-session-target="${targetId||''}">Guardar acta</button></div>`;
  openModal(`${type} · ${m.name}`,html,true);
}

function secondPeriodModel(model){
  const scores=model.serviceEligible
    ? {self:94,manager:92,upward:91,service:93}
    : {self:94,manager:92,upward:91.7142857};
  const components=model.components.map(c=>{
    const score=scores[c.key]??92;
    return {...c,score,finalPoints:score*c.weight/100};
  });
  return {...model,components,overall:components.reduce((sum,c)=>sum+c.finalPoints,0)};
}
function evaluationPeriodCard(model,title,date){
  return `<article class="evaluation-period-card"><div class="evaluation-period-head"><div><span>${title}</span><small>${date}</small></div><span class="status-pill success">Resultado disponible</span></div><div class="evaluation-period-score">${model.overall.toFixed(1)}<small>/100</small></div><p class="evaluation-performance">${performanceLabel(model.overall)}</p><div class="evaluation-component-list">${model.components.map(c=>`<div class="evaluation-component-row"><span>${c.label}<small>${c.weight}% del resultado</small></span><strong>${c.score.toFixed(1)}</strong></div>`).join('')}</div></article>`;
}
function resultTimelineItem(date,key,title,summary){
  return `<div class="timeline-item result-timeline-item"><div class="date">${date}</div><div class="vline"></div><div class="result-timeline-content"><div class="timeline-title-row"><h4>${title}</h4>${status('Completado','success')}</div><p>${summary}</p><button class="link-btn result-milestone" data-milestone="${key}">Ver resumen</button></div></div>`;
}
function resultPeriodModalHtml(model,title,date,planItems=[]){
  return `<div class="period-result-modal"><div class="period-result-hero"><span>${title}</span><strong>${model.overall.toFixed(1)}<small>/100</small></strong><p>${performanceLabel(model.overall)} · ${date}</p></div><div class="score-breakdown modal-score-breakdown">${model.components.map(c=>`<div class="score-row"><span>${c.label}<small>${c.weight}% del resultado</small></span><strong>${c.score.toFixed(1)}</strong></div>`).join('')}</div>${planItems.length?`<div class="read-only-block"><h4>Plan / próximos pasos</h4><ul class="clean-list">${planItems.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:''}</div>`;
}
function openResultMilestone(key,model,model2){
  if(key==='start'){viewMinute(1);return;}
  if(key==='check1'){viewMinute(2);return;}
  if(key==='check2'){
    openModal('Resumen · Check-in 2',`<div class="minutes-card"><div class="minutes-cover"><h3>Check-in 2</h3><div class="minutes-meta"><span><strong>Fecha:</strong> 15/04/2028</span><span><strong>Participantes:</strong> Ricardo García Ortiz / María Andrade</span></div></div><div class="minutes-body"><div class="minutes-section"><h4>Contexto</h4><p>Seguimiento posterior a la Evaluación 1 (${model.overall.toFixed(1)}/100) y revisión del plan del período.</p></div><div class="minutes-section"><h4>Avances</h4><p>Se consolidaron automatizaciones de reportes recurrentes y se completó parte de la capacitación acordada.</p></div><div class="minutes-section"><h4>Obstáculos / ajustes</h4><p>Persisten dependencias de información de terceros; se acordó ajustar hitos intermedios de seguimiento.</p></div><div class="minutes-section"><h4>Acuerdos</h4><ul><li>Completar la capacitación antes del cierre del ciclo.</li><li>Documentar la mejora de tiempos y reprocesos.</li></ul></div><div class="minutes-section"><h4>Próximos pasos</h4><ul><li>Preparar evidencias para la Evaluación 2.</li><li>Revisar cumplimiento de KPIs en junio.</li></ul></div></div></div>`,true);return;
  }
  if(key==='eval1'){
    openModal('Resumen · Evaluación 1',resultPeriodModalHtml(model,'Evaluación 1','Enero 2028',['Fortalecer automatización de reportes recurrentes.','Completar capacitación en gestión de indicadores.','Revisar avance en el siguiente check-in.']),true);return;
  }
  if(key==='eval2'){
    openModal('Resumen · Evaluación 2',resultPeriodModalHtml(model2,'Evaluación 2','Junio 2028',['Consolidar las mejoras alcanzadas durante el ciclo.','Definir objetivos y prioridades para el siguiente período.']),true);
  }
}
function unifiedResultHtml(model,model2){
  const s1=model.overall; const s2=model2.overall; const delta=s2-s1; const final=(s1+s2)/2;
  return `<section class="panel annual-summary-panel result-comparison-unified">
    <div class="panel-heading"><div><p class="section-kicker">Resultados del ciclo</p><h2>Resultado final · ${final.toFixed(1)}/100</h2><p>El resultado final corresponde al promedio simple de las dos evaluaciones del ciclo.</p></div>${status(performanceLabel(final),final>=92?'success':final>=81?'warning':'danger')}</div>
    <div class="final-result-formula"><div><span>Evaluación 1</span><strong>${s1.toFixed(1)}</strong></div><span class="formula-symbol">+</span><div><span>Evaluación 2</span><strong>${s2.toFixed(1)}</strong></div><span class="formula-symbol">÷ 2 =</span><div class="final-result-emphasis"><span>Resultado final</span><strong>${final.toFixed(1)}<small>/100</small></strong></div></div>
    <div class="evaluation-compare-grid">${evaluationPeriodCard(model,'Evaluación 1','Enero 2028')}<div class="evaluation-compare-arrow"><span>→</span><small>${delta>=0?'+':''}${delta.toFixed(1)} pts</small></div>${evaluationPeriodCard(model2,'Evaluación 2','Junio 2028')}</div>
  </section>
  <section class="panel result-plan-panel compact-result-plan"><div class="panel-heading"><div><h2>Plan del período</h2><p>Acciones acordadas después de la Evaluación 1 y revisadas en el siguiente check-in.</p></div>${status('En seguimiento','neutral')}</div><div class="plan-inline"><ul class="clean-list"><li>Fortalecer automatización de reportes recurrentes.</li><li>Completar capacitación en gestión de indicadores.</li><li>Revisar avance en el siguiente check-in.</li></ul><button class="btn secondary open-calculation">Ver cómo se calcula</button></div></section>
  <section class="panel talent-unified-panel">
    <div class="talent-header"><div class="talent-person"><div class="mini-avatar">RG</div><div><p class="section-kicker">Perfil de talento</p><h2>Mi recorrido de desempeño</h2><p>Ricardo García Ortiz · Coordinador de Procesos y Automatización · Mejoramiento Continuo</p></div></div>${status('Ciclo anual completo','success')}</div>
    <div class="talent-executive-grid"><div class="read-only-block"><h4>Funciones generales</h4><ul class="clean-list"><li>Coordinar iniciativas de mejora continua y automatización.</li><li>Levantar y rediseñar procesos institucionales.</li><li>Dar seguimiento a proyectos e indicadores de mejora.</li></ul></div>${state.cycle==='pilot'?'':`<div class="read-only-block"><h4>Objetivos del ciclo</h4><ul class="clean-list"><li>Reducir tiempo de respuesta de solicitudes.</li><li>Digitalizar expedientes administrativos.</li></ul></div>`}</div><div class="summary-grid result-cycle-metrics"><div class="summary-box"><span class="label">Evaluación 1</span><strong>${s1.toFixed(1)}%</strong><small>Primer período</small></div><div class="summary-box"><span class="label">Evaluación 2</span><strong>${s2.toFixed(1)}%</strong><small>Segundo período</small></div><div class="summary-box highlight-final"><span class="label">Resultado final</span><strong>${final.toFixed(1)}%</strong><small>Promedio de E1 y E2</small></div></div>
    <div class="timeline-vertical result-timeline">${resultTimelineItem('Agosto 2027','start','Sesión de inicio',state.cycle==='pilot'?'Perfil revisado y acuerdos definidos.':'Perfil revisado, objetivos/KPIs y acuerdos definidos.')}${resultTimelineItem('Octubre 2027','check1','Check-in 1','Avances, obstáculos y acuerdos documentados.')}${resultTimelineItem('Enero 2028','eval1',`Evaluación 1 · ${s1.toFixed(1)}/100`,'Resultado del primer período y plan de trabajo.')}${resultTimelineItem('Abril 2028','check2','Check-in 2','Seguimiento con referencia al resultado del primer período.')}${resultTimelineItem('Junio 2028','eval2',`Evaluación 2 · ${s2.toFixed(1)}/100`,'Cierre del ciclo y resultado final consolidado.')}</div>
  </section>`;
}

function renderResults(){
  const c=$('#resultsContent');const model=resultModel('own');const model2=secondPeriodModel(model);
  c.innerHTML=`<div class="results-tabs"><button class="tab active" data-results-tab="myResult">Mi resultado</button><button class="tab" data-results-tab="calculation">Cómo se calcula</button></div>
  <div id="myResult" class="results-pane active">${unifiedResultHtml(model,model2)}</div>
  <div id="calculation" class="results-pane">${detailedCalculationHtml(model,false)}</div>`;
  $$('[data-results-tab]',c).forEach(b=>b.addEventListener('click',()=>{$$('[data-results-tab]',c).forEach(x=>x.classList.toggle('active',x===b));$$('.results-pane',c).forEach(x=>x.classList.toggle('active',x.id===b.dataset.resultsTab));}));
  $$('.open-calculation',c).forEach(b=>b.addEventListener('click',()=>{$('[data-results-tab="calculation"]',c).click()}));
  $$('.result-milestone',c).forEach(b=>b.addEventListener('click',()=>openResultMilestone(b.dataset.milestone,model,model2)));
}

function talentProfileHtml(name,initials,role,area,s1,s2){const final=finalCycleScore(s1,s2);return `<section class="panel"><div class="talent-header"><div class="talent-person"><div class="mini-avatar">${initials}</div><div><p class="eyebrow">Perfil de talento del colaborador</p><h2 style="margin:0 0 4px">${name}</h2><p style="margin:0;color:#777">${role} · ${area}</p></div></div>${status('Ciclo anual completo','success')}</div><div class="talent-executive-grid" style="margin-top:18px"><div class="read-only-block"><h4>Funciones generales</h4><ul class="clean-list"><li>Responsabilidades principales del cargo.</li><li>Funciones institucionales vigentes.</li><li>Información utilizada como contexto de desempeño.</li></ul></div>${state.cycle==='pilot'?'':`<div class="read-only-block"><h4>Objetivos del ciclo</h4><ul class="clean-list"><li>Objetivo 1 con indicador y meta.</li><li>Objetivo 2 con indicador y meta.</li></ul></div>`}</div><div class="summary-grid" style="margin:18px 0"><div class="summary-box"><span class="label">Evaluación 1</span><strong>${s1}%</strong><small>Resultado general</small></div><div class="summary-box"><span class="label">Evaluación 2</span><strong>${s2}%</strong><small>Resultado general</small></div><div class="summary-box highlight-final"><span class="label">Resultado final</span><strong>${final!==null?final.toFixed(1)+'%':'-'}</strong><small>Promedio de las dos evaluaciones</small></div></div><p class="small-muted">Las actas y resúmenes de cada hito constituyen el nivel de detalle; este perfil mantiene una lectura ejecutiva de la persona.</p></section>`}

function renderAdmin(){
  $('#campaignStatus').textContent=state.campaignStarted?'Activo':'Borrador';$('#campaignStatus').className=`status-pill ${state.campaignStarted?'success':'neutral'}`;
  const rows=(state.cycle==='annual'?annualSteps:pilotSteps).map(s=>`<tr><td><strong>${s.label}</strong></td><td><input class="control" value="${s.month}"/></td><td><input class="control" type="date"/></td><td><select class="control"><option>3 días antes</option><option>5 días antes</option><option>1 día antes</option><option>No enviar</option></select></td><td>RRHH</td></tr>`).join('');$('#scheduleRows').innerHTML=rows;
  renderExceptions();renderQuestionAdmin();renderWeightSchemes();renderMatrix();
}
function renderMatrix(){
  const body=$('#matrixRows');if(!body)return;
  body.innerHTML=state.team.map(m=>{const schemeKey=weightScenarioKey(false,m.serviceEligible);const configured=state.weightSchemes[schemeKey]?.configured;return `<tr><td><strong>${m.name}</strong><small>${m.role} · ${m.area}</small></td><td>Ricardo García</td><td>✓</td><td>✓</td><td>0</td><td><label class="service-toggle-cell"><input class="service-checkbox service-edit" data-member="${m.id}" type="checkbox" ${m.serviceEligible?'checked':''}><span>${m.serviceEligible?'Aplica':'No aplica'}</span></label>${m.serviceEligible&&m.serviceScore?`<small>Nota servicio: ${m.serviceScore}/100 · fuente externa</small>`:''}</td><td><strong>${schemeTitle(schemeKey)}</strong>${configured?'':`<small class="pending-value">Ponderación pendiente</small>`}</td><td>${m.profile?status('Correcto','success'):status('Sin perfil de cargo','warning')}</td></tr>`}).join('')+`<tr><td><strong>Ricardo García Ortiz</strong><small>Coordinador · Mejoramiento Continuo</small></td><td>María Andrade</td><td>✓</td><td>✓</td><td>${state.team.length}</td><td><span class="small-muted">No aplica</span></td><td><strong>${schemeTitle('withSubsNoService')}</strong></td><td>${status('Jefe también evaluado','success')}</td></tr>`;
  $$('.service-edit',body).forEach(x=>x.addEventListener('change',e=>{const m=member(e.target.dataset.member);m.serviceEligible=e.target.checked;saveState();renderMatrix();toast(`Evaluación de servicio ${m.serviceEligible?'activada':'desactivada'} para ${m.name}`)}));
}
function renderExceptions(){$('#exceptionRows').innerHTML=state.exceptions.map((x,i)=>`<tr><td>${x.person}</td><td>${x.official}</td><td>${x.evaluation}</td><td>${x.reason}</td><td>${x.period}</td><td><button class="link-btn">Editar</button></td></tr>`).join('')}
function formatLabel(q){return q.type==='open'?'Texto abierto':q.type==='frequency'?'Escala de frecuencia 1–5':'Rúbrica 1–5'}
function questionComponentKey(type){return type==='self'?'self':type==='manager'?'manager':'upward'}
function questionFinalContribution(type,weight,schemeKey){
  if(!weight)return 0;
  const component=questionComponentKey(type);
  const scheme=state.weightSchemes[schemeKey];
  return (+weight||0)*(+scheme[component]||0)/100;
}

function renderQuestionAdmin(){
  const select=$('#questionTypeSelect');if(!select)return;select.value=state.instrumentType||'manager';const type=select.value;const qs=evaluationQuestions(type);const scored=qs.filter(q=>q.type!=='open');const total=scored.reduce((a,q)=>a+(+q.weight||0),0);
  $('#questionAdminRows').innerHTML=qs.map((q,i)=>{
    const noSvc=questionFinalContribution(type,+q.weight||0,'withSubsNoService');
    const withSvc=questionFinalContribution(type,+q.weight||0,'withSubsService');
    return `<tr><td>${i+1}</td><td><strong>${q.title}</strong></td><td class="question-text-cell">${q.text}${q.optional?'<small>Opcional</small>':''}</td><td>${formatLabel(q)}</td><td>${q.evidence?'<span class="status-pill success">Sí</span>':'-'}</td><td>${q.type==='open'?'<span class="muted-text">No pondera</span>':`<div class="inline-weight"><input class="control question-weight-input" type="number" min="0" max="100" step="0.1" data-question-index="${i}" value="${q.weight||0}"><span>%</span></div>`}</td><td>${q.type==='open'?'-':`${noSvc.toFixed(3).replace('.',',')}%`}</td><td>${q.type==='open'?'-':`${withSvc.toFixed(3).replace('.',',')}%`}</td><td><div class="table-actions"><button class="link-btn edit-question" data-question-index="${i}">Editar</button><button class="link-btn danger-link delete-question" data-question-index="${i}">Borrar</button></div></td></tr>`;
  }).join('');
  const v=$('#questionWeightValidation');v.innerHTML=`<span>Peso de preguntas puntuables</span><strong>${total.toFixed(1)}%</strong><small>${total===100?'Configuración válida':'Debe sumar 100%'}</small>`;v.className=`weight-summary ${total===100?'valid':'invalid'}`;
  $$('.question-weight-input').forEach(inp=>inp.addEventListener('input',e=>{const q=state.questionConfig[type][+e.target.dataset.questionIndex];q.weight=+e.target.value||0;saveState();renderQuestionAdmin();}));
  $$('.edit-question').forEach(b=>b.addEventListener('click',()=>openQuestionEditor(type,+b.dataset.questionIndex)));
  $$('.delete-question').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.questionIndex;if(confirm('¿Borrar esta pregunta del instrumento?')){state.questionConfig[type].splice(i,1);saveState();renderQuestionAdmin();toast('Pregunta eliminada')}}));
}
function openQuestionEditor(type,index=null){
  const isNew=index===null;const q=isNew?{type:'frequency',title:'Nueva dimensión',text:'Nueva pregunta',weight:0,evidence:false,optional:false,rubrics:{...defaultRubrics.frequency}}:state.questionConfig[type][index];
  openModal(`${isNew?'Agregar':'Editar'} pregunta`, `<div class="form-grid"><label>Título / dimensión<input id="qTitle" class="control" value="${escapeAttr(q.title||'')}"></label><label>Formato<select id="qFormat" class="control"><option value="score" ${q.type==='score'?'selected':''}>Rúbrica 1–5</option><option value="frequency" ${q.type==='frequency'?'selected':''}>Frecuencia 1–5</option><option value="open" ${q.type==='open'?'selected':''}>Texto abierto</option></select></label><label class="wide">Pregunta<textarea id="qText" class="control">${q.text||''}</textarea></label><label>Peso dentro del instrumento (%)<input id="qWeight" class="control" type="number" min="0" max="100" step="0.1" value="${q.weight||0}"></label><label class="check-label"><input id="qEvidence" type="checkbox" ${q.evidence?'checked':''}> Solicitar campo de evidencia</label><label class="check-label"><input id="qOptional" type="checkbox" ${q.optional?'checked':''}> Pregunta opcional</label></div><div class="info-callout"><strong>Al guardar:</strong> el cambio se refleja en los formularios del prototipo y en el cálculo de resultados.</div><div class="modal-actions"><button class="btn secondary" id="cancelQuestion">Cancelar</button><button class="btn primary" id="saveQuestion" data-question-type="${type}" data-question-index="${isNew?'new':index}">Guardar pregunta</button></div>`);
}
function escapeAttr(v){return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function schemeTitle(key){return {withSubsNoService:'Con subordinados · sin servicio',withSubsService:'Con subordinados · con servicio',noSubsNoService:'Sin subordinados · sin servicio',noSubsService:'Sin subordinados · con servicio'}[key]||key}
function componentLabel(key){return {self:'Autoevaluación',manager:'Jefe',upward:'Subordinados',service:'Servicio'}[key]||key}
function renderWeightSchemes(){
  const root=$('#weightScenarioTable'); if(!root)return;
  const keys=['withSubsNoService','withSubsService','noSubsNoService','noSubsService'];
  root.innerHTML=`<div class="table-panel"><table class="weight-scenario-table"><thead><tr><th>Escenario</th><th>Autoevaluación</th><th>Jefe</th><th>Subordinados</th><th>Servicio</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>${keys.map(key=>{const sc=state.weightSchemes[key],app=applicableWeightComponents(key),defined=app.filter(c=>isDefinedWeight(sc[c])),total=defined.reduce((a,c)=>a+(+sc[c]),0),configured=defined.length===app.length&&total===100;sc.configured=configured;const cell=c=>app.includes(c)?(isDefinedWeight(sc[c])?`${(+sc[c]).toFixed(0)}%`:'<span class="pending-value">Por definir</span>'):'<span class="not-applicable">No aplica</span>';const totalLabel=configured?'100%':(defined.length?`${total.toFixed(0)}% <small>(parcial)</small>`:'<span class="pending-value">Por definir</span>');return `<tr><td><strong>${schemeTitle(key)}</strong><small>${key.startsWith('withSubs')?'Subordinados detectados en estructura':'Sin subordinados en estructura'}</small></td><td>${cell('self')}</td><td>${cell('manager')}</td><td>${cell('upward')}</td><td>${cell('service')}</td><td><strong>${totalLabel}</strong></td><td>${configured?status('Configurado','success'):status('Pendiente','warning')}</td><td><button class="btn small secondary edit-weight-scheme" data-scheme="${key}">Editar</button></td></tr>`}).join('')}</tbody></table></div>`;
  $$('.edit-weight-scheme',root).forEach(b=>b.addEventListener('click',()=>openWeightScenarioEditor(b.dataset.scheme)));
}
function openWeightScenarioEditor(key){
  const sc=state.weightSchemes[key],app=applicableWeightComponents(key);
  const fields=app.map(c=>`<label>${componentLabel(c)} (%)<input class="control scenario-weight-input" data-component="${c}" type="number" min="0" max="100" step="1" value="${isDefinedWeight(sc[c])?+sc[c]:''}" placeholder="Por definir"></label>`).join('');
  openModal(`Ponderación · ${schemeTitle(key)}`,`<div class="form-grid">${fields}</div><div id="scenarioWeightTotal" class="scheme-validation"></div><div class="info-callout"><strong>Regla:</strong> solo se muestran los componentes aplicables a este escenario y el total debe sumar 100% para considerarse configurado.</div><div class="modal-actions"><button class="btn secondary" id="cancelWeightScenario">Cancelar</button><button class="btn primary" id="saveWeightScenario" data-scheme="${key}">Guardar ponderación</button></div>`);
  const refresh=()=>{const values=$$('.scenario-weight-input').map(i=>i.value===''?null:+i.value);const complete=values.every(v=>Number.isFinite(v));const total=values.reduce((a,v)=>a+(v||0),0);const box=$('#scenarioWeightTotal');box.className=`scheme-validation ${complete&&total===100?'valid':'invalid'}`;box.innerHTML=`<strong>Total ${total}%</strong><span>${complete&&total===100?'Configuración válida':'Debe completar los campos y sumar 100%'}</span>`;};
  $$('.scenario-weight-input').forEach(i=>i.addEventListener('input',refresh));refresh();
}

const committeePeople=[
  {id:'ricardo',name:'Ricardo García Ortiz',initials:'RG',role:'Coordinador de Procesos y Automatización',department:'Mejoramiento Continuo',area:'Procesos',s1:86,s2:92,sessions:3,start:true,check1:true,check2:true},
  {id:'ana',name:'Ana Torres',initials:'AT',role:'Analista de Procesos',department:'Mejoramiento Continuo',area:'Procesos',s1:84,s2:88,sessions:3,start:true,check1:true,check2:true},
  {id:'diego',name:'Diego Vega',initials:'DV',role:'Analista de Datos',department:'Mejoramiento Continuo',area:'Analítica de Datos',s1:88,s2:93,sessions:3,start:true,check1:true,check2:true},
  {id:'sofia',name:'Sofía Paredes',initials:'SP',role:'Analista de Inteligencia',department:'Mejoramiento Continuo',area:'Analítica de Datos',s1:97,s2:98,sessions:3,start:true,check1:true,check2:true},
  {id:'valeria',name:'Valeria Ruiz',initials:'VR',role:'Especialista de Acreditación',department:'Mejoramiento Continuo',area:'Acreditación',s1:90,s2:95,sessions:3,start:true,check1:true,check2:true},
  {id:'carolina',name:'Carolina Paz',initials:'CP',role:'Analista de Acreditación',department:'Mejoramiento Continuo',area:'Acreditación',s1:95,s2:91,sessions:3,start:true,check1:true,check2:true},
  {id:'jose',name:'José Herrera',initials:'JH',role:'Coordinador de Proyectos',department:'Operaciones',area:'Proyectos',s1:78,s2:82,sessions:3,start:true,check1:true,check2:true},
  {id:'camila',name:'Camila Salazar',initials:'CS',role:'Analista de Proyectos',department:'Operaciones',area:'Proyectos',s1:93,s2:96,sessions:3,start:true,check1:true,check2:true},
  {id:'mateo',name:'Mateo Cevallos',initials:'MC',role:'Analista Administrativo',department:'Operaciones',area:'Servicios Administrativos',s1:89,s2:90,sessions:3,start:true,check1:true,check2:true},
  {id:'miguel',name:'Miguel León',initials:'ML',role:'Coordinador de Datos',department:'Student Journey',area:'Registro',s1:80,s2:86,sessions:3,start:true,check1:true,check2:true}
];
function committeePerson(id){return committeePeople.find(x=>x.id===id)}
function committeeLatestScore(p){return finalCycleScore(p.s1,p.s2)}
function committeeBand(score){if(score===null)return'pending';if(score>=97)return'outstanding';if(score>=92)return'optimal';if(score>=81)return'development';return'followup'}
function committeeBandLabel(score){if(score===null)return'Pendiente';if(score>=97)return'Sobresaliente';if(score>=92)return'Óptimo';if(score>=81)return'Buen desempeño / mejora';return'Seguimiento cercano'}
function committeeBandStatus(score){if(score===null)return'neutral';if(score>=92)return'success';if(score>=81)return'warning';return'danger'}
function committeeAreaStats(department,area){
  const rows=committeePeople.filter(p=>p.department===department&&p.area===area),scores=rows.map(committeeLatestScore).filter(x=>x!==null);
  return {department,area,people:rows.length,avg:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0,top:scores.filter(x=>x>=92).length,follow:scores.filter(x=>x<81).length};
}
function committeeDepartmentStats(department){
  const rows=committeePeople.filter(p=>p.department===department),scores=rows.map(committeeLatestScore).filter(x=>x!==null);
  return {department,people:rows.length,avg:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0,areas:new Set(rows.map(x=>x.area)).size};
}
function committeeFilteredPeople(){
  const f=state.committeeFilters||defaultState.committeeFilters;let rows=[...committeePeople];
  if(f.department&&f.department!=='all')rows=rows.filter(p=>p.department===f.department);
  if(f.area&&f.area!=='all')rows=rows.filter(p=>p.area===f.area);
  const q=(f.person||'').trim().toLowerCase();if(q)rows=rows.filter(p=>`${p.name} ${p.role} ${p.department} ${p.area}`.toLowerCase().includes(q));
  if(f.band&&f.band!=='all')rows=rows.filter(p=>committeeBand(committeeLatestScore(p))===f.band);
  rows.sort((a,b)=>{const sa=committeeLatestScore(a)??-1,sb=committeeLatestScore(b)??-1;if(f.sort==='scoreAsc')return sa-sb;if(f.sort==='name')return a.name.localeCompare(b.name,'es');if(f.sort==='department')return a.department.localeCompare(b.department,'es')||a.area.localeCompare(b.area,'es');if(f.sort==='area')return a.area.localeCompare(b.area,'es')||a.name.localeCompare(b.name,'es');return sb-sa;});
  return rows;
}
const processGuideData={
  start:{title:'1. Sesión de inicio',purpose:'Alinear expectativas al inicio del ciclo: revisar perfil y registrar acuerdos; los objetivos/KPIs solo aplican a ciclos que los tengan habilitados.',colaborador:['Consulta su perfil y funciones.','Participa en la definición de objetivos/KPIs.','Consulta el acta una vez registrada.'],jefe:['Abre Sesiones y selecciona al colaborador.','Registra objetivos, KPIs, observaciones, acuerdos y próximos pasos.','No evalúa desde Mi equipo.'],admin:['Configura fechas y comunicaciones.','Valida población y estructura provenientes de Nómina GP.','Gestiona excepciones y evaluación de servicio.'],comite:['Sin intervención en esta etapa.']},
  check1:{title:'2. Check-in 1',purpose:'Dar seguimiento temprano a objetivos, avances, obstáculos y acuerdos.',colaborador:['Consulta objetivos y avances.','Participa en la conversación de seguimiento.','Consulta el acta registrada.'],jefe:['Abre Sesiones y registra el Check-in 1.','Actualiza el porcentaje de avance por objetivo.','Registra contexto, avances, obstáculos, acuerdos y próximos pasos.'],admin:['Monitorea cumplimiento y envía recordatorios.'],comite:['Sin intervención en esta etapa.']},
  eval1:{title:'3. Evaluación 1',purpose:'Completar autoevaluación, evaluación ascendente y evaluación jefe → colaborador con reglas de habilitación.',colaborador:['Completa Autoevaluación con evidencias obligatorias.','Completa Evaluación a su jefe.','Espera cierre para consultar resultado general.'],jefe:['En Evaluaciones ve su propia autoevaluación y evaluación a jefe.','La lista del equipo habilita “Evaluar” solo cuando se cumplen prerrequisitos.','Completa la evaluación jefe → colaborador desde Evaluaciones.'],admin:['Monitorea avance y puede administrar instrumentos y ponderaciones.'],comite:['Sin intervención hasta disponer de resultados.']},
  check2:{title:'4. Check-in 2',purpose:'Revisar avances del segundo período con referencia al resultado de Evaluación 1 y al plan acordado.',colaborador:['Consulta objetivos, acuerdos y resultado general del primer período.','Participa en la conversación de seguimiento.'],jefe:['Registra contexto desde la conversación anterior.','Actualiza avance de objetivos mostrando nombre y descripción.','Registra avances, obstáculos, acuerdos y próximos pasos.'],admin:['Monitorea pendientes y recordatorios.'],comite:['Sin intervención en esta etapa.']},
  eval2:{title:'5. Evaluación 2 y cierre',purpose:'Cerrar el ciclo, calcular el promedio final de E1 y E2 y habilitar el análisis del Comité de Talento.',colaborador:['Completa las evaluaciones habilitadas.','Consulta E1, E2, resultado final y recorrido del ciclo.'],jefe:['Evalúa desde la pestaña Evaluaciones.','Consulta calificaciones finales del equipo desde Mi equipo.','Revisa E1, E2 y promedio final por colaborador.'],admin:['Cierra campaña y valida integridad de resultados.','Mantiene reglas de servicio, instrumentos y ponderaciones por escenario.'],comite:['Filtra resultados por departamento, área, persona y clasificación.','Abre perfiles de talento y actas autorizadas.','Registra planes de acción o decisiones.']}
};
function renderProcessGuide(){
  const c=$('#processGuideContent');const d=processGuideData[state.stage]||processGuideData.eval2;
  c.innerHTML=`<div class="page-heading"><div><p class="eyebrow">Vista del prototipo para TI</p><h1>Flujo funcional del proceso</h1><p class="lead">Selecciona una etapa y un rol para entender qué pantalla se habilita, qué información se consulta y dónde se realiza cada acción.</p></div>${status(stageLabel(),'neutral')}</div><section class="panel"><div class="process-guide-steps">${['start','check1','eval1','check2','eval2'].map((k,i)=>`<button class="process-guide-step ${state.stage===k?'active':''}" data-guide-stage="${k}"><span>${i+1}</span><strong>${stageLabel(k)}</strong></button>`).join('')}</div></section><section class="panel process-guide-detail"><div class="panel-heading"><div><h2>${d.title}</h2><p>${d.purpose}</p></div></div><div class="role-view-grid">${[['colaborador','Colaborador'],['jefe','Jefe / Evaluador'],['admin','RRHH / Administrador'],['comite','Comité de Talento']].map(([key,label])=>`<article class="role-view-card"><h3>${label}</h3><ul>${(d[key]||[]).map(x=>`<li>${x}</li>`).join('')}</ul><button class="btn small secondary simulate-role" data-role="${key}">Simular este rol</button></article>`).join('')}</div></section><section class="panel"><div class="panel-heading"><div><h2>Reglas clave de habilitación</h2><p>Resumen visual de dependencias que TI debe implementar.</p></div></div><div class="dependency-flow"><div>Autoevaluación</div><span>+</span><div>Evaluación a jefe</div><span>→</span><div class="accent">Habilita evaluación jefe → colaborador</div><span>→</span><div>Resultado del período</div></div></section>`;
  $$('[data-guide-stage]',c).forEach(b=>b.addEventListener('click',()=>{state.stage=b.dataset.guideStage;$('#stageSelect').value=state.stage;saveState();applyRole();navigate('processGuide')}));
  $$('.simulate-role',c).forEach(b=>b.addEventListener('click',()=>{state.role=b.dataset.role;$('#roleSelect').value=state.role;saveState();applyRole();toast('Rol simulado actualizado')}));
}

function renderCommittee(){
  const root=$('#committeeDashboard');if(!root)return;
  const f=state.committeeFilters||clone(defaultState.committeeFilters);state.committeeFilters=f;
  const filtered=committeeFilteredPeople(),scored=filtered.map(committeeLatestScore).filter(x=>x!==null),avg=scored.length?scored.reduce((a,b)=>a+b,0)/scored.length:0;
  const departments=[...new Set(committeePeople.map(p=>p.department))];
  const areas=[...new Set(committeePeople.filter(p=>f.department==='all'||p.department===f.department).map(p=>p.area))];
  if(f.area!=='all'&&!areas.includes(f.area))f.area='all';
  const deptStats=departments.map(committeeDepartmentStats);
  const selectedDepartment=f.department==='all'?null:f.department;
  const areaStats=(selectedDepartment?[...new Set(committeePeople.filter(p=>p.department===selectedDepartment).map(p=>p.area))].map(a=>committeeAreaStats(selectedDepartment,a)):[]);
  root.innerHTML=`
    <div class="dashboard-hero page-heading"><div><p class="eyebrow">Comité de Talento</p><h1>Dashboard de resultados</h1><p class="lead">Analiza el resultado final por departamento, área o persona antes de profundizar en cada perfil.</p></div>${status('Cierre anual','success')}</div>
    <section class="panel committee-filter-panel"><div class="panel-heading"><div><h2>Filtros de análisis</h2><p>La calificación utilizada es el resultado final del ciclo: promedio de Evaluación 1 y Evaluación 2.</p></div><button class="btn ghost small" id="committeeClearFilters">Limpiar filtros</button></div><div class="committee-filter-grid compact">
      <label>Departamento<select id="committeeDepartmentFilter" class="control"><option value="all">Todos los departamentos</option>${departments.map(d=>`<option value="${d}" ${f.department===d?'selected':''}>${d}</option>`).join('')}</select></label>
      <label>Área<select id="committeeAreaFilter" class="control"><option value="all">Todas las áreas</option>${areas.map(a=>`<option value="${a}" ${f.area===a?'selected':''}>${a}</option>`).join('')}</select></label>
      <label>Persona<input id="committeePersonFilter" class="control" value="${escapeAttr(f.person||'')}" placeholder="Nombre o cargo"></label>
      <label>Clasificación<select id="committeeBandFilter" class="control"><option value="all">Todas</option><option value="outstanding" ${f.band==='outstanding'?'selected':''}>97-100 · Sobresaliente</option><option value="optimal" ${f.band==='optimal'?'selected':''}>92-96 · Óptimo</option><option value="development" ${f.band==='development'?'selected':''}>81-91 · Oportunidades de mejora</option><option value="followup" ${f.band==='followup'?'selected':''}>&lt;81 · Seguimiento cercano</option></select></label>
      <label>Ordenar<select id="committeeSort" class="control"><option value="scoreDesc" ${f.sort==='scoreDesc'?'selected':''}>Mayor calificación</option><option value="scoreAsc" ${f.sort==='scoreAsc'?'selected':''}>Menor calificación</option><option value="name" ${f.sort==='name'?'selected':''}>Nombre</option><option value="department" ${f.sort==='department'?'selected':''}>Departamento</option><option value="area" ${f.sort==='area'?'selected':''}>Área</option></select></label>
    </div></section>
    <div class="summary-grid committee-summary-grid"><div class="summary-box"><span class="label">Personas visibles</span><strong>${filtered.length}</strong><small>Según filtros aplicados</small></div><div class="summary-box"><span class="label">Promedio visible</span><strong>${scored.length?avg.toFixed(1)+'%':'-'}</strong><small>Resultado final del ciclo</small></div><div class="summary-box"><span class="label">≥ 92%</span><strong>${scored.filter(x=>x>=92).length}</strong><small>Resultados altos</small></div><div class="summary-box"><span class="label">&lt; 81%</span><strong>${scored.filter(x=>x<81).length}</strong><small>Seguimiento cercano</small></div></div>
    <section class="committee-area-section"><div class="section-heading-inline"><div><h2>Resumen por departamento</h2><p>Selecciona un departamento para filtrar el dashboard y habilitar el resumen por área.</p></div></div><div class="committee-area-grid">${deptStats.map(d=>`<button type="button" class="committee-area-card ${f.department===d.department?'active':''}" data-department="${d.department}"><span class="committee-area-name">${d.department}</span><strong>${d.avg.toFixed(1)}%</strong><small>${d.people} personas · ${d.areas} áreas</small><span class="committee-area-action">Ver departamento →</span></button>`).join('')}</div></section>
    ${selectedDepartment?`<section class="committee-area-section"><div class="section-heading-inline"><div><h2>Áreas de ${selectedDepartment}</h2><p>Selecciona un área para profundizar en sus resultados.</p></div></div><div class="committee-area-grid">${areaStats.map(a=>`<button type="button" class="committee-area-card ${f.area===a.area?'active':''}" data-area="${a.area}"><span class="committee-area-name">${a.area}</span><strong>${a.avg.toFixed(1)}%</strong><small>${a.people} personas · ${a.top} ≥92% · ${a.follow} &lt;81%</small><span class="committee-area-action">Ver área →</span></button>`).join('')}</div></section>`:''}
    <section class="panel table-panel committee-results-panel"><div class="committee-results-heading"><div><p class="section-kicker">Resultados filtrados</p><h2>${f.area!=='all'?f.area:f.department!=='all'?f.department:'Institución'}</h2><p>${filtered.length} persona${filtered.length===1?'':'s'} visible${filtered.length===1?'':'s'} · abre la ficha para consultar información ejecutiva y registrar decisiones.</p></div><span class="status-pill neutral">${filtered.length} resultados</span></div>${filtered.length?`<table class="committee-results-table"><thead><tr><th>Persona</th><th>Departamento / área</th><th>E1</th><th>E2</th><th>Resultado final</th><th>Clasificación</th><th></th></tr></thead><tbody>${filtered.map(p=>{const final=committeeLatestScore(p);return `<tr><td><strong>${p.name}</strong><small>${p.role}</small></td><td><strong>${p.department}</strong><small>${p.area}</small></td><td>${p.s1!=null?p.s1.toFixed(1)+'%':'-'}</td><td>${p.s2!=null?p.s2.toFixed(1)+'%':'-'}</td><td><strong class="committee-latest-score">${final!=null?final.toFixed(1)+'%':'-'}</strong><small>${final!=null?`(${p.s1.toFixed(1)} + ${p.s2.toFixed(1)}) / 2`:''}</small></td><td>${status(committeeBandLabel(final),committeeBandStatus(final))}</td><td><div class="table-actions"><button class="btn small secondary committee-profile" data-member="${p.id}">Ver ficha</button><button class="link-btn committee-quick-action" data-member="${p.id}">Plan de acción</button></div></td></tr>`}).join('')}</tbody></table>`:`<div class="empty-state"><strong>No hay resultados para los filtros seleccionados.</strong><p>Modifica departamento, área, persona o clasificación para ampliar la búsqueda.</p></div>`}</section>`;
  const sync=(key,value)=>{state.committeeFilters[key]=value;if(key==='department')state.committeeFilters.area='all';saveState();renderCommittee();};
  $('#committeeDepartmentFilter')?.addEventListener('change',e=>sync('department',e.target.value));
  $('#committeeAreaFilter')?.addEventListener('change',e=>sync('area',e.target.value));
  $('#committeePersonFilter')?.addEventListener('change',e=>sync('person',e.target.value));
  $('#committeePersonFilter')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sync('person',e.target.value);}});
  $('#committeeBandFilter')?.addEventListener('change',e=>sync('band',e.target.value));
  $('#committeeSort')?.addEventListener('change',e=>sync('sort',e.target.value));
  $('#committeeClearFilters')?.addEventListener('click',()=>{state.committeeFilters=clone(defaultState.committeeFilters);saveState();renderCommittee();toast('Filtros restablecidos');});
  $$('[data-department]',root).forEach(b=>b.addEventListener('click',()=>{state.committeeFilters.department=b.dataset.department;state.committeeFilters.area='all';saveState();renderCommittee();}));
  $$('[data-area]',root).forEach(b=>b.addEventListener('click',()=>{state.committeeFilters.area=b.dataset.area;saveState();renderCommittee();setTimeout(()=>$('.committee-results-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),0);}));
  $$('.committee-profile',root).forEach(b=>b.addEventListener('click',()=>committeeProfile(committeePerson(b.dataset.member))));
  $$('.committee-quick-action',root).forEach(b=>b.addEventListener('click',()=>openCommitteeAction(committeePerson(b.dataset.member))));
}
function committeeProfile(m){
  const latest=committeeLatestScore(m);
  openModal(`Perfil de talento · ${m.name}`,`${talentProfileHtml(m.name,m.initials,m.role,`${m.department} · ${m.area}`,m.s1||latest||88,m.s2||latest||90)}<div class="panel" style="margin-top:14px"><div class="panel-heading"><div><h2>Actas y decisiones</h2><p>El Comité puede consultar lo registrado en las sesiones antes de tomar una decisión.</p></div>${status(committeeBandLabel(latest),committeeBandStatus(latest))}</div><div class="mini-checklist"><div class="mini-check"><span>Sesión de inicio</span><button class="link-btn committee-minute" data-member="${m.id}" data-type="Sesión de inicio">Ver acta</button></div><div class="mini-check"><span>Check-in 1</span><button class="link-btn committee-minute" data-member="${m.id}" data-type="Check-in 1">Ver acta</button></div><div class="mini-check"><span>Evaluación 1</span><strong>${m.s1!=null?m.s1+'%':'-'}</strong></div><div class="mini-check"><span>Evaluación 2</span><strong>${m.s2!=null?m.s2+'%':'-'}</strong></div></div><div class="modal-actions"><button class="btn primary committee-action">Registrar plan de acción</button></div></div>`,true);
  $$('.committee-minute').forEach(b=>b.addEventListener('click',()=>viewMinute(null,b.dataset.member,b.dataset.type)));
  $('.committee-action')?.addEventListener('click',()=>openCommitteeAction(m));
}
function openCommitteeAction(m){openModal(`Plan de acción · ${m.name}`,`<div class="form-grid"><label>Tipo de decisión<select class="control"><option>Plan de desarrollo</option><option>Reconocimiento</option><option>Seguimiento cercano</option><option>Otra acción</option></select></label><label>Fecha objetivo<input class="control" type="date"></label><label class="wide">Acción / decisión<textarea class="control" placeholder="Describe el plan de acción aprobado..."></textarea></label></div><div class="modal-actions"><button class="btn secondary" id="cancelAction">Cancelar</button><button class="btn primary" id="saveAction">Guardar y comunicar</button></div>`)}

function openModal(title,html,wide=false){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=`<div class="modal-body">${html}</div>`;$('#modal .modal-card').classList.toggle('wide',wide);$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false')}
function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');$('#modal .modal-card').classList.remove('wide')}

// Global events
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
const drawerBackdrop=$('#drawerBackdrop');
function setDrawer(open){const s=$('#sidebar');s.classList.toggle('collapsed',!open);s.setAttribute('aria-hidden',open?'false':'true');drawerBackdrop?.classList.toggle('open',open);drawerBackdrop?.setAttribute('aria-hidden',open?'false':'true');}
$('#menuBtn').addEventListener('click',()=>setDrawer($('#sidebar').classList.contains('collapsed')));
drawerBackdrop?.addEventListener('click',()=>setDrawer(false));
$('#roleSelect').value=state.role;$('#cycleSelect').value=state.cycle;$('#stageSelect').value=state.stage;
$('#roleSelect').addEventListener('change',e=>{state.role=e.target.value;state.page=state.role==='admin'?'admin':state.role==='comite'?'committee':'dashboard';saveState();applyRole();toast('Vista cambiada')});
$('#cycleSelect').addEventListener('change',e=>{state.cycle=e.target.value;if(state.cycle==='pilot'&&state.page==='kpis')state.page='dashboard';saveState();applyRole();toast('Escenario del ciclo actualizado')});
$('#stageSelect').addEventListener('change',e=>{state.stage=e.target.value;saveState();applyRole();toast('Etapa del proceso actualizada')});
$('#processGuideBtn').addEventListener('click',()=>navigate('processGuide'));
$('#notificationBtn').addEventListener('click',()=>$('#notificationPanel').classList.toggle('open'));
$('#markReadBtn').addEventListener('click',()=>{state.notificationsRead=true;saveState();renderNotifications();toast('Notificaciones marcadas como leídas')});
document.addEventListener('click',e=>{if(!e.target.closest('#notificationPanel')&&!e.target.closest('#notificationBtn'))$('#notificationPanel').classList.remove('open')});
$('#closeModal').addEventListener('click',closeModal);$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});
$('#resetDemo').addEventListener('click',()=>{localStorage.removeItem(STORAGE);state=clone(defaultState);$('#roleSelect').value=state.role;$('#cycleSelect').value=state.cycle;$('#stageSelect').value=state.stage;applyRole();toast('Demo restablecida')});
$('#addKpiBtn').addEventListener('click',()=>openModal('Agregar objetivo / KPI',`<div class="form-grid"><label class="wide">Objetivo<input id="mGoal" class="control" placeholder="Describe el objetivo"></label><label>Indicador<input id="mIndicator" class="control" placeholder="Indicador"></label><label>Meta<input id="mMeta" class="control" placeholder="Meta"></label><label>Línea base<input id="mBase" class="control" placeholder="Línea base"></label></div><div class="info-callout">En el proceso definitivo, los objetivos se construyen en conjunto durante la sesión de inicio.</div><div class="modal-actions"><button class="btn secondary" id="cancelKpi">Cancelar</button><button id="saveKpiModal" class="btn primary">Guardar</button></div>`));
$('#newSessionBtn').addEventListener('click',()=>openSessionBuilder('Check-in 2',null));
$('#saveEval').addEventListener('click',()=>{saveState();toast('Borrador guardado')});$('#submitEval').addEventListener('click',submitEvaluation);

$$('[data-admin-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-admin-tab]').forEach(x=>x.classList.toggle('active',x===b));$$('.admin-pane').forEach(x=>x.classList.toggle('active',x.id===b.dataset.adminTab));}));
$('#startCampaign').addEventListener('click',()=>{state.campaignStarted=true;state.notificationsRead=false;saveState();renderAdmin();renderNotifications();toast('Ciclo iniciado. Se generaron notificaciones para jefes y colaboradores.')});
$('#validateMatrix').addEventListener('click',()=>toast('Validación completada: revisar perfil faltante y reglas especiales antes de iniciar.'));
$('#adminCycleType').addEventListener('change',e=>{state.cycle=e.target.value;$('#cycleSelect').value=state.cycle;saveState();renderAdmin();toast('Calendario actualizado al tipo de ciclo')});
$('#questionTypeSelect')?.addEventListener('change',e=>{state.instrumentType=e.target.value;saveState();renderQuestionAdmin()});
$('#addQuestionBtn')?.addEventListener('click',()=>openQuestionEditor(state.instrumentType||'manager',null));
$('#addExceptionBtn').addEventListener('click',()=>openModal('Nueva excepción de estructura',`<div class="form-grid"><label>Persona<input id="exPerson" class="control" placeholder="Buscar persona"></label><label>Jefe oficial<input id="exOfficial" class="control" placeholder="Jefe oficial"></label><label>Evaluador excepcional<input id="exNew" class="control" placeholder="Nuevo evaluador"></label><label>Vigencia<select id="exPeriod" class="control"><option>S1 2027</option><option>S2 2027</option><option>Todo el ciclo</option></select></label><label class="wide">Motivo<textarea id="exReason" class="control" placeholder="Motivo de la excepción"></textarea></label></div><div class="modal-actions"><button class="btn secondary" id="cancelEx">Cancelar</button><button class="btn primary" id="saveEx">Guardar excepción</button></div>`));

document.addEventListener('click',e=>{
  if(e.target?.id==='cancelKpi'||e.target?.id==='cancelSession'||e.target?.id==='cancelEx'||e.target?.id==='cancelAction'||e.target?.id==='cancelQuestion'||e.target?.id==='cancelWeightScenario')closeModal();
  if(e.target?.id==='saveKpiModal'){state.kpis.push({id:Date.now(),title:$('#mGoal').value||'Nuevo objetivo',indicator:$('#mIndicator').value||'Por definir',meta:$('#mMeta').value||'Por definir',base:$('#mBase').value||'Por definir',progress:0});saveState();renderKpis();closeModal();toast('Objetivo agregado')}
  if(e.target?.id==='saveSession'){const target=e.target.dataset.sessionTarget,type=e.target.dataset.sessionType;if(target){const m=member(target);if(type==='Sesión de inicio'){m.start=true;if(state.cycle!=='pilot')m.kpis=Math.max(m.kpis,2)}else if(type==='Check-in 2')m.check2=true;else m.check1=true;}else{state.sessions.push({id:Date.now(),date:new Date().toLocaleDateString('es-EC'),type,summary:type==='Sesión de inicio'?(state.cycle==='pilot'?'Perfil y acuerdos.':'Perfil, objetivos/KPIs y acuerdos.'):'Avances, obstáculos y acuerdos.',status:'Completada',participants:'Ricardo / María',agreements:['Acuerdo registrado desde el prototipo.'],next:['Próximo paso registrado desde el prototipo.']});}saveState();closeModal();toast('Acta guardada');if(target){renderTeamMember()}else renderSessions();}
  if(e.target?.id==='saveEx'){state.exceptions.push({person:$('#exPerson').value||'Persona',official:$('#exOfficial').value||'-',evaluation:$('#exNew').value||'-',reason:$('#exReason').value||'Excepción manual',period:$('#exPeriod').value});saveState();renderExceptions();closeModal();toast('Excepción agregada')}
  if(e.target?.id==='saveWeightScenario'){const key=e.target.dataset.scheme,sc=state.weightSchemes[key],inputs=$$('.scenario-weight-input');const vals=inputs.map(i=>i.value===''?null:+i.value);const total=vals.reduce((a,v)=>a+(v||0),0);if(!vals.every(v=>Number.isFinite(v))||total!==100){toast('La ponderación debe completar los campos y sumar 100%');return;}inputs.forEach(i=>sc[i.dataset.component]=+i.value);applicableWeightComponents(key).forEach(c=>{if(!inputs.some(i=>i.dataset.component===c))sc[c]=0});sc.configured=true;saveState();closeModal();renderWeightSchemes();toast('Ponderación guardada');}
  if(e.target?.id==='saveQuestion'){
    const type=e.target.dataset.questionType,idx=e.target.dataset.questionIndex,format=$('#qFormat').value;
    const q={type:format,title:$('#qTitle').value||'Pregunta',text:$('#qText').value||'Pregunta',weight:format==='open'?0:(+$('#qWeight').value||0),evidence:$('#qEvidence').checked,optional:$('#qOptional').checked,rubrics:format==='frequency'?{...defaultRubrics.frequency}:format==='score'?{...defaultRubrics.score}:undefined};
    if(idx==='new')state.questionConfig[type].push(q);else state.questionConfig[type][+idx]=q;
    saveState();closeModal();renderQuestionAdmin();toast('Pregunta guardada');
  }
  if(e.target?.id==='saveAction'){closeModal();toast('Plan de acción guardado y listo para comunicar al colaborador')}
});

applyRole();
