const $=(s,ctx=document)=>ctx.querySelector(s);
const $$=(s,ctx=document)=>[...ctx.querySelectorAll(s)];

const STORAGE='usfq-gd-v042-state';

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
  role:'jefe',cycle:'annual',page:'dashboard',campaignStarted:false,selectedMember:'ana',selectedArea:'Mejoramiento Continuo',instrumentType:'manager',
  committeeFilters:{area:'all',person:'',minScore:'',maxScore:'',band:'all',sort:'scoreDesc'},
  notificationsRead:false,
  own:{selfSubmitted:false,upwardSubmitted:false,lastResult:87,serviceEligible:false},
  weightSchemes:{
    noService:{self:5,manager:60,upward:35,service:0},
    service:{self:5,manager:35,upward:35,service:25}
  },
  questionConfig:JSON.parse(JSON.stringify(baseQuestionConfig)),
  kpis:[
    {id:1,title:'Reducir tiempo de respuesta de solicitudes',meta:'24 horas',base:'48 horas',indicator:'Tiempo promedio de respuesta',progress:72},
    {id:2,title:'Digitalizar expedientes administrativos',meta:'100%',base:'35%',indicator:'Porcentaje de expedientes digitalizados',progress:64}
  ],
  sessions:[
    {id:1,date:'15/08/2027',type:'Sesión de arranque',summary:'Perfil, objetivos/KPIs, acuerdos y próximos pasos.',status:'Completada',participants:'Ricardo / María',general:'Se revisó el perfil de cargo y se acordaron prioridades del ciclo.',agreements:['Priorizar automatización de solicitudes repetitivas.','Medir semanalmente el tiempo promedio de respuesta.'],next:['Revisar primer avance en el check-in de octubre.']},
    {id:2,date:'18/10/2027',type:'Check-in 1',summary:'Avances, obstáculos y acuerdos.',status:'Completada',participants:'Ricardo / María',advances:'Se automatizó el primer grupo de solicitudes y mejoró el tiempo de respuesta.',obstacles:'Acceso parcial a datos históricos.',agreements:['Completar acceso a datos antes de noviembre.'],next:['Validar tendencia del indicador al cierre de diciembre.']}
  ],
  team:[
    {id:'ana',name:'Ana Torres',initials:'AT',role:'Analista de Procesos',area:'Mejoramiento Continuo',profile:true,start:true,check1:true,self:true,upward:true,manager:false,s1:null,s2:null,kpis:2,plan:'Pendiente',serviceEligible:false},
    {id:'diego',name:'Diego Vega',initials:'DV',role:'Analista de Datos',area:'Mejoramiento Continuo',profile:true,start:true,check1:true,self:true,upward:true,manager:true,s1:88,s2:null,kpis:2,plan:'Pendiente',serviceEligible:true,serviceScore:94},
    {id:'carolina',name:'Carolina Paz',initials:'CP',role:'Asistente de Proyecto',area:'Proyectos',profile:false,start:true,check1:true,self:true,upward:true,manager:true,s1:95,s2:91,kpis:2,plan:'En seguimiento',serviceEligible:false},
    {id:'miguel',name:'Miguel León',initials:'ML',role:'Coordinador de Datos',area:'Analítica',profile:true,start:false,check1:false,self:false,upward:false,manager:false,s1:null,s2:null,kpis:0,plan:'Pendiente',serviceEligible:true,serviceScore:91}
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

const annualSteps=[
  {key:'start',month:'Agosto',label:'Sesión de arranque'},
  {key:'check1',month:'Octubre',label:'Check-in 1'},
  {key:'eval1',month:'Enero',label:'Evaluación 1'},
  {key:'check2',month:'Abril',label:'Check-in 2'},
  {key:'eval2',month:'Junio',label:'Evaluación 2'}
];
const pilotSteps=[
  {key:'start',month:'Enero',label:'Sesión de arranque'},
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
  renderNotifications();
  const dashboardNav=$('.nav-link[data-page="dashboard"]');
  if(dashboardNav) dashboardNav.style.display=r==='comite'?'none':'';
  if(r==='admin' && !['admin','dashboard'].includes(state.page)) state.page='admin';
  if(r==='comite') state.page='committee';
  if((r==='colaborador'||r==='jefe') && ['admin','committee'].includes(state.page)) state.page='dashboard';
  navigate(state.page||'dashboard');
}

function renderNotifications(){
  const common=state.campaignStarted?[{title:'Ciclo de desempeño iniciado',body:'Revisa tu próxima actividad y las fechas definidas por RRHH.',when:'Hoy'}]:[{title:'Próximo ciclo de desempeño',body:'RRHH publicará el calendario y activará el proceso.',when:'Próximamente'}];
  const byRole={
    colaborador:[{title:'Completa tus evaluaciones',body:'Autoevaluación y evaluación a tu jefe disponibles en la etapa de evaluación.',when:'Pendiente'},{title:'Revisa tus objetivos',body:'Tus KPIs acordados están disponibles para consulta.',when:'Activo'}],
    jefe:[{title:'Evalúa a tu equipo',body:'Ana Torres está lista para que completes su evaluación.',when:'Pendiente'},{title:'Actividad bloqueada',body:'Miguel aún debe completar las actividades previas de su ciclo.',when:'Seguimiento'}],
    admin:[{title:'Seguimiento de pendientes',body:'El sistema puede recordar automáticamente a quienes no completaron actividades.',when:'Configuración'},{title:'Validación de matriz',body:'Revisa perfiles y relaciones antes de iniciar el ciclo.',when:'Antes del inicio'}],
    comite:[{title:'Resultados disponibles',body:'Usa los filtros del dashboard para analizar áreas, personas y rangos de calificación antes de registrar decisiones.',when:'Cierre'}]
  };
  const items=[...common,...byRole[state.role]];
  $('#notificationList').innerHTML=items.map(n=>`<div class="notification-item ${state.notificationsRead?'read':''}"><div class="notification-dot"></div><div><strong>${n.title}</strong><p>${n.body}</p><small>${n.when}</small></div></div>`).join('');
  $('#notificationCount').textContent=state.notificationsRead?'0':items.length;
  $('#notificationCount').style.display=state.notificationsRead?'none':'block';
}

function timelineHtml(currentKey='eval1'){
  const steps=cycleSteps();
  const cur=steps.findIndex(s=>s.key===currentKey);
  return `<div class="timeline ${steps.length===5?'five':'four'}">${steps.map((s,i)=>`<div class="step ${i<cur?'done':i===cur?'current':''}"><div class="step-dot">${i<cur?'✓':i+1}</div><div><strong>${s.label}</strong><span>${s.month} · ${i<cur?'Completado':i===cur?'En curso':'Pendiente'}</span></div></div>`).join('')}</div>`;
}

function renderDashboard(){
  const c=$('#dashboardContent');
  if(state.role==='admin'){
    c.innerHTML=`<div class="dashboard-hero page-heading"><div><p class="eyebrow">Administración funcional</p><h1>Gestión del ciclo</h1><p class="lead">Configura el calendario, valida la población y activa el proceso desde una sola vista.</p></div>${status(state.campaignStarted?'Ciclo activo':'Ciclo en borrador',state.campaignStarted?'success':'neutral')}</div>
    <div class="cards-grid three"><article class="metric-card activity-card"><div class="metric-icon">1</div><div><span class="metric-label">Próxima acción</span><h3>${state.campaignStarted?'Monitorear pendientes':'Validar e iniciar ciclo'}</h3><p>${state.campaignStarted?'Revisa el cumplimiento de sesiones y evaluaciones.':'Completa calendario, matriz y comunicaciones antes del inicio.'}</p><button class="text-action" data-go="admin">Abrir administración →</button></div></article><article class="metric-card"><div class="metric-icon">◎</div><div><span class="metric-label">Matriz</span><h3>2 observaciones</h3><p>1 perfil faltante y 1 regla especial de VP.</p></div></article><article class="metric-card"><div class="metric-icon">♢</div><div><span class="metric-label">Recordatorios</span><h3>3 reglas</h3><p>Inicio, pendiente y vencimiento.</p></div></article></div>`;
  }else if(state.role==='comite'){
    c.innerHTML=`<div class="dashboard-hero page-heading"><div><p class="eyebrow">Comité de Talento</p><h1>Resumen ejecutivo</h1><p class="lead">Identifica áreas y personas que requieren reconocimiento, desarrollo o seguimiento.</p></div>${status('Cierre anual','success')}</div>
    <div class="summary-grid"><div class="summary-box"><span class="label">Promedio general</span><strong>89%</strong><small>Resultado ilustrativo</small></div><div class="summary-box"><span class="label">Áreas</span><strong>3</strong><small>Disponibles para análisis</small></div><div class="summary-box"><span class="label">≥ 92%</span><strong>5</strong><small>Candidatos destacados</small></div><div class="summary-box"><span class="label">Seguimiento</span><strong>3</strong><small>Requieren acción</small></div></div><div style="margin-top:18px"><button class="btn primary" data-go="committee">Ver resumen por área</button></div>`;
  }else{
    const isBoss=state.role==='jefe';
    c.innerHTML=`<div class="dashboard-hero page-heading"><div><p class="eyebrow">Ciclo ${state.cycle==='annual'?'2027-2028':'Piloto 2027'}</p><h1>Hola, Ricardo</h1><p class="lead">${isBoss?'Gestiona tu propio ciclo y da seguimiento al proceso de tu equipo.':'Aquí puedes ver qué debes hacer, tus acuerdos y tus resultados disponibles.'}</p></div>${status('Ciclo activo','success')}</div>
    <div class="alert-banner"><div><strong>${isBoss?'Próxima actividad: Evalúa a tu equipo':'Próxima actividad: Completa tus evaluaciones'}</strong><p>${isBoss?'Ana Torres ya completó sus evaluaciones previas y está lista para tu evaluación.':'Completa tu autoevaluación y la evaluación a tu jefe para habilitar el siguiente paso.'}</p></div><button class="btn primary" data-go="${isBoss?'team':'evaluations'}">Continuar</button></div>
    <div class="cycle-card panel"><div class="panel-heading"><div><h2>Mi ciclo de desempeño</h2><p>${state.cycle==='annual'?'Agosto 2027 - Junio 2028':'Enero - Julio 2027'}</p></div><div class="progress-summary"><strong>${state.cycle==='annual'?'45%':'55%'}</strong><span>avance</span></div></div>${timelineHtml('eval1')}</div>
    <div class="cards-grid three"><article class="metric-card"><div class="metric-icon">◎</div><div><span class="metric-label">Objetivos / KPIs</span><h3>2 objetivos</h3><p>Avance promedio: <strong>68%</strong></p><button class="text-action" data-go="kpis">Ver objetivos →</button></div></article><article class="metric-card"><div class="metric-icon">▣</div><div><span class="metric-label">Última sesión</span><h3>Check-in 1</h3><p>Acta registrada y disponible para consulta.</p><button class="text-action" data-go="sessions">Ver acta →</button></div></article><article class="metric-card"><div class="metric-icon">%</div><div><span class="metric-label">Último resultado disponible</span><h3>${state.own.lastResult}%</h3><p>Consulta el resumen y tu perfil de talento.</p><button class="text-action" data-go="results">Ver resultados →</button></div></article></div>
    <div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Últimos acuerdos</h2><p>Check-in 1 · 18 octubre 2027</p></div>${status('Acta registrada','neutral')}</div><ul class="clean-list"><li>Completar acceso a datos históricos antes de noviembre.</li><li>Revisar tendencia del indicador al cierre de diciembre.</li></ul><button class="btn ghost" data-go="sessions">Abrir bitácora</button></section><section class="panel"><div class="panel-heading"><div><h2>${isBoss?'Estado de mi equipo':'Mis evaluaciones'}</h2><p>${isBoss?'Seguimiento de la etapa actual.':'Actividades que debes completar.'}</p></div></div>${isBoss?`<div class="mini-checklist"><div class="mini-check"><span>Ana Torres</span>${status('Lista para evaluar','success')}</div><div class="mini-check"><span>Diego Vega</span>${status('Completada · con servicio','success')}</div><div class="mini-check"><span>Carolina Paz</span>${status('Completada','success')}</div></div>`:`<div class="mini-checklist"><div class="mini-check"><span>Autoevaluación</span>${status(state.own.selfSubmitted?'Enviada':'Pendiente',state.own.selfSubmitted?'success':'warning')}</div><div class="mini-check"><span>Evaluación a mi jefe</span>${status(state.own.upwardSubmitted?'Enviada':'Pendiente',state.own.upwardSubmitted?'success':'warning')}</div></div>`}</section></div>`;
  }
  $$('[data-go]',c).forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
}

function renderKpis(){
  const c=$('#kpiList');c.innerHTML='';
  state.kpis.forEach(k=>{const el=document.createElement('article');el.className='panel kpi-card';el.innerHTML=`<div class="panel-heading"><div><h2>${k.title}</h2><p>${k.indicator}</p></div>${status(`${k.progress}% avance`,k.progress>=70?'success':'warning')}</div><div class="kpi-grid"><div><span class="kpi-value">Indicador<strong>${k.indicator}</strong></span></div><div><span class="kpi-value">Línea base<strong>${k.base}</strong></span></div><div><span class="kpi-value">Meta<strong>${k.meta}</strong></span></div></div><div style="margin-top:16px"><div class="goal-top"><span>Progreso registrado en check-in</span><strong>${k.progress}%</strong></div><div class="progress"><div style="width:${k.progress}%"></div></div></div>`;c.appendChild(el)});
}

function renderSessions(){
  $('#sessionRows').innerHTML=state.sessions.map(s=>`<tr><td>${s.date}</td><td>${s.type}</td><td>${s.participants}</td><td>${s.summary}</td><td>${status(s.status,s.status==='Completada'?'success':'neutral')}</td><td><button class="link-btn view-minute" data-session="${s.id}">Ver acta</button></td></tr>`).join('')+`<tr><td>${state.cycle==='annual'?'15/04/2028':'20/05/2027'}</td><td>Check-in 2</td><td>Ricardo / María</td><td>-</td><td>${status('Pendiente','neutral')}</td><td>${state.role==='jefe'?'<button class="link-btn register-own-checkin">Registrar</button>':'Pendiente de jefatura'}</td></tr>`;
  $$('.view-minute').forEach(b=>b.addEventListener('click',()=>viewMinute(+b.dataset.session)));
  $$('.register-own-checkin').forEach(b=>b.addEventListener('click',()=>openSessionBuilder('Check-in 2',null)));
}

function viewMinute(sessionId,targetId=null,typeOverride=null){
  let data;
  if(targetId){const m=member(targetId)||committeePerson(targetId)||{name:'Colaborador'}; data={date:typeOverride==='Sesión de arranque'?'15/08/2027':'18/10/2027',type:typeOverride||'Check-in 1',participants:`${m.name} / Jefatura`,general:'Se revisó el perfil del cargo y las prioridades del período.',advances:'Se reportaron avances en los objetivos acordados.',obstacles:'Se identificó una dependencia de información externa.',agreements:['Mantener seguimiento quincenal del indicador.','Priorizar las actividades acordadas.'],next:['Revisar resultados en la siguiente conversación.']};}
  else data=state.sessions.find(x=>x.id===sessionId);
  if(!data)return;
  openModal(`Acta · ${data.type}`,`<div class="minutes-card"><div class="minutes-cover"><h3>${data.type}</h3><div class="minutes-meta"><span><strong>Fecha:</strong> ${data.date}</span><span><strong>Participantes:</strong> ${data.participants}</span></div></div><div class="minutes-body">${data.type.includes('arranque')?`<div class="minutes-section"><h4>Revisión del perfil</h4><p>${data.general||'Perfil revisado conjuntamente.'}</p></div><div class="minutes-section"><h4>Objetivos / KPIs acordados</h4><ul><li>Objetivo 1 · indicador, línea base y meta definidos.</li><li>Objetivo 2 · indicador, línea base y meta definidos.</li></ul></div>`:`<div class="minutes-section"><h4>Avances</h4><p>${data.advances||'-'}</p></div><div class="minutes-section"><h4>Obstáculos</h4><p>${data.obstacles||'-'}</p></div>`}<div class="minutes-section"><h4>Acuerdos</h4><ul>${(data.agreements||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="minutes-section"><h4>Próximos pasos</h4><ul>${(data.next||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div></div></div>`,true);
}

function evaluationQuestions(type){return state.questionConfig?.[type]||baseQuestionConfig[type]||[]}

function evaluationDef(){
  if(currentEval.type==='self')return {title:'Autoevaluación',lead:'Reflexiona sobre tu desempeño. Las dos preguntas abiertas corresponden a la definición más reciente de RRHH.',helper:'El puntaje 5 debe reservarse para un desempeño excepcional, sostenido y claramente superior a lo esperado.',questions:evaluationQuestions('self')};
  if(currentEval.type==='upward')return {title:'Evaluación a mi jefe',lead:'Evalúa comportamientos de liderazgo. El jefe no tiene acceso a tus respuestas individuales desde su vista.',helper:'Escala: Nunca / Ocasionalmente / Regularmente / Frecuentemente / Siempre. El feedback adicional es opcional.',questions:evaluationQuestions('upward')};
  const m=member(currentEval.targetId);return {title:`Evaluación de ${m?.name||'colaborador'}`,lead:'Revisa la autoevaluación como contexto y completa la evaluación jefe → supervisado.',helper:'Las preguntas 1 y 2 muestran rúbrica conductual y permiten registrar evidencia. El resultado se habilita al finalizar esta evaluación.',questions:evaluationQuestions('manager')};
}
function evalKey(){return currentEval.type==='manager'?`manager-${currentEval.targetId}`:currentEval.type}

function renderEvaluationHub(){
  const c=$('#evaluationHub');
  if(state.role==='jefe'){
    const ready=state.team.filter(x=>x.self&&x.upward&&!x.manager).length;
    c.innerHTML=`<div class="info-callout"><strong>Tu doble rol:</strong> como jefe también realizas tu propia autoevaluación y evalúas a tu jefe, siempre que tengas una jefatura asignada.</div>
    <div class="evaluation-cards"><article class="evaluation-card"><div class="evaluation-card-head"><h2>Mi autoevaluación</h2>${status(state.own.selfSubmitted?'Enviada':'Pendiente',state.own.selfSubmitted?'success':'warning')}</div><p>Reflexiona sobre tu propio desempeño y registra las dos preguntas abiertas definidas.</p><div class="evaluation-card-actions">${btn(state.own.selfSubmitted?'Ver respuesta':'Comenzar','primary','data-start-eval="self"')}</div></article><article class="evaluation-card"><div class="evaluation-card-head"><h2>Evaluación a mi jefe</h2>${status(state.own.upwardSubmitted?'Enviada':'Pendiente',state.own.upwardSubmitted?'success':'warning')}</div><p>Evalúa a tu jefatura. Tus respuestas no se muestran al jefe desde su vista de equipo.</p><div class="evaluation-card-actions">${btn(state.own.upwardSubmitted?'Ver estado':'Comenzar','primary','data-start-eval="upward"')}</div></article></div>
    <div class="panel" style="margin-top:18px"><div class="panel-heading"><div><h2>Evaluaciones de mi equipo</h2><p>${ready} colaborador(es) ya completaron los pasos previos y están listos para tu evaluación.</p></div><button class="btn primary" data-go="team">Evaluar a mi equipo</button></div><div class="mini-checklist">${state.team.map(m=>`<div class="mini-check"><span>${m.name}</span>${m.manager?status('Evaluación completada','success'):(m.self&&m.upward?status('Lista para evaluar','success'):status('Pendiente colaborador','warning'))}</div>`).join('')}</div></div>`;
  }else{
    const both=state.own.selfSubmitted&&state.own.upwardSubmitted;
    c.innerHTML=`${both?'<div class="alert-banner"><div><strong>Pasos del colaborador completados</strong><p>Tu jefe ya puede completar tu evaluación. Los resultados aparecerán cuando la etapa correspondiente finalice.</p></div></div>':''}<div class="evaluation-cards"><article class="evaluation-card"><div class="evaluation-card-head"><h2>Autoevaluación</h2>${status(state.own.selfSubmitted?'Enviada':'Pendiente',state.own.selfSubmitted?'success':'warning')}</div><p>Incluye cumplimiento, calidad y las dos preguntas abiertas definidas para el período.</p><div class="evaluation-card-actions">${btn(state.own.selfSubmitted?'Consultar':'Comenzar','primary','data-start-eval="self"')}</div></article><article class="evaluation-card"><div class="evaluation-card-head"><h2>Evaluación a mi jefe</h2>${status(state.own.upwardSubmitted?'Enviada':'Pendiente',state.own.upwardSubmitted?'success':'warning')}</div><p>Completa la evaluación de tu jefe. El jefe no puede revisar tus respuestas individuales desde su módulo.</p><div class="evaluation-card-actions">${btn(state.own.upwardSubmitted?'Consultar estado':'Comenzar','primary','data-start-eval="upward"')}</div></article></div>`;
  }
  $$('[data-start-eval]',c).forEach(b=>b.addEventListener('click',()=>startEvaluation(b.dataset.startEval)));
  $$('[data-go]',c).forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
}

function startEvaluation(type,targetId=null){
  if(type==='manager'){
    const m=member(targetId);if(!(m.self&&m.upward)){toast('Esta evaluación se habilita cuando el colaborador complete su autoevaluación y la evaluación a su jefe.');return;}
  }
  currentEval={type,targetId};renderEvaluationForm();navigate('evaluationForm');
}
function renderEvaluationForm(){
  const def=evaluationDef();$('#evalTitle').textContent=def.title;$('#evalLead').textContent=def.lead;$('#evalHelper').textContent=def.helper;$('#evalStatus').textContent='En progreso';$('#evalStatus').className='status-pill warning';
  const key=evalKey();const answers=state.evalAnswers[key]||{};const c=$('#questionList');
  c.innerHTML=def.questions.map((q,i)=>{const a=answers[i]||{};if(q.type==='open')return `<article class="panel question-card open-question"><div class="question-head"><div class="question-number">${i+1}</div><div><h2>${q.title}${q.optional?' · opcional':''}</h2><p>${q.text}</p></div></div><div class="question-body"><textarea data-open="${i}" placeholder="Escribe tu respuesta...">${a.text||''}</textarea></div></article>`;
    return `<article class="panel question-card"><div class="question-head"><div class="question-number">${i+1}</div><div><h2>${q.title}</h2><p>${q.text}</p></div></div><div class="question-body"><div class="scale ${q.type==='frequency'?'labels':''}">${[1,2,3,4,5].map(n=>`<button type="button" data-q="${i}" data-value="${n}" class="${a.score==n?'selected':''}">${n}${q.type==='frequency'?`<small>${q.rubrics[n]}</small>`:''}</button>`).join('')}</div>${q.type==='score'?`<div class="rubric">${a.score?q.rubrics[a.score]:'Selecciona una valoración para ver la rúbrica asociada.'}</div>`:''}${q.evidence?`<label class="field-label">Evidencia que respalda tu respuesta</label><textarea class="evidence" data-evidence="${i}" placeholder="Describe brevemente la evidencia...">${a.evidence||''}</textarea>`:''}</div></article>`}).join('');
  $$('.scale button',c).forEach(b=>b.addEventListener('click',()=>{const a=state.evalAnswers[key]||(state.evalAnswers[key]={});a[b.dataset.q]=a[b.dataset.q]||{};a[b.dataset.q].score=+b.dataset.value;saveState();renderEvaluationForm();}));
  $$('[data-evidence]',c).forEach(t=>t.addEventListener('input',e=>{const a=state.evalAnswers[key]||(state.evalAnswers[key]={});a[e.target.dataset.evidence]=a[e.target.dataset.evidence]||{};a[e.target.dataset.evidence].evidence=e.target.value;saveState();}));
  $$('[data-open]',c).forEach(t=>t.addEventListener('input',e=>{const a=state.evalAnswers[key]||(state.evalAnswers[key]={});a[e.target.dataset.open]=a[e.target.dataset.open]||{};a[e.target.dataset.open].text=e.target.value;saveState();updateEvalProgress();}));
  updateEvalProgress();
}
function updateEvalProgress(){
  const def=evaluationDef(),answers=state.evalAnswers[evalKey()]||{};const required=def.questions.filter(q=>q.type!=='open'||!q.optional);const done=def.questions.filter((q,i)=>q.type==='open'?(q.optional?true:!!answers[i]?.text?.trim()):!!answers[i]?.score).length;const reqDone=def.questions.filter((q,i)=>q.type==='open'?(q.optional?false:!!answers[i]?.text?.trim()):!!answers[i]?.score).length;const pct=Math.round(reqDone/required.length*100);$('#evalPercent').textContent=pct+'%';$('#evalCounter').textContent=`${reqDone} de ${required.length} requeridas`;$('#evalBar').style.width=pct+'%';
}
function submitEvaluation(){
  const def=evaluationDef(),answers=state.evalAnswers[evalKey()]||{};const missing=def.questions.some((q,i)=>q.optional?false:(q.type==='open'?!answers[i]?.text?.trim():!answers[i]?.score));if(missing){toast('Completa las preguntas requeridas antes de enviar.');return;}
  if(currentEval.type==='self')state.own.selfSubmitted=true;
  if(currentEval.type==='upward')state.own.upwardSubmitted=true;
  if(currentEval.type==='manager'){const m=member(currentEval.targetId);m.manager=true;if(!m.s1)m.s1={ana:93,diego:87,miguel:84}[m.id]||90;}
  saveState();$('#evalStatus').textContent='Enviada';$('#evalStatus').className='status-pill success';toast('Evaluación enviada correctamente');setTimeout(()=>{if(currentEval.type==='manager')navigate('teamMember');else navigate('evaluations')},500);
}

function renderTeam(){
  const q=($('#teamSearch')?.value||'').toLowerCase();const f=$('#teamStatusFilter')?.value||'all';
  const relevant=state.team.filter(m=>m.name.toLowerCase().includes(q)||m.role.toLowerCase().includes(q)).filter(m=>f==='all'||teamStatusKey(m)===f);
  $('#teamMetrics').innerHTML=`<article><span>${state.team.length}</span><p>Colaboradores</p></article><article><span>${state.team.filter(m=>m.start).length}</span><p>Arranques completados</p></article><article><span>${state.team.filter(m=>m.self&&m.upward&&!m.manager).length}</span><p>Listos para evaluar</p></article><article><span>${state.team.filter(m=>m.manager).length}</span><p>Evaluaciones completadas</p></article>`;
  $('#teamRows').innerHTML=relevant.map(m=>`<tr><td><strong>${m.name}</strong><small>${m.area}</small></td><td>${m.role}</td><td>${m.start?'Arranque ✓':'Arranque pendiente'}<small>${m.check1?'Check-in 1 ✓':'Check-in pendiente'}</small></td><td>${m.self?'Auto ✓':'Auto pendiente'}<small>${m.upward?'Eval. a jefe ✓':'Eval. a jefe pendiente'}</small></td><td>${nextAction(m)}</td><td class="team-status">${teamStatusPill(m)}</td><td><div class="table-actions"><button class="btn small secondary open-member" data-member="${m.id}">Ver proceso</button>${m.self&&m.upward&&!m.manager?`<button class="btn small primary quick-eval" data-member="${m.id}">Evaluar</button>`:''}</div></td></tr>`).join('');
  $$('.open-member').forEach(b=>b.addEventListener('click',()=>openMember(b.dataset.member)));
  $$('.quick-eval').forEach(b=>b.addEventListener('click',()=>{state.selectedMember=b.dataset.member;saveState();startEvaluation('manager',b.dataset.member)}));
}
function teamStatusKey(m){if(m.manager)return'complete';if(m.self&&m.upward)return'ready';return'blocked'}
function teamStatusPill(m){return m.manager?status('Completado','success'):(m.self&&m.upward?status('Listo para evaluar','success'):status('Pendiente colaborador','warning'))}
function nextAction(m){if(!m.start)return'Sesión de arranque';if(!m.check1)return'Check-in 1';if(!m.self||!m.upward)return'Esperar evaluaciones del colaborador';if(!m.manager)return'Evaluar colaborador';return'Ver resultados'}
function member(id){return state.team.find(x=>x.id===id)}
function openMember(id){state.selectedMember=id;saveState();renderTeamMember();navigate('teamMember')}

function renderTeamMember(){
  const m=member(state.selectedMember)||state.team[0];const canEvaluate=m.self&&m.upward&&!m.manager;
  $('#teamMemberContent').innerHTML=`<button class="link-btn back-team">← Volver a Mi equipo</button><div class="team-member-header"><div class="team-member-title"><div class="mini-avatar">${m.initials}</div><div><p class="eyebrow">Seguimiento del colaborador</p><h1>${m.name}</h1><p>${m.role} · ${m.area}</p></div></div><div class="member-actions">${!m.start?btn('Registrar sesión de arranque','primary','data-session-member="start"'):!m.check1?btn('Registrar check-in','primary','data-session-member="check1"'):canEvaluate?btn('Evaluar colaborador','primary','data-manager-eval="1"'):m.manager?btn('Ver resultados','primary','data-member-results="1"'):btn('Evaluación bloqueada','secondary','disabled')}</div></div>
  <div class="process-strip"><div class="process-chip ${m.start?'done':'current'}">1. Sesión de arranque<br><small>${m.start?'Completada':'Pendiente'}</small></div><div class="process-chip ${m.check1?'done':m.start?'current':'blocked'}">2. Check-in 1<br><small>${m.check1?'Completado':'Pendiente'}</small></div><div class="process-chip ${m.self&&m.upward?'done':m.check1?'current':'blocked'}">3. Evaluaciones colaborador<br><small>${m.self&&m.upward?'Completadas':'Pendientes'}</small></div><div class="process-chip ${m.manager?'done':canEvaluate?'current':'blocked'}">4. Evaluación jefe<br><small>${m.manager?'Completada':canEvaluate?'Disponible':'Bloqueada'}</small></div><div class="process-chip ${m.manager?'current':'blocked'}">5. Resultado<br><small>${m.manager?'Disponible':'No disponible'}</small></div></div>
  <div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Perfil y objetivos</h2><p>Contexto para conversaciones y evaluación.</p></div>${m.profile?status('Perfil disponible','success'):status('Sin perfil de cargo','warning')}</div><div class="read-only-block"><h4>${m.role}</h4><p>${m.profile?'Funciones y competencias disponibles desde el perfil institucional.':'RRHH debe gestionar este caso; el proceso puede continuar como excepción según la regla definida.'}</p></div><div class="mini-check"><span>Objetivos/KPIs definidos</span><strong>${m.kpis}</strong></div></section>
  <section class="panel"><div class="panel-heading"><div><h2>Sesiones</h2><p>Actas del recorrido.</p></div></div><div class="mini-checklist"><div class="mini-check"><span>Sesión de arranque</span>${m.start?'<button class="link-btn minute-member" data-type="Sesión de arranque">Ver acta</button>':status('Pendiente','warning')}</div><div class="mini-check"><span>Check-in 1</span>${m.check1?'<button class="link-btn minute-member" data-type="Check-in 1">Ver acta</button>':status('Pendiente','neutral')}</div></div></section></div>
  <div class="two-col" style="margin-top:18px"><section class="panel"><div class="panel-heading"><div><h2>Evaluaciones del colaborador</h2><p>El jefe puede revisar la autoevaluación, pero no la evaluación que el colaborador hizo sobre su jefatura.</p></div></div><div class="mini-checklist"><div class="mini-check"><span>Autoevaluación</span>${m.self?'<button class="link-btn view-self-member">Ver autoevaluación</button>':status('Pendiente','warning')}</div><div class="mini-check"><span>Evaluación a su jefe</span>${m.upward?status('Completada · contenido confidencial','success'):status('Pendiente','warning')}</div><div class="mini-check"><span>Evaluación jefe → colaborador</span>${m.manager?status('Completada','success'):(canEvaluate?'<button class="link-btn manager-eval-link">Completar ahora</button>':status('Bloqueada','neutral'))}</div></div>${!canEvaluate&&!m.manager?'<div class="lock-note">La evaluación del jefe se habilita cuando el colaborador haya completado tanto su autoevaluación como la evaluación a su jefe.</div>':''}</section>
  <section class="panel"><div class="panel-heading"><div><h2>Resultado del período</h2><p>El porcentaje se muestra únicamente después de completar la evaluación del jefe.</p></div></div>${m.manager?`<div class="score-card"><div class="score">${m.s1}<small>%</small></div><p>Resultado ilustrativo para visualizar el flujo. La fórmula definitiva de consolidación sigue pendiente de validación.</p><button class="btn secondary member-result-detail">Ver resumen</button></div>`:`<div class="result-lock"><div class="lock-icon">□</div><h3>Resultado aún no disponible</h3><p>Completa los pasos previos y la evaluación del jefe para habilitar el resultado.</p></div>`}</section></div>`;
  $$('.back-team').forEach(b=>b.addEventListener('click',()=>navigate('team')));
  $$('[data-session-member]').forEach(b=>b.addEventListener('click',()=>openSessionBuilder(b.dataset.sessionMember==='start'?'Sesión de arranque':'Check-in 1',m.id)));
  $$('[data-manager-eval],.manager-eval-link').forEach(b=>b.addEventListener('click',()=>startEvaluation('manager',m.id)));
  $$('.minute-member').forEach(b=>b.addEventListener('click',()=>viewMinute(null,m.id,b.dataset.type)));
  $$('.view-self-member').forEach(b=>b.addEventListener('click',()=>viewMemberSelfEvaluation(m)));
  $$('[data-member-results],.member-result-detail').forEach(b=>b.addEventListener('click',()=>viewMemberResult(m)));
}

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
  const sample=resultSamples[key]||resultSamples.own;const schemeKey=sample.serviceEligible?'service':'noService';const scheme=state.weightSchemes[schemeKey];
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
function detailedCalculationHtml(model){
  return `<section class="panel calculation-panel"><div class="panel-heading"><div><h2>Cómo se calcula el resultado</h2><p>La nota final /100 es la suma de los aportes ponderados de cada componente.</p></div><span class="status-pill neutral">${model.serviceEligible?'Con servicio':'Sin servicio'}</span></div>
  <div class="formula-strip"><div><span>Resultado final</span><strong>${model.overall.toFixed(1)}/100</strong></div><div class="formula-arrow">=</div>${model.components.map(c=>`<div><span>${c.label}</span><strong>${c.finalPoints.toFixed(1)} pts</strong><small>${c.score.toFixed(1)}/100 × ${c.weight}%</small></div>`).join('<div class="formula-plus">+</div>')}</div>
  <div class="table-panel component-table"><table><thead><tr><th>Componente</th><th>Nota componente</th><th>Peso general</th><th>Aporte a nota final</th></tr></thead><tbody>${componentSummaryRows(model)}</tbody><tfoot><tr><td colspan="2"><strong>Nota general</strong></td><td><strong>100%</strong></td><td><strong>${model.overall.toFixed(1)}/100</strong></td></tr></tfoot></table></div>
  <div class="info-callout"><strong>Detalle por pregunta:</strong> el puntaje 1–5 se visualiza también en equivalente /100. El peso de cada pregunta determina su aporte al componente y, junto con el peso general del componente, su aporte al resultado final.</div>
  <div class="component-details">${model.components.map(c=>`<details ${c.key==='manager'?'open':''}><summary><span>${c.label}</span><strong>${c.score.toFixed(1)}/100 · peso ${c.weight}%</strong></summary><div class="detail-inner">${questionDetailHtml(c)}</div></details>`).join('')}</div></section>`;
}
function resultSummaryHtml(model,label='Resultado disponible · S1'){
  return `<section class="panel score-card"><span class="metric-label">${label}</span><div class="score">${model.overall.toFixed(1)}<small>/100</small></div><p>${performanceLabel(model.overall)}</p><div class="score-breakdown">${model.components.map(c=>`<div class="score-row"><span>${c.label}<small>${c.weight}% del resultado</small></span><strong>${c.score.toFixed(1)}</strong></div>`).join('')}</div></section>`;
}
function viewMemberResult(m){
  const model=resultModel(m.id);openModal(`Resultado · ${m.name}`,`${detailedCalculationHtml(model)}<div class="info-callout"><strong>Lectura del período:</strong> la nota general aparece únicamente cuando la evaluación correspondiente está cerrada. La comparación anual de S1 y S2 permanece separada.</div>`,true);
}

function openSessionBuilder(type,targetId){
  const m=targetId?member(targetId):{name:'Ricardo García Ortiz',role:'Coordinador de Procesos y Automatización'};const isStart=type==='Sesión de arranque';
  const html=`<div class="meeting-builder"><div class="meeting-section"><h3>1. Contexto de la conversación</h3><div class="read-only-block"><h4>${m.name}</h4><p>${m.role} · Perfil de cargo ${targetId&&m.profile===false?'no disponible':'disponible para revisión'}.</p></div></div>${isStart?`<div class="meeting-section"><h3>2. Objetivos y KPIs construidos en conjunto</h3><p class="helper">El acta integra objetivo, indicador, línea base y meta.</p><div class="objective-edit"><input class="control" value="Objetivo 1"/><input class="control" value="Indicador"/><input class="control" value="Línea base"/><input class="control" value="Meta"/></div><div class="objective-edit"><input class="control" value="Objetivo 2"/><input class="control" value="Indicador"/><input class="control" value="Línea base"/><input class="control" value="Meta"/></div></div><div class="meeting-section"><h3>3. Observaciones generales</h3><textarea class="control" placeholder="Observaciones de la conversación..."></textarea></div>`:`<div class="meeting-section"><h3>2. Seguimiento de objetivos</h3><div class="goal-row"><div class="goal-top"><strong>Objetivo 1</strong><span>70%</span></div><input type="range" min="0" max="100" value="70" style="width:100%"></div><div class="goal-row"><div class="goal-top"><strong>Objetivo 2</strong><span>60%</span></div><input type="range" min="0" max="100" value="60" style="width:100%"></div></div><div class="meeting-section"><h3>3. Avances</h3><textarea class="control" placeholder="Principales avances desde la sesión anterior..."></textarea></div><div class="meeting-section"><h3>4. Obstáculos / ajustes</h3><textarea class="control" placeholder="Obstáculos y ajustes requeridos..."></textarea></div>`}<div class="meeting-section"><h3>${isStart?'4':'5'}. Acuerdos</h3><textarea class="control" placeholder="Acuerdos concretos..."></textarea></div><div class="meeting-section"><h3>${isStart?'5':'6'}. Próximos pasos</h3><textarea class="control" placeholder="Próximos pasos, responsables o fechas..."></textarea></div></div><div class="modal-actions"><button class="btn secondary" id="cancelSession">Cancelar</button><button class="btn primary" id="saveSession" data-session-type="${type}" data-session-target="${targetId||''}">Guardar acta</button></div>`;
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
  const s1=model.overall;
  const s2=model2.overall;
  const delta=s2-s1;
  return `<section class="panel annual-summary-panel result-comparison-unified">
    <div class="panel-heading"><div><p class="section-kicker">Resultados del ciclo</p><h2>Evaluación 1 vs Evaluación 2</h2><p>Una sola vista para comparar ambos períodos y entender qué compone cada resultado.</p></div><span class="delta-badge ${delta>=0?'positive':'negative'}">${delta>=0?'+':''}${delta.toFixed(1)} pts</span></div>
    <div class="evaluation-compare-grid">${evaluationPeriodCard(model,'Evaluación 1','Enero 2028')}<div class="evaluation-compare-arrow"><span>→</span><small>Evolución</small></div>${evaluationPeriodCard(model2,'Evaluación 2','Junio 2028')}</div>
    <div class="info-callout"><strong>Lectura anual:</strong> esta vista compara ambos períodos y muestra el detalle de cada nota. La fórmula para un eventual resultado anual consolidado permanece pendiente de definición por RRHH.</div>
  </section>
  <section class="panel result-plan-panel compact-result-plan"><div class="panel-heading"><div><h2>Plan del período</h2><p>Acciones acordadas después de la Evaluación 1 y revisadas en el siguiente check-in.</p></div>${status('En seguimiento','neutral')}</div><div class="plan-inline"><ul class="clean-list"><li>Fortalecer automatización de reportes recurrentes.</li><li>Completar capacitación en gestión de indicadores.</li><li>Revisar avance en el siguiente check-in.</li></ul><button class="btn secondary open-calculation">Ver cómo se calcula</button></div></section>
  <section class="panel talent-unified-panel">
    <div class="talent-header"><div class="talent-person"><div class="mini-avatar">RG</div><div><p class="section-kicker">Perfil de talento</p><h2>Mi recorrido de desempeño</h2><p>Ricardo García Ortiz · Coordinador de Procesos y Automatización · Mejoramiento Continuo</p></div></div>${status('Ciclo anual completo','success')}</div>
    <div class="summary-grid result-cycle-metrics"><div class="summary-box"><span class="label">Objetivos</span><strong>2</strong><small>KPIs del ciclo</small></div><div class="summary-box"><span class="label">Sesiones</span><strong>3</strong><small>Actas registradas</small></div><div class="summary-box"><span class="label">Resultado E1</span><strong>${s1.toFixed(1)}%</strong><small>Primer período</small></div><div class="summary-box"><span class="label">Resultado E2</span><strong>${s2.toFixed(1)}%</strong><small>Cierre del ciclo</small></div></div>
    <div class="timeline-vertical result-timeline">${resultTimelineItem('Agosto 2027','start','Sesión de arranque','Perfil revisado, objetivos/KPIs y acuerdos definidos.')}${resultTimelineItem('Octubre 2027','check1','Check-in 1','Avances, obstáculos y acuerdos documentados.')}${resultTimelineItem('Enero 2028','eval1',`Evaluación 1 · ${s1.toFixed(1)}/100`,'Resultado del primer período y plan de trabajo.')}${resultTimelineItem('Abril 2028','check2','Check-in 2','Seguimiento con referencia al resultado del primer período.')}${resultTimelineItem('Junio 2028','eval2',`Evaluación 2 · ${s2.toFixed(1)}/100`,'Cierre del ciclo y consolidación del perfil de talento.')}</div>
  </section>`;
}

function renderResults(){
  const c=$('#resultsContent');const model=resultModel('own');const model2=secondPeriodModel(model);
  c.innerHTML=`<div class="results-tabs"><button class="tab active" data-results-tab="myResult">Mi resultado</button><button class="tab" data-results-tab="calculation">Cómo se calcula</button></div>
  <div id="myResult" class="results-pane active">${unifiedResultHtml(model,model2)}</div>
  <div id="calculation" class="results-pane">${detailedCalculationHtml(model)}</div>`;
  $$('[data-results-tab]',c).forEach(b=>b.addEventListener('click',()=>{$$('[data-results-tab]',c).forEach(x=>x.classList.toggle('active',x===b));$$('.results-pane',c).forEach(x=>x.classList.toggle('active',x.id===b.dataset.resultsTab));}));
  $$('.open-calculation',c).forEach(b=>b.addEventListener('click',()=>{$('[data-results-tab="calculation"]',c).click()}));
  $$('.result-milestone',c).forEach(b=>b.addEventListener('click',()=>openResultMilestone(b.dataset.milestone,model,model2)));
}

function talentProfileHtml(name,initials,role,area,s1,s2){return `<section class="panel"><div class="talent-header"><div class="talent-person"><div class="mini-avatar">${initials}</div><div><p class="eyebrow">Perfil de talento del colaborador</p><h2 style="margin:0 0 4px">${name}</h2><p style="margin:0;color:#777">${role} · ${area}</p></div></div>${status('Ciclo anual completo','success')}</div><div class="summary-grid" style="margin:18px 0"><div class="summary-box"><span class="label">Evaluación 1</span><strong>${s1}%</strong><small>Resultado del período</small></div><div class="summary-box"><span class="label">Evaluación 2</span><strong>${s2}%</strong><small>Resultado del período</small></div><div class="summary-box"><span class="label">Objetivos</span><strong>2</strong><small>KPIs del ciclo</small></div><div class="summary-box"><span class="label">Sesiones</span><strong>3</strong><small>Actas registradas</small></div></div><div class="timeline-vertical"><div class="timeline-item"><div class="date">Agosto 2027</div><div class="vline"></div><div><h4>Sesión de arranque</h4><p>Perfil revisado, objetivos/KPIs y acuerdos definidos.</p></div></div><div class="timeline-item"><div class="date">Octubre 2027</div><div class="vline"></div><div><h4>Check-in 1</h4><p>Avances, obstáculos y acuerdos documentados.</p></div></div><div class="timeline-item"><div class="date">Enero 2028</div><div class="vline"></div><div><h4>Evaluación 1 · ${s1}%</h4><p>Resultado del primer período y plan de trabajo.</p></div></div><div class="timeline-item"><div class="date">Abril 2028</div><div class="vline"></div><div><h4>Check-in 2</h4><p>Seguimiento con referencia al resultado del primer período.</p></div></div><div class="timeline-item"><div class="date">Junio 2028</div><div class="vline"></div><div><h4>Evaluación 2 · ${s2}%</h4><p>Cierre anual y perfil de talento consolidado.</p></div></div></div></section>`}

function renderAdmin(){
  $('#campaignStatus').textContent=state.campaignStarted?'Activo':'Borrador';$('#campaignStatus').className=`status-pill ${state.campaignStarted?'success':'neutral'}`;
  const rows=(state.cycle==='annual'?annualSteps:pilotSteps).map(s=>`<tr><td><strong>${s.label}</strong></td><td><input class="control" value="${s.month}"/></td><td><input class="control" type="date"/></td><td><select class="control"><option>3 días antes</option><option>5 días antes</option><option>1 día antes</option><option>No enviar</option></select></td><td>RRHH</td></tr>`).join('');$('#scheduleRows').innerHTML=rows;
  renderNotificationRules();renderExceptions();renderQuestionAdmin();renderWeightSchemes();
}
function renderNotificationRules(){const rules=[['Inicio del ciclo','Jefes y colaboradores','Al activar el ciclo'],['Actividad pendiente','Persona responsable','Cada 5 días mientras esté pendiente'],['Próximo vencimiento','Persona responsable','3 días antes del cierre']];$('#notificationRules').innerHTML=rules.map((r,i)=>`<div class="rule-card"><div><h3>${r[0]}</h3><p>${r[1]} · ${r[2]}</p></div><label class="switch"><input type="checkbox" ${i<3?'checked':''}><span></span></label></div>`).join('')}
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
    const noSvc=questionFinalContribution(type,+q.weight||0,'noService');
    const withSvc=questionFinalContribution(type,+q.weight||0,'service');
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
function renderWeightSchemes(){
  $$('.component-weight').forEach(inp=>{const s=inp.dataset.scheme,c=inp.dataset.component;inp.value=state.weightSchemes[s][c];});
  ['noService','service'].forEach(key=>{const total=Object.values(state.weightSchemes[key]).reduce((a,v)=>a+(+v||0),0);const box=$(`[data-scheme-validation="${key}"]`);if(box){box.className=`scheme-validation ${total===100?'valid':'invalid'}`;box.innerHTML=`<strong>Total ${total}%</strong><span>${total===100?'Configuración válida':'Debe sumar 100%'}</span>`;}});
}

const committeePeople=[
  {id:'ricardo',name:'Ricardo García Ortiz',initials:'RG',role:'Coordinador de Procesos y Automatización',area:'Mejoramiento Continuo',s1:86,s2:92,sessions:3,start:true,check1:true,check2:true},
  {id:'ana',name:'Ana Torres',initials:'AT',role:'Analista de Procesos',area:'Mejoramiento Continuo',s1:84,s2:88,sessions:3,start:true,check1:true,check2:true},
  {id:'diego',name:'Diego Vega',initials:'DV',role:'Analista de Datos',area:'Mejoramiento Continuo',s1:88,s2:93,sessions:3,start:true,check1:true,check2:true},
  {id:'valeria',name:'Valeria Ruiz',initials:'VR',role:'Especialista de Proyectos',area:'Mejoramiento Continuo',s1:90,s2:95,sessions:3,start:true,check1:true,check2:true},
  {id:'carolina',name:'Carolina Paz',initials:'CP',role:'Asistente de Proyecto',area:'Proyectos',s1:95,s2:91,sessions:3,start:true,check1:true,check2:true},
  {id:'jose',name:'José Herrera',initials:'JH',role:'Coordinador de Proyectos',area:'Proyectos',s1:78,s2:82,sessions:3,start:true,check1:true,check2:true},
  {id:'camila',name:'Camila Salazar',initials:'CS',role:'Analista de Proyectos',area:'Proyectos',s1:93,s2:96,sessions:3,start:true,check1:true,check2:true},
  {id:'mateo',name:'Mateo Cevallos',initials:'MC',role:'Jefe de Proyectos',area:'Proyectos',s1:89,s2:90,sessions:3,start:true,check1:true,check2:true},
  {id:'miguel',name:'Miguel León',initials:'ML',role:'Coordinador de Datos',area:'Analítica',s1:80,s2:86,sessions:3,start:true,check1:true,check2:true},
  {id:'sofia',name:'Sofía Paredes',initials:'SP',role:'Analista de Inteligencia',area:'Analítica',s1:97,s2:98,sessions:3,start:true,check1:true,check2:true},
  {id:'andres',name:'Andrés Molina',initials:'AM',role:'Analista BI',area:'Analítica',s1:83,s2:79,sessions:3,start:true,check1:true,check2:true},
  {id:'elena',name:'Elena Cárdenas',initials:'EC',role:'Especialista de Datos',area:'Analítica',s1:91,s2:94,sessions:3,start:true,check1:true,check2:true}
];
function committeePerson(id){return committeePeople.find(x=>x.id===id)}
function committeeLatestScore(p){return Number.isFinite(+p.s2)?+p.s2:Number.isFinite(+p.s1)?+p.s1:null}
function committeeBand(score){if(score===null)return'pending';if(score>=97)return'outstanding';if(score>=92)return'optimal';if(score>=81)return'development';return'followup'}
function committeeBandLabel(score){if(score===null)return'Pendiente';if(score>=97)return'Sobresaliente';if(score>=92)return'Óptimo';if(score>=81)return'Buen desempeño / mejora';return'Seguimiento cercano'}
function committeeBandStatus(score){if(score===null)return'neutral';if(score>=92)return'success';if(score>=81)return'warning';return'danger'}
function committeeAreaStats(area){
  const rows=committeePeople.filter(p=>p.area===area),scores=rows.map(committeeLatestScore).filter(x=>x!==null);
  return {area,people:rows.length,avg:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0,top:scores.filter(x=>x>=92).length,follow:scores.filter(x=>x<81).length};
}
function committeeFilteredPeople(){
  const f=state.committeeFilters||defaultState.committeeFilters;let rows=[...committeePeople];
  if(f.area&&f.area!=='all')rows=rows.filter(p=>p.area===f.area);
  const q=(f.person||'').trim().toLowerCase();if(q)rows=rows.filter(p=>`${p.name} ${p.role} ${p.area}`.toLowerCase().includes(q));
  const min=f.minScore===''?null:+f.minScore,max=f.maxScore===''?null:+f.maxScore;
  rows=rows.filter(p=>{const s=committeeLatestScore(p);if(s===null)return min===null&&max===null;if(min!==null&&s<min)return false;if(max!==null&&s>max)return false;return true;});
  if(f.band&&f.band!=='all')rows=rows.filter(p=>committeeBand(committeeLatestScore(p))===f.band);
  rows.sort((a,b)=>{const sa=committeeLatestScore(a)??-1,sb=committeeLatestScore(b)??-1;if(f.sort==='scoreAsc')return sa-sb;if(f.sort==='name')return a.name.localeCompare(b.name,'es');if(f.sort==='area')return a.area.localeCompare(b.area,'es')||b.name.localeCompare(a.name,'es');return sb-sa;});
  return rows;
}
function renderCommittee(){
  const root=$('#committeeDashboard');if(!root)return;
  const f=state.committeeFilters||clone(defaultState.committeeFilters);state.committeeFilters=f;
  const filtered=committeeFilteredPeople(),scored=filtered.map(committeeLatestScore).filter(x=>x!==null),avg=scored.length?scored.reduce((a,b)=>a+b,0)/scored.length:0;
  const areas=[...new Set(committeePeople.map(p=>p.area))];
  const areaStats=areas.map(committeeAreaStats);
  root.innerHTML=`
    <div class="dashboard-hero page-heading"><div><p class="eyebrow">Comité de Talento</p><h1>Dashboard de resultados</h1><p class="lead">Analiza resultados por área o persona, filtra rangos de calificación y abre el recorrido de desempeño antes de registrar decisiones.</p></div>${status('Cierre anual','success')}</div>
    <section class="panel committee-filter-panel">
      <div class="panel-heading"><div><h2>Filtros de análisis</h2><p>El rango de calificación utiliza el último resultado disponible: Evaluación 2 cuando existe; de lo contrario, Evaluación 1.</p></div><button class="btn ghost small" id="committeeClearFilters">Limpiar filtros</button></div>
      <div class="committee-filter-grid">
        <label>Área<select id="committeeAreaFilter" class="control"><option value="all">Todas las áreas</option>${areas.map(a=>`<option value="${a}" ${f.area===a?'selected':''}>${a}</option>`).join('')}</select></label>
        <label>Persona<input id="committeePersonFilter" class="control" value="${escapeAttr(f.person||'')}" placeholder="Nombre, cargo o área"></label>
        <label>Calificación desde<input id="committeeMinScore" class="control" type="number" min="0" max="100" step="1" value="${f.minScore}" placeholder="0"></label>
        <label>Calificación hasta<input id="committeeMaxScore" class="control" type="number" min="0" max="100" step="1" value="${f.maxScore}" placeholder="100"></label>
        <label>Clasificación<select id="committeeBandFilter" class="control"><option value="all">Todas</option><option value="outstanding" ${f.band==='outstanding'?'selected':''}>97-100 · Sobresaliente</option><option value="optimal" ${f.band==='optimal'?'selected':''}>92-96 · Óptimo</option><option value="development" ${f.band==='development'?'selected':''}>81-91 · Oportunidades de mejora</option><option value="followup" ${f.band==='followup'?'selected':''}>&lt;81 · Seguimiento cercano</option></select></label>
        <label>Ordenar<select id="committeeSort" class="control"><option value="scoreDesc" ${f.sort==='scoreDesc'?'selected':''}>Mayor calificación</option><option value="scoreAsc" ${f.sort==='scoreAsc'?'selected':''}>Menor calificación</option><option value="name" ${f.sort==='name'?'selected':''}>Nombre</option><option value="area" ${f.sort==='area'?'selected':''}>Área</option></select></label>
      </div>
    </section>
    <div class="summary-grid committee-summary-grid">
      <div class="summary-box"><span class="label">Personas visibles</span><strong>${filtered.length}</strong><small>Según filtros aplicados</small></div>
      <div class="summary-box"><span class="label">Promedio visible</span><strong>${scored.length?avg.toFixed(1)+'%':'-'}</strong><small>Último resultado disponible</small></div>
      <div class="summary-box"><span class="label">≥ 92%</span><strong>${scored.filter(x=>x>=92).length}</strong><small>Candidatos a reconocimiento</small></div>
      <div class="summary-box"><span class="label">&lt; 81%</span><strong>${scored.filter(x=>x<81).length}</strong><small>Seguimiento cercano</small></div>
    </div>
    <section class="committee-area-section"><div class="section-heading-inline"><div><h2>Resumen por área</h2><p>Selecciona un área para aplicar el filtro y revisar sus personas.</p></div><span class="small-muted">${areas.length} áreas disponibles</span></div><div class="committee-area-grid">${areaStats.map(a=>`<button type="button" class="committee-area-card ${f.area===a.area?'active':''}" data-area="${a.area}"><span class="committee-area-name">${a.area}</span><strong>${a.avg.toFixed(1)}%</strong><small>${a.people} personas · ${a.top} ≥92% · ${a.follow} <81%</small><span class="committee-area-action">Ver resultados →</span></button>`).join('')}</div></section>
    <section class="panel table-panel committee-results-panel">
      <div class="committee-results-heading"><div><p class="section-kicker">Resultados filtrados</p><h2>${f.area&&f.area!=='all'?f.area:'Todas las áreas'}</h2><p>${filtered.length} persona${filtered.length===1?'':'s'} visible${filtered.length===1?'':'s'} · abre la ficha para consultar actas, evaluaciones y registrar decisiones.</p></div><span class="status-pill neutral">${filtered.length} resultados</span></div>
      ${filtered.length?`<table class="committee-results-table"><thead><tr><th>Persona</th><th>Área / cargo</th><th>Evaluación 1</th><th>Evaluación 2</th><th>Último resultado</th><th>Clasificación</th><th>Sesiones</th><th></th></tr></thead><tbody>${filtered.map(p=>{const latest=committeeLatestScore(p);return `<tr><td><strong>${p.name}</strong></td><td><strong>${p.area}</strong><small>${p.role}</small></td><td>${p.s1!=null?p.s1+'%':'-'}</td><td>${p.s2!=null?p.s2+'%':'-'}</td><td><strong class="committee-latest-score">${latest!=null?latest.toFixed(1)+'%':'-'}</strong>${p.s1!=null&&p.s2!=null?`<small class="${p.s2-p.s1>=0?'trend-up':'trend-down'}">${p.s2-p.s1>=0?'+':''}${(p.s2-p.s1).toFixed(1)} pts vs E1</small>`:''}</td><td>${status(committeeBandLabel(latest),committeeBandStatus(latest))}</td><td>${p.sessions||0}<small>actas / hitos</small></td><td><div class="table-actions"><button class="btn small secondary committee-profile" data-member="${p.id}">Ver ficha</button><button class="link-btn committee-quick-action" data-member="${p.id}">Plan de acción</button></div></td></tr>`}).join('')}</tbody></table>`:`<div class="empty-state"><strong>No hay resultados para los filtros seleccionados.</strong><p>Modifica el área, persona o rango de calificación para ampliar la búsqueda.</p></div>`}
    </section>`;
  const sync=(key,value)=>{state.committeeFilters[key]=value;saveState();renderCommittee();};
  $('#committeeAreaFilter')?.addEventListener('change',e=>sync('area',e.target.value));
  $('#committeePersonFilter')?.addEventListener('change',e=>sync('person',e.target.value));
  $('#committeePersonFilter')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sync('person',e.target.value);}});
  $('#committeeMinScore')?.addEventListener('change',e=>sync('minScore',e.target.value));
  $('#committeeMaxScore')?.addEventListener('change',e=>sync('maxScore',e.target.value));
  $('#committeeBandFilter')?.addEventListener('change',e=>sync('band',e.target.value));
  $('#committeeSort')?.addEventListener('change',e=>sync('sort',e.target.value));
  $('#committeeClearFilters')?.addEventListener('click',()=>{state.committeeFilters=clone(defaultState.committeeFilters);saveState();renderCommittee();toast('Filtros restablecidos');});
  $$('.committee-area-card',root).forEach(b=>b.addEventListener('click',()=>{state.committeeFilters.area=b.dataset.area;saveState();renderCommittee();setTimeout(()=>$('.committee-results-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),0);}));
  $$('.committee-profile',root).forEach(b=>b.addEventListener('click',()=>committeeProfile(committeePerson(b.dataset.member))));
  $$('.committee-quick-action',root).forEach(b=>b.addEventListener('click',()=>openCommitteeAction(committeePerson(b.dataset.member))));
}
function committeeProfile(m){
  const latest=committeeLatestScore(m);
  openModal(`Perfil de talento · ${m.name}`,`${talentProfileHtml(m.name,m.initials,m.role,m.area,m.s1||latest||88,m.s2||latest||90)}<div class="panel" style="margin-top:14px"><div class="panel-heading"><div><h2>Actas y decisiones</h2><p>El Comité puede consultar lo registrado en las sesiones antes de tomar una decisión.</p></div>${status(committeeBandLabel(latest),committeeBandStatus(latest))}</div><div class="mini-checklist"><div class="mini-check"><span>Sesión de arranque</span><button class="link-btn committee-minute" data-member="${m.id}" data-type="Sesión de arranque">Ver acta</button></div><div class="mini-check"><span>Check-in 1</span><button class="link-btn committee-minute" data-member="${m.id}" data-type="Check-in 1">Ver acta</button></div><div class="mini-check"><span>Evaluación 1</span><strong>${m.s1!=null?m.s1+'%':'-'}</strong></div><div class="mini-check"><span>Evaluación 2</span><strong>${m.s2!=null?m.s2+'%':'-'}</strong></div></div><div class="modal-actions"><button class="btn primary committee-action">Registrar plan de acción</button></div></div>`,true);
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
$('#roleSelect').value=state.role;$('#cycleSelect').value=state.cycle;
$('#roleSelect').addEventListener('change',e=>{state.role=e.target.value;state.page='dashboard';saveState();applyRole();toast('Vista cambiada')});
$('#cycleSelect').addEventListener('change',e=>{state.cycle=e.target.value;saveState();applyRole();toast('Escenario del ciclo actualizado')});
$('#notificationBtn').addEventListener('click',()=>$('#notificationPanel').classList.toggle('open'));
$('#markReadBtn').addEventListener('click',()=>{state.notificationsRead=true;saveState();renderNotifications();toast('Notificaciones marcadas como leídas')});
document.addEventListener('click',e=>{if(!e.target.closest('#notificationPanel')&&!e.target.closest('#notificationBtn'))$('#notificationPanel').classList.remove('open')});
$('#closeModal').addEventListener('click',closeModal);$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});
$('#resetDemo').addEventListener('click',()=>{localStorage.removeItem(STORAGE);state=clone(defaultState);$('#roleSelect').value=state.role;$('#cycleSelect').value=state.cycle;applyRole();toast('Demo restablecida')});
$('#addKpiBtn').addEventListener('click',()=>openModal('Agregar objetivo / KPI',`<div class="form-grid"><label class="wide">Objetivo<input id="mGoal" class="control" placeholder="Describe el objetivo"></label><label>Indicador<input id="mIndicator" class="control" placeholder="Indicador"></label><label>Meta<input id="mMeta" class="control" placeholder="Meta"></label><label>Línea base<input id="mBase" class="control" placeholder="Línea base"></label></div><div class="info-callout">En el proceso definitivo, los objetivos se construyen en conjunto durante la sesión de arranque.</div><div class="modal-actions"><button class="btn secondary" id="cancelKpi">Cancelar</button><button id="saveKpiModal" class="btn primary">Guardar</button></div>`));
$('#newSessionBtn').addEventListener('click',()=>openSessionBuilder('Check-in 2',null));
$('#saveEval').addEventListener('click',()=>{saveState();toast('Borrador guardado')});$('#submitEval').addEventListener('click',submitEvaluation);
$('#teamSearch').addEventListener('input',renderTeam);$('#teamStatusFilter').addEventListener('change',renderTeam);$('#teamNextAction').addEventListener('click',()=>{const m=state.team.find(x=>x.self&&x.upward&&!x.manager);if(m)openMember(m.id);else toast('No hay colaboradores listos para evaluar')});
$$('[data-admin-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-admin-tab]').forEach(x=>x.classList.toggle('active',x===b));$$('.admin-pane').forEach(x=>x.classList.toggle('active',x.id===b.dataset.adminTab));}));
$('#startCampaign').addEventListener('click',()=>{state.campaignStarted=true;state.notificationsRead=false;saveState();renderAdmin();renderNotifications();toast('Ciclo iniciado. Se generaron notificaciones para jefes y colaboradores.')});
$('#validateMatrix').addEventListener('click',()=>toast('Validación completada: revisar perfil faltante y reglas especiales antes de iniciar.'));
$('#adminCycleType').addEventListener('change',e=>{state.cycle=e.target.value;$('#cycleSelect').value=state.cycle;saveState();renderAdmin();toast('Calendario actualizado al tipo de ciclo')});
$('#questionTypeSelect')?.addEventListener('change',e=>{state.instrumentType=e.target.value;saveState();renderQuestionAdmin()});
$('#addQuestionBtn')?.addEventListener('click',()=>openQuestionEditor(state.instrumentType||'manager',null));
$$('.component-weight').forEach(x=>x.addEventListener('input',e=>{const scheme=e.target.dataset.scheme,component=e.target.dataset.component;state.weightSchemes[scheme][component]=+e.target.value||0;saveState();renderWeightSchemes();if(state.page==='results')renderResults()}));
$('#addExceptionBtn').addEventListener('click',()=>openModal('Nueva excepción de estructura',`<div class="form-grid"><label>Persona<input id="exPerson" class="control" placeholder="Buscar persona"></label><label>Jefe oficial<input id="exOfficial" class="control" placeholder="Jefe oficial"></label><label>Evaluador excepcional<input id="exNew" class="control" placeholder="Nuevo evaluador"></label><label>Vigencia<select id="exPeriod" class="control"><option>S1 2027</option><option>S2 2027</option><option>Todo el ciclo</option></select></label><label class="wide">Motivo<textarea id="exReason" class="control" placeholder="Motivo de la excepción"></textarea></label></div><div class="modal-actions"><button class="btn secondary" id="cancelEx">Cancelar</button><button class="btn primary" id="saveEx">Guardar excepción</button></div>`));
$('#addNotificationRule').addEventListener('click',()=>openModal('Nueva regla de notificación',`<div class="form-grid"><label>Evento<select class="control"><option>Inicio de actividad</option><option>Actividad pendiente</option><option>Próximo vencimiento</option></select></label><label>Destinatario<select class="control"><option>Responsable de la actividad</option><option>Jefe</option><option>Ambos</option></select></label><label>Frecuencia<select class="control"><option>Una vez</option><option>Cada 3 días</option><option>Cada 5 días</option></select></label><label>Canal<select class="control"><option>Notificación en plataforma</option><option>Correo + plataforma</option></select></label></div><div class="modal-actions"><button class="btn secondary" id="cancelRule">Cancelar</button><button class="btn primary" id="saveRule">Guardar regla</button></div>`));

document.addEventListener('click',e=>{
  if(e.target?.id==='cancelKpi'||e.target?.id==='cancelSession'||e.target?.id==='cancelEx'||e.target?.id==='cancelRule'||e.target?.id==='cancelAction'||e.target?.id==='cancelQuestion')closeModal();
  if(e.target?.id==='saveKpiModal'){state.kpis.push({id:Date.now(),title:$('#mGoal').value||'Nuevo objetivo',indicator:$('#mIndicator').value||'Por definir',meta:$('#mMeta').value||'Por definir',base:$('#mBase').value||'Por definir',progress:0});saveState();renderKpis();closeModal();toast('Objetivo agregado')}
  if(e.target?.id==='saveSession'){const target=e.target.dataset.sessionTarget,type=e.target.dataset.sessionType;if(target){const m=member(target);if(type==='Sesión de arranque'){m.start=true;m.kpis=Math.max(m.kpis,2)}else m.check1=true;}else{state.sessions.push({id:Date.now(),date:new Date().toLocaleDateString('es-EC'),type,summary:type==='Sesión de arranque'?'Perfil, objetivos/KPIs y acuerdos.':'Avances, obstáculos y acuerdos.',status:'Completada',participants:'Ricardo / María',agreements:['Acuerdo registrado desde el prototipo.'],next:['Próximo paso registrado desde el prototipo.']});}saveState();closeModal();toast('Acta guardada');if(target){renderTeamMember()}else renderSessions();}
  if(e.target?.id==='saveEx'){state.exceptions.push({person:$('#exPerson').value||'Persona',official:$('#exOfficial').value||'-',evaluation:$('#exNew').value||'-',reason:$('#exReason').value||'Excepción manual',period:$('#exPeriod').value});saveState();renderExceptions();closeModal();toast('Excepción agregada')}
  if(e.target?.id==='saveRule'){closeModal();toast('Regla agregada para fines del prototipo')}
  if(e.target?.id==='saveQuestion'){
    const type=e.target.dataset.questionType,idx=e.target.dataset.questionIndex,format=$('#qFormat').value;
    const q={type:format,title:$('#qTitle').value||'Pregunta',text:$('#qText').value||'Pregunta',weight:format==='open'?0:(+$('#qWeight').value||0),evidence:$('#qEvidence').checked,optional:$('#qOptional').checked,rubrics:format==='frequency'?{...defaultRubrics.frequency}:format==='score'?{...defaultRubrics.score}:undefined};
    if(idx==='new')state.questionConfig[type].push(q);else state.questionConfig[type][+idx]=q;
    saveState();closeModal();renderQuestionAdmin();toast('Pregunta guardada');
  }
  if(e.target?.id==='saveAction'){closeModal();toast('Plan de acción guardado y listo para comunicar al colaborador')}
});

applyRole();
