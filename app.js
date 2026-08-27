const $=(s,ctx=document)=>ctx.querySelector(s);
const $$=(s,ctx=document)=>[...ctx.querySelectorAll(s)];

const STORAGE='usfq-gd-v02-state';
const defaultState={
  role:'jefe',cycle:'annual',page:'dashboard',campaignStarted:false,selectedMember:'ana',selectedArea:'Mejoramiento Continuo',
  notificationsRead:false,
  own:{selfSubmitted:false,upwardSubmitted:false,lastResult:88},
  kpis:[
    {id:1,title:'Reducir tiempo de respuesta de solicitudes',meta:'24 horas',base:'48 horas',indicator:'Tiempo promedio de respuesta',progress:72},
    {id:2,title:'Digitalizar expedientes administrativos',meta:'100%',base:'35%',indicator:'Porcentaje de expedientes digitalizados',progress:64}
  ],
  sessions:[
    {id:1,date:'15/08/2027',type:'Sesión de arranque',summary:'Perfil, objetivos/KPIs, acuerdos y próximos pasos.',status:'Completada',participants:'Ricardo / María',general:'Se revisó el perfil de cargo y se acordaron prioridades del ciclo.',agreements:['Priorizar automatización de solicitudes repetitivas.','Medir semanalmente el tiempo promedio de respuesta.'],next:['Revisar primer avance en el check-in de octubre.']},
    {id:2,date:'18/10/2027',type:'Check-in 1',summary:'Avances, obstáculos y acuerdos.',status:'Completada',participants:'Ricardo / María',advances:'Se automatizó el primer grupo de solicitudes y mejoró el tiempo de respuesta.',obstacles:'Acceso parcial a datos históricos.',agreements:['Completar acceso a datos antes de noviembre.'],next:['Validar tendencia del indicador al cierre de diciembre.']}
  ],
  team:[
    {id:'ana',name:'Ana Torres',initials:'AT',role:'Analista de Procesos',area:'Mejoramiento Continuo',profile:true,start:true,check1:true,self:true,upward:true,manager:false,s1:null,s2:null,kpis:2,plan:'Pendiente'},
    {id:'diego',name:'Diego Vega',initials:'DV',role:'Analista de Datos',area:'Mejoramiento Continuo',profile:true,start:true,check1:true,self:true,upward:false,manager:false,s1:null,s2:null,kpis:2,plan:'Pendiente'},
    {id:'carolina',name:'Carolina Paz',initials:'CP',role:'Asistente de Proyecto',area:'Proyectos',profile:false,start:true,check1:true,self:true,upward:true,manager:true,s1:95,s2:91,kpis:2,plan:'En seguimiento'},
    {id:'miguel',name:'Miguel León',initials:'ML',role:'Coordinador de Datos',area:'Analítica',profile:true,start:false,check1:false,self:false,upward:false,manager:false,s1:null,s2:null,kpis:0,plan:'Pendiente'}
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
  if(r==='admin' && !['admin','dashboard'].includes(state.page)) state.page='admin';
  if(r==='comite' && !['committee','dashboard'].includes(state.page)) state.page='committee';
  if((r==='colaborador'||r==='jefe') && ['admin','committee'].includes(state.page)) state.page='dashboard';
  navigate(state.page||'dashboard');
}

function renderNotifications(){
  const common=state.campaignStarted?[{title:'Ciclo de desempeño iniciado',body:'Revisa tu próxima actividad y las fechas definidas por RRHH.',when:'Hoy'}]:[{title:'Próximo ciclo de desempeño',body:'RRHH publicará el calendario y activará el proceso.',when:'Próximamente'}];
  const byRole={
    colaborador:[{title:'Completa tus evaluaciones',body:'Autoevaluación y evaluación a tu jefe disponibles en la etapa de evaluación.',when:'Pendiente'},{title:'Revisa tus objetivos',body:'Tus KPIs acordados están disponibles para consulta.',when:'Activo'}],
    jefe:[{title:'Evalúa a tu equipo',body:'Ana Torres está lista para que completes su evaluación.',when:'Pendiente'},{title:'Actividad bloqueada',body:'Diego aún debe completar su evaluación al jefe.',when:'Seguimiento'}],
    admin:[{title:'Seguimiento de pendientes',body:'El sistema puede recordar automáticamente a quienes no completaron actividades.',when:'Configuración'},{title:'Validación de matriz',body:'Revisa perfiles y relaciones antes de iniciar el ciclo.',when:'Antes del inicio'}],
    comite:[{title:'Resultados disponibles',body:'Consulta el resumen por área y abre el perfil de talento de cada colaborador.',when:'Cierre'}]
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
    <div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Últimos acuerdos</h2><p>Check-in 1 · 18 octubre 2027</p></div>${status('Acta registrada','neutral')}</div><ul class="clean-list"><li>Completar acceso a datos históricos antes de noviembre.</li><li>Revisar tendencia del indicador al cierre de diciembre.</li></ul><button class="btn ghost" data-go="sessions">Abrir bitácora</button></section><section class="panel"><div class="panel-heading"><div><h2>${isBoss?'Estado de mi equipo':'Mis evaluaciones'}</h2><p>${isBoss?'Seguimiento de la etapa actual.':'Actividades que debes completar.'}</p></div></div>${isBoss?`<div class="mini-checklist"><div class="mini-check"><span>Ana Torres</span>${status('Lista para evaluar','success')}</div><div class="mini-check"><span>Diego Vega</span>${status('Pendiente colaborador','warning')}</div><div class="mini-check"><span>Carolina Paz</span>${status('Completada','success')}</div></div>`:`<div class="mini-checklist"><div class="mini-check"><span>Autoevaluación</span>${status(state.own.selfSubmitted?'Enviada':'Pendiente',state.own.selfSubmitted?'success':'warning')}</div><div class="mini-check"><span>Evaluación a mi jefe</span>${status(state.own.upwardSubmitted?'Enviada':'Pendiente',state.own.upwardSubmitted?'success':'warning')}</div></div>`}</section></div>`;
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
  if(targetId){const m=member(targetId); data={date:typeOverride==='Sesión de arranque'?'15/08/2027':'18/10/2027',type:typeOverride||'Check-in 1',participants:`${m.name} / Ricardo García`,general:'Se revisó el perfil del cargo y las prioridades del período.',advances:'Se reportaron avances en los objetivos acordados.',obstacles:'Se identificó una dependencia de información externa.',agreements:['Mantener seguimiento quincenal del indicador.','Priorizar las actividades acordadas.'],next:['Revisar resultados en la siguiente conversación.']};}
  else data=state.sessions.find(x=>x.id===sessionId);
  if(!data)return;
  openModal(`Acta · ${data.type}`,`<div class="minutes-card"><div class="minutes-cover"><h3>${data.type}</h3><div class="minutes-meta"><span><strong>Fecha:</strong> ${data.date}</span><span><strong>Participantes:</strong> ${data.participants}</span></div></div><div class="minutes-body">${data.type.includes('arranque')?`<div class="minutes-section"><h4>Revisión del perfil</h4><p>${data.general||'Perfil revisado conjuntamente.'}</p></div><div class="minutes-section"><h4>Objetivos / KPIs acordados</h4><ul><li>Objetivo 1 · indicador, línea base y meta definidos.</li><li>Objetivo 2 · indicador, línea base y meta definidos.</li></ul></div>`:`<div class="minutes-section"><h4>Avances</h4><p>${data.advances||'-'}</p></div><div class="minutes-section"><h4>Obstáculos</h4><p>${data.obstacles||'-'}</p></div>`}<div class="minutes-section"><h4>Acuerdos</h4><ul>${(data.agreements||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="minutes-section"><h4>Próximos pasos</h4><ul>${(data.next||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div></div></div>`,true);
}

const selfQuestions=[
  {type:'score',title:'Cumplimiento de funciones y objetivos',text:'¿En qué medida has cumplido tus funciones y objetivos?',evidence:true,rubrics:{1:'No cumplí responsabilidades u objetivos clave del período.',2:'Cumplí parcialmente; tuve retrasos, omisiones o brechas relevantes.',3:'Cumplí lo principal, aunque pude hacerlo mejor en algunos aspectos.',4:'Cumplí de forma consistente y con resultados sólidos.',5:'Superé ampliamente lo esperado, asumí retos adicionales y generé un impacto excepcional comprobable.'}},
  {type:'score',title:'Calidad',text:'¿Cómo calificarías la calidad de tu trabajo?',evidence:true,rubrics:{1:'Mi trabajo no alcanzó el estándar esperado.',2:'Mi trabajo presentó errores o reprocesos frecuentes.',3:'Mi trabajo fue adecuado, aunque requirió ajustes puntuales.',4:'Mi trabajo fue confiable, preciso y cumplió los estándares esperados.',5:'Entregué un trabajo excepcional, superior al estándar del rol y con valor agregado comprobable.'}},
  {type:'open',title:'Contribuciones y logros',text:'¿Cuáles fueron tus 3 contribuciones o logros más importantes durante el período?'},
  {type:'open',title:'Dificultades del período',text:'¿Qué funciones u objetivos te fueron más difíciles de cumplir y por qué?'}
];
const upwardNames=[['Claridad','¿Me comunica con claridad mis responsabilidades, prioridades y expectativas?'],['Propósito','¿Me ayuda a comprender cómo mi trabajo se conecta con los objetivos del área y de la USFQ?'],['Iniciativa','¿Impulsa mejoras en la forma de trabajar del área, promoviendo soluciones ante oportunidades o desafíos?'],['Reconocimiento','¿Reconoce de manera oportuna y genuina el trabajo bien hecho?'],['Feedback','¿Me brinda retroalimentación clara, respetuosa y útil para mejorar mi desempeño?'],['Fortalezas','¿Reconoce mis fortalezas y me ayuda a utilizarlas en responsabilidades o nuevos retos?'],['Apoyo','¿Me brinda herramientas que me permitan cumplir con mi trabajo?'],['Interés','¿Demuestra interés genuino por comprender mis necesidades, cargas o preocupaciones laborales?'],['Equipo','¿Fomenta un ambiente de respeto, confianza y colaboración en el equipo?'],['Desarrollo','¿Me brinda apoyo en mi aprendizaje y desarrollo?']];
const upwardQuestions=upwardNames.map(([title,text])=>({type:'frequency',title,text,rubrics:{1:'Nunca',2:'Ocasionalmente',3:'Regularmente',4:'Frecuentemente',5:'Siempre'}})).concat([{type:'open',optional:true,title:'Feedback adicional',text:'Si deseas, agrega un comentario adicional para aportar al desarrollo de tu jefe.'}]);
const managerNames=[
 ['Cumplimiento de funciones y objetivos','¿En qué medida ha cumplido sus funciones y objetivos?'],['Calidad','¿Cómo calificarías la calidad de su trabajo?'],['Orientación al servicio','¿Muestra interés genuino en comprender las necesidades y expectativas del cliente interno/externo?'],['Orientación al servicio','¿Mantiene una actitud positiva y amable en cada contacto con sus clientes?'],['Claridad','¿Comprende claramente las responsabilidades, prioridades y expectativas de su rol?'],['Iniciativa','¿Toma la delantera al detectar oportunidades o desafíos, proponiendo soluciones concretas?'],['Mejora continua','¿Implementa acciones concretas para mejorar las formas de trabajo existentes?'],['Compromiso institucional','¿Comprende las dinámicas de la universidad para alcanzar los resultados esperados?'],['Empatía','¿Comprende y apoya las necesidades de sus compañeros, fomentando respeto y colaboración?'],['Desarrollo','¿Muestra disposición para aprender, recibir retroalimentación y desarrollar nuevas capacidades?']
];
const managerQuestions=managerNames.map(([title,text],i)=> i<2 ? {type:'score',title,text,evidence:true,rubrics:(i===0 ? {1:'No cumplió la mayoría de funciones u objetivos esenciales.',2:'Cumplió de forma limitada; varias responsabilidades clave quedaron por debajo de lo esperado.',3:'Cumplió la mayoría, con algunos entregables incompletos o que requirieron seguimiento.',4:'Cumplió funciones y objetivos esenciales de forma consistente.',5:'Cumplió todas sus funciones y objetivos y generó resultados adicionales de impacto.'} : {1:'La calidad es insuficiente de manera recurrente.',2:'La calidad es irregular y genera errores o reprocesos frecuentes.',3:'La calidad es aceptable con correcciones ocasionales.',4:'Entrega trabajo confiable, preciso y conforme a procedimientos.',5:'Produce trabajo de alta calidad, con muy baja tasa de error.'})} : {type:'frequency',title,text,rubrics:{1:'Nunca',2:'Ocasionalmente',3:'Regularmente',4:'Frecuentemente',5:'Siempre'}});

function evaluationDef(){
  if(currentEval.type==='self')return {title:'Autoevaluación',lead:'Reflexiona sobre tu desempeño. Las dos preguntas abiertas corresponden a la definición más reciente de RRHH.',helper:'El puntaje 5 debe reservarse para un desempeño excepcional, sostenido y claramente superior a lo esperado.',questions:selfQuestions};
  if(currentEval.type==='upward')return {title:'Evaluación a mi jefe',lead:'Evalúa comportamientos de liderazgo. El jefe no tiene acceso a tus respuestas individuales desde su vista.',helper:'Escala: Nunca / Ocasionalmente / Regularmente / Frecuentemente / Siempre. El feedback adicional es opcional.',questions:upwardQuestions};
  const m=member(currentEval.targetId);return {title:`Evaluación de ${m?.name||'colaborador'}`,lead:'Revisa la autoevaluación como contexto y completa la evaluación jefe → supervisado.',helper:'Las preguntas 1 y 2 muestran rúbrica conductual y permiten registrar evidencia. El resultado se habilita al finalizar esta evaluación.',questions:managerQuestions};
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
  openModal(`Autoevaluación · ${m.name}`,`<div class="info-callout"><strong>Visible para la jefatura:</strong> la autoevaluación sirve como contexto antes de evaluar al colaborador.</div><div class="open-answers"><div class="open-answer"><strong>Cumplimiento de funciones y objetivos</strong><p>4 / 5 · “Cumplí de forma consistente y con resultados sólidos.”</p></div><div class="open-answer"><strong>Calidad</strong><p>4 / 5 · “Mi trabajo fue confiable, preciso y cumplió los estándares esperados.”</p></div><div class="open-answer"><strong>3 contribuciones o logros más importantes</strong><p>Automatización de un proceso, reducción de tiempos de atención y documentación de mejoras.</p></div><div class="open-answer"><strong>Funciones u objetivos más difíciles y por qué</strong><p>El acceso a información histórica dependió de terceros y retrasó parte del avance.</p></div></div>`);
}
function viewMemberResult(m){
  openModal(`Resultado · ${m.name}`,`<div class="comparison-grid"><div class="score-card"><span class="metric-label">Evaluación 1</span><div class="score">${m.s1||'-'}${m.s1?'<small>%</small>':''}</div></div><div class="score-card"><span class="metric-label">Evaluación 2</span><div class="score">${m.s2||'-'}${m.s2?'<small>%</small>':''}</div></div></div><div class="info-callout"><strong>Regla visual del prototipo:</strong> el porcentaje del período solo aparece después de que la jefatura completa su evaluación. La fórmula de consolidación anual continúa marcada para validación con RRHH.</div>`);
}

function openSessionBuilder(type,targetId){
  const m=targetId?member(targetId):{name:'Ricardo García Ortiz',role:'Coordinador de Procesos y Automatización'};const isStart=type==='Sesión de arranque';
  const html=`<div class="meeting-builder"><div class="meeting-section"><h3>1. Contexto de la conversación</h3><div class="read-only-block"><h4>${m.name}</h4><p>${m.role} · Perfil de cargo ${targetId&&m.profile===false?'no disponible':'disponible para revisión'}.</p></div></div>${isStart?`<div class="meeting-section"><h3>2. Objetivos y KPIs construidos en conjunto</h3><p class="helper">El acta integra objetivo, indicador, línea base y meta.</p><div class="objective-edit"><input class="control" value="Objetivo 1"/><input class="control" value="Indicador"/><input class="control" value="Línea base"/><input class="control" value="Meta"/></div><div class="objective-edit"><input class="control" value="Objetivo 2"/><input class="control" value="Indicador"/><input class="control" value="Línea base"/><input class="control" value="Meta"/></div></div><div class="meeting-section"><h3>3. Observaciones generales</h3><textarea class="control" placeholder="Observaciones de la conversación..."></textarea></div>`:`<div class="meeting-section"><h3>2. Seguimiento de objetivos</h3><div class="goal-row"><div class="goal-top"><strong>Objetivo 1</strong><span>70%</span></div><input type="range" min="0" max="100" value="70" style="width:100%"></div><div class="goal-row"><div class="goal-top"><strong>Objetivo 2</strong><span>60%</span></div><input type="range" min="0" max="100" value="60" style="width:100%"></div></div><div class="meeting-section"><h3>3. Avances</h3><textarea class="control" placeholder="Principales avances desde la sesión anterior..."></textarea></div><div class="meeting-section"><h3>4. Obstáculos / ajustes</h3><textarea class="control" placeholder="Obstáculos y ajustes requeridos..."></textarea></div>`}<div class="meeting-section"><h3>${isStart?'4':'5'}. Acuerdos</h3><textarea class="control" placeholder="Acuerdos concretos..."></textarea></div><div class="meeting-section"><h3>${isStart?'5':'6'}. Próximos pasos</h3><textarea class="control" placeholder="Próximos pasos, responsables o fechas..."></textarea></div></div><div class="modal-actions"><button class="btn secondary" id="cancelSession">Cancelar</button><button class="btn primary" id="saveSession" data-session-type="${type}" data-session-target="${targetId||''}">Guardar acta</button></div>`;
  openModal(`${type} · ${m.name}`,html,true);
}

function renderResults(){
  const c=$('#resultsContent');const isBoss=state.role==='jefe';
  c.innerHTML=`<div class="results-tabs"><button class="tab active" data-results-tab="myResult">Mi resultado</button><button class="tab" data-results-tab="annualCompare">Comparación anual</button><button class="tab" data-results-tab="talentProfile">Perfil de talento</button>${isBoss?'<button class="tab" data-results-tab="teamResults">Resultados de mi equipo</button>':''}</div>
  <div id="myResult" class="results-pane active"><div class="comparison-grid"><section class="panel score-card"><span class="metric-label">Resultado disponible · S1</span><div class="score">${state.own.lastResult}<small>%</small></div><p>Buen desempeño con oportunidades de mejora</p><div class="score-breakdown"><div class="score-row"><span>Autoevaluación</span><strong>90%</strong></div><div class="score-row"><span>Evaluación jefe</span><strong>87%</strong></div><div class="score-row"><span>Otros componentes</span><strong>Según configuración</strong></div></div></section><section class="panel"><div class="panel-heading"><div><h2>Plan del período</h2><p>Acciones acordadas después del resultado.</p></div></div><ul class="clean-list"><li>Fortalecer automatización de reportes recurrentes.</li><li>Completar capacitación en gestión de indicadores.</li><li>Revisar avance en el siguiente check-in.</li></ul></section></div></div>
  <div id="annualCompare" class="results-pane"><div class="panel"><div class="panel-heading"><div><h2>Comparación Evaluación 1 vs Evaluación 2</h2><p>Vista disponible al cierre anual para identificar evolución.</p></div></div><div class="compare-bars"><div class="compare-row"><strong>Evaluación 1</strong><div class="compare-track"><span style="width:88%"></span></div><strong>88%</strong></div><div class="compare-row"><strong>Evaluación 2</strong><div class="compare-track"><span style="width:92%"></span></div><strong>92%</strong></div></div><div class="info-callout"><strong>Resultado anual:</strong> la fórmula exacta para consolidar S1 y S2 permanece pendiente de definición por RRHH; esta vista compara los resultados sin asumir una fórmula.</div></div></div>
  <div id="talentProfile" class="results-pane">${talentProfileHtml('Ricardo García Ortiz','RG','Coordinador de Procesos y Automatización','Mejoramiento Continuo',88,92)}</div>
  ${isBoss?`<div id="teamResults" class="results-pane"><div class="panel table-panel"><table><thead><tr><th>Colaborador</th><th>Evaluación 1</th><th>Evaluación 2</th><th>Plan</th><th></th></tr></thead><tbody>${state.team.map(m=>`<tr><td><strong>${m.name}</strong><small>${m.role}</small></td><td>${m.s1?m.s1+'%':'Pendiente'}</td><td>${m.s2?m.s2+'%':'-'}</td><td>${m.plan}</td><td>${m.manager?`<button class="link-btn team-result-open" data-member="${m.id}">Ver resumen</button>`:'Resultado no disponible'}</td></tr>`).join('')}</tbody></table></div></div>`:''}`;
  $$('[data-results-tab]',c).forEach(b=>b.addEventListener('click',()=>{$$('[data-results-tab]',c).forEach(x=>x.classList.toggle('active',x===b));$$('.results-pane',c).forEach(x=>x.classList.toggle('active',x.id===b.dataset.resultsTab));}));
  $$('.team-result-open',c).forEach(b=>b.addEventListener('click',()=>viewMemberResult(member(b.dataset.member))));
}
function talentProfileHtml(name,initials,role,area,s1,s2){return `<section class="panel"><div class="talent-header"><div class="talent-person"><div class="mini-avatar">${initials}</div><div><p class="eyebrow">Perfil de talento del colaborador</p><h2 style="margin:0 0 4px">${name}</h2><p style="margin:0;color:#777">${role} · ${area}</p></div></div>${status('Ciclo anual completo','success')}</div><div class="summary-grid" style="margin:18px 0"><div class="summary-box"><span class="label">Evaluación 1</span><strong>${s1}%</strong><small>Resultado del período</small></div><div class="summary-box"><span class="label">Evaluación 2</span><strong>${s2}%</strong><small>Resultado del período</small></div><div class="summary-box"><span class="label">Objetivos</span><strong>2</strong><small>KPIs del ciclo</small></div><div class="summary-box"><span class="label">Sesiones</span><strong>3</strong><small>Actas registradas</small></div></div><div class="timeline-vertical"><div class="timeline-item"><div class="date">Agosto 2027</div><div class="vline"></div><div><h4>Sesión de arranque</h4><p>Perfil revisado, objetivos/KPIs y acuerdos definidos.</p></div></div><div class="timeline-item"><div class="date">Octubre 2027</div><div class="vline"></div><div><h4>Check-in 1</h4><p>Avances, obstáculos y acuerdos documentados.</p></div></div><div class="timeline-item"><div class="date">Enero 2028</div><div class="vline"></div><div><h4>Evaluación 1 · ${s1}%</h4><p>Resultado del primer período y plan de trabajo.</p></div></div><div class="timeline-item"><div class="date">Abril 2028</div><div class="vline"></div><div><h4>Check-in 2</h4><p>Seguimiento con referencia al resultado del primer período.</p></div></div><div class="timeline-item"><div class="date">Junio 2028</div><div class="vline"></div><div><h4>Evaluación 2 · ${s2}%</h4><p>Cierre anual y perfil de talento consolidado.</p></div></div></div></section>`}

function renderAdmin(){
  $('#campaignStatus').textContent=state.campaignStarted?'Activo':'Borrador';$('#campaignStatus').className=`status-pill ${state.campaignStarted?'success':'neutral'}`;
  const rows=(state.cycle==='annual'?annualSteps:pilotSteps).map(s=>`<tr><td><strong>${s.label}</strong></td><td><input class="control" value="${s.month}"/></td><td><input class="control" type="date"/></td><td><select class="control"><option>3 días antes</option><option>5 días antes</option><option>1 día antes</option><option>No enviar</option></select></td><td>RRHH</td></tr>`).join('');$('#scheduleRows').innerHTML=rows;
  renderNotificationRules();renderExceptions();validateWeights();
}
function renderNotificationRules(){const rules=[['Inicio del ciclo','Jefes y colaboradores','Al activar el ciclo'],['Actividad pendiente','Persona responsable','Cada 5 días mientras esté pendiente'],['Próximo vencimiento','Persona responsable','3 días antes del cierre']];$('#notificationRules').innerHTML=rules.map((r,i)=>`<div class="rule-card"><div><h3>${r[0]}</h3><p>${r[1]} · ${r[2]}</p></div><label class="switch"><input type="checkbox" ${i<3?'checked':''}><span></span></label></div>`).join('')}
function renderExceptions(){$('#exceptionRows').innerHTML=state.exceptions.map((x,i)=>`<tr><td>${x.person}</td><td>${x.official}</td><td>${x.evaluation}</td><td>${x.reason}</td><td>${x.period}</td><td><button class="link-btn">Editar</button></td></tr>`).join('')}
function validateWeights(){const inputs=$$('.weight-input');const total=inputs.reduce((s,x)=>s+(+x.value||0),0);const v=$('#weightValidation');if(!v)return;v.innerHTML=`<strong>Total:</strong> ${total}%. ${total===100?'Configuración válida.':'Las ponderaciones deben sumar 100%.'}`;v.style.borderLeftColor=total===100?'#177f5b':'#ba1f2d';}

const committeeAreas=[{name:'Mejoramiento Continuo',avg:91,people:3},{name:'Proyectos',avg:84,people:2},{name:'Analítica',avg:87,people:3}];
function renderCommittee(){
  $('#committeeAreaCards').innerHTML=committeeAreas.map(a=>`<article class="panel committee-area ${state.selectedArea===a.name?'active':''}" data-area="${a.name}"><h3>${a.name}</h3><p>${a.people} personas</p><div class="area-kpi">${a.avg}%</div><small>Promedio del área</small></article>`).join('');$$('.committee-area').forEach(a=>a.addEventListener('click',()=>{state.selectedArea=a.dataset.area;saveState();renderCommittee()}));
  const people=state.team.filter(m=>m.area===state.selectedArea);$('#committeeTeamPanel').innerHTML=`<div class="committee-detail-head"><div><h2 style="margin:0 0 4px">${state.selectedArea}</h2><p style="margin:0;color:#777">Jefatura y colaboradores · detalle del recorrido</p></div>${status(`${people.length} personas`,'neutral')}</div>${people.length?`<table><thead><tr><th>Persona</th><th>Rol</th><th>Sesiones</th><th>Evaluación 1</th><th>Evaluación 2</th><th></th></tr></thead><tbody>${people.map(m=>`<tr><td><strong>${m.name}</strong></td><td>${m.role}</td><td>${m.start?'Arranque ✓':'-'}<small>${m.check1?'Check-in ✓':'-'}</small></td><td>${m.s1?m.s1+'%':'Pendiente'}</td><td>${m.s2?m.s2+'%':'-'}</td><td><button class="btn small secondary committee-profile" data-member="${m.id}">Ver perfil</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty-state">No hay personas ficticias cargadas en esta área para la demostración.</div>'}`;$$('.committee-profile').forEach(b=>b.addEventListener('click',()=>committeeProfile(member(b.dataset.member))));
}
function committeeProfile(m){openModal(`Perfil de talento · ${m.name}`,`${talentProfileHtml(m.name,m.initials,m.role,m.area,m.s1||88,m.s2||m.s1||90)}<div class="panel" style="margin-top:14px"><div class="panel-heading"><div><h2>Actas y decisiones</h2><p>El Comité puede consultar lo registrado en las sesiones.</p></div></div><div class="mini-checklist"><div class="mini-check"><span>Sesión de arranque</span><button class="link-btn committee-minute" data-member="${m.id}" data-type="Sesión de arranque">Ver acta</button></div><div class="mini-check"><span>Check-in 1</span><button class="link-btn committee-minute" data-member="${m.id}" data-type="Check-in 1">Ver acta</button></div></div><div class="modal-actions"><button class="btn primary committee-action">Registrar plan de acción</button></div></div>`,true);$$('.committee-minute').forEach(b=>b.addEventListener('click',()=>viewMinute(null,b.dataset.member,b.dataset.type)));$('.committee-action')?.addEventListener('click',()=>openCommitteeAction(m));}
function openCommitteeAction(m){openModal(`Plan de acción · ${m.name}`,`<div class="form-grid"><label>Tipo de decisión<select class="control"><option>Plan de desarrollo</option><option>Reconocimiento</option><option>Seguimiento cercano</option><option>Otra acción</option></select></label><label>Fecha objetivo<input class="control" type="date"></label><label class="wide">Acción / decisión<textarea class="control" placeholder="Describe el plan de acción aprobado..."></textarea></label></div><div class="modal-actions"><button class="btn secondary" id="cancelAction">Cancelar</button><button class="btn primary" id="saveAction">Guardar y comunicar</button></div>`)}

function openModal(title,html,wide=false){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=`<div class="modal-body">${html}</div>`;$('#modal .modal-card').classList.toggle('wide',wide);$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false')}
function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');$('#modal .modal-card').classList.remove('wide')}

// Global events
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
$('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('collapsed'));
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
$$('.weight-input').forEach(x=>x.addEventListener('input',validateWeights));
$('#addExceptionBtn').addEventListener('click',()=>openModal('Nueva excepción de estructura',`<div class="form-grid"><label>Persona<input id="exPerson" class="control" placeholder="Buscar persona"></label><label>Jefe oficial<input id="exOfficial" class="control" placeholder="Jefe oficial"></label><label>Evaluador excepcional<input id="exNew" class="control" placeholder="Nuevo evaluador"></label><label>Vigencia<select id="exPeriod" class="control"><option>S1 2027</option><option>S2 2027</option><option>Todo el ciclo</option></select></label><label class="wide">Motivo<textarea id="exReason" class="control" placeholder="Motivo de la excepción"></textarea></label></div><div class="modal-actions"><button class="btn secondary" id="cancelEx">Cancelar</button><button class="btn primary" id="saveEx">Guardar excepción</button></div>`));
$('#addNotificationRule').addEventListener('click',()=>openModal('Nueva regla de notificación',`<div class="form-grid"><label>Evento<select class="control"><option>Inicio de actividad</option><option>Actividad pendiente</option><option>Próximo vencimiento</option></select></label><label>Destinatario<select class="control"><option>Responsable de la actividad</option><option>Jefe</option><option>Ambos</option></select></label><label>Frecuencia<select class="control"><option>Una vez</option><option>Cada 3 días</option><option>Cada 5 días</option></select></label><label>Canal<select class="control"><option>Notificación en plataforma</option><option>Correo + plataforma</option></select></label></div><div class="modal-actions"><button class="btn secondary" id="cancelRule">Cancelar</button><button class="btn primary" id="saveRule">Guardar regla</button></div>`));

document.addEventListener('click',e=>{
  if(e.target?.id==='cancelKpi'||e.target?.id==='cancelSession'||e.target?.id==='cancelEx'||e.target?.id==='cancelRule'||e.target?.id==='cancelAction')closeModal();
  if(e.target?.id==='saveKpiModal'){state.kpis.push({id:Date.now(),title:$('#mGoal').value||'Nuevo objetivo',indicator:$('#mIndicator').value||'Por definir',meta:$('#mMeta').value||'Por definir',base:$('#mBase').value||'Por definir',progress:0});saveState();renderKpis();closeModal();toast('Objetivo agregado')}
  if(e.target?.id==='saveSession'){const target=e.target.dataset.sessionTarget,type=e.target.dataset.sessionType;if(target){const m=member(target);if(type==='Sesión de arranque'){m.start=true;m.kpis=Math.max(m.kpis,2)}else m.check1=true;}else{state.sessions.push({id:Date.now(),date:new Date().toLocaleDateString('es-EC'),type,summary:type==='Sesión de arranque'?'Perfil, objetivos/KPIs y acuerdos.':'Avances, obstáculos y acuerdos.',status:'Completada',participants:'Ricardo / María',agreements:['Acuerdo registrado desde el prototipo.'],next:['Próximo paso registrado desde el prototipo.']});}saveState();closeModal();toast('Acta guardada');if(target){renderTeamMember()}else renderSessions();}
  if(e.target?.id==='saveEx'){state.exceptions.push({person:$('#exPerson').value||'Persona',official:$('#exOfficial').value||'-',evaluation:$('#exNew').value||'-',reason:$('#exReason').value||'Excepción manual',period:$('#exPeriod').value});saveState();renderExceptions();closeModal();toast('Excepción agregada')}
  if(e.target?.id==='saveRule'){closeModal();toast('Regla agregada para fines del prototipo')}
  if(e.target?.id==='saveAction'){closeModal();toast('Plan de acción guardado y listo para comunicar al colaborador')}
});

applyRole();
