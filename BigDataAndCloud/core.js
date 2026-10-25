
const $=s=>document.querySelector(s),J=a=>a.join(''),uid=()=>Math.random().toString(36).slice(2,9),today=()=>new Date().toISOString().slice(0,10);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const D=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],NIV=['CP','CE1','CE2','CM1','CM2'],KEY='ecole-abou-el-kacem-v1';
const ROLE={a:'Administrateur',t:'Enseignant',p:'Parent',s:'Élève',c:'Comptabilité'};
let DB,U=null,view='dash',post=null,tab='in',ec='',ed='';
const dt=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);

function seed(){const A='2026-2027',el=(i,p,n,c,pa,b)=>({id:'e'+i,prenom:p,nom:n,naissance:b,classe:c,parent:pa,tel:'20 123 45'+i,medical:'',entree:A,statut:'Inscrit'});
 const eleves=[el(1,'Yassine','Ben Salah','c1','Ben Salah','2020-03-14'),el(2,'Lina','Ben Salah','c3','Ben Salah','2018-06-02'),el(3,'Mehdi','Gharbi','c1','Gharbi','2020-09-21'),el(4,'Sarra','Gharbi','c2','Gharbi','2019-01-30'),el(5,'Adam','Jlassi','c2','Jlassi','2019-05-11'),el(6,'Nour','Jlassi','c3','Jlassi','2018-11-08')],notes=[];
 eleves.forEach((e,i)=>['m1','m2','m3','m4'].forEach((m,j)=>notes.push({id:uid(),eleve:e.id,matiere:m,eval:'Contrôle continu',valeur:10+((i*7+j*5)%9)+(j%2)/2,trim:'T1',annee:A})));
 const pay=(e,t,m)=>({id:uid(),eleve:e,type:t,montant:m,mode:'Espèces',date:today(),annee:A});
 return{annee:A,tarif:1000,
 classes:[{id:'c1',nom:'CP-A',niveau:'CP',capacite:25,titulaire:'t1',annee:A},{id:'c2',nom:'CE1-A',niveau:'CE1',capacite:25,titulaire:'t2',annee:A},{id:'c3',nom:'CE2-A',niveau:'CE2',capacite:24,titulaire:'t3',annee:A}],
 enseignants:[{id:'t1',prenom:'Sonia',nom:'Trabelsi',email:'s.trabelsi@ecole.tn'},{id:'t2',prenom:'Karim',nom:'Mansour',email:'k.mansour@ecole.tn'},{id:'t3',prenom:'Hela',nom:'Dridi',email:'h.dridi@ecole.tn'}],
 matieres:[{id:'m1',nom:'Arabe',coef:3,niveau:'Tous'},{id:'m2',nom:'Français',coef:3,niveau:'Tous'},{id:'m3',nom:'Mathématiques',coef:3,niveau:'Tous'},{id:'m4',nom:'Éveil scientifique',coef:2,niveau:'Tous'}],
 salles:[{id:'s1',nom:'Salle 1',capacite:25,dispo:'Oui'},{id:'s2',nom:'Salle 2',capacite:25,dispo:'Oui'},{id:'s3',nom:'Salle 3',capacite:24,dispo:'Oui'}],
 eleves,notes,
 creneaux:[{id:uid(),classe:'c1',jour:'Lundi',debut:'08:00',fin:'09:00',matiere:'m1',ens:'t1',salle:'s1'},{id:uid(),classe:'c1',jour:'Lundi',debut:'09:00',fin:'10:00',matiere:'m3',ens:'t1',salle:'s1'},{id:uid(),classe:'c2',jour:'Lundi',debut:'08:00',fin:'09:00',matiere:'m2',ens:'t2',salle:'s2'},{id:uid(),classe:'c3',jour:'Mardi',debut:'08:00',fin:'09:00',matiere:'m3',ens:'t3',salle:'s3'}],
 paiements:[pay('e1','Inscription',100),pay('e1','Scolarité T1',300),pay('e2','Inscription',100),pay('e3','Inscription',100),pay('e3','Scolarité T1',300),pay('e3','Scolarité T2',300),pay('e4','Inscription',100),pay('e5','Inscription',100),pay('e6','Inscription',100)],
 devoirs:[{id:'d1',titre:'Les lettres de l’alphabet',description:'Recopier la page 12 et illustrer trois lettres.',matiere:'m2',classe:'c1',remise:dt(7),bareme:20,correction:'',by:'t:t1'},{id:'d2',titre:'Additions jusqu’à 20',description:'Exercices 1 à 5 du cahier.',matiere:'m3',classe:'c1',remise:dt(-2),bareme:10,correction:'1) 7  2) 12  3) 15  4) 18  5) 20',by:'t:t1'}],
 depots:[],vus:[],messages:[],notifs:[],log:[],
 annonces:[{id:uid(),titre:'Rentrée scolaire 2026-2027',aud:'Tous',corps:'Les cours reprennent le lundi à 8 h. Merci de vérifier le dossier de votre enfant et de régler la première tranche avant la fin du mois.',date:today()}]}}
function load(){try{DB=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!DB)DB=seed()}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
function reset(){try{localStorage.removeItem(KEY)}catch(e){}DB=seed();toast('Données de démonstration réinitialisées');login()}

const get=(k,id)=>DB[k].find(r=>r.id===id),live=k=>DB[k].filter(r=>!r.del);
const nm=r=>r?(r.prenom?r.prenom+' '+r.nom:(r.nom||r.titre||'')):'—';
const F=(k,l,t='text',o=null,r=1)=>({k,l,t,o,r});
const pk=n=>'p:'+n,fam=eid=>['s:'+eid,pk(get('eleves',eid).parent)],cls=cid=>live('eleves').filter(e=>e.classe===cid).flatMap(e=>fam(e.id));
const solde=eid=>DB.tarif-live('paiements').filter(p=>p.eleve===eid).reduce((s,p)=>s+p.montant,0);
const dp=(d,e)=>DB.depots.find(p=>p.devoir===d&&p.eleve===e),fmt=v=>v==null?'—':(Math.round(v*100)/100).toFixed(2);
const lab=k=>{const[t,i]=k.split(':');return t==='a'?'Direction':t==='c'?'Comptabilité':t==='t'?nm(get('enseignants',i)):t==='s'?nm(get('eleves',i)):'Parent '+i};
const tc=cid=>[...new Set([get('classes',cid)?.titulaire,...live('creneaux').filter(x=>x.classe===cid).map(x=>x.ens)].filter(Boolean))];
function autoCl(d){const a=new Date().getFullYear()-new Date(d).getFullYear(),n=NIV[a-6];const c=live('classes').find(c=>c.niveau===n&&live('eleves').filter(e=>e.classe===c.id).length<c.capacite);return c?c.id:''}
const allKeys=a=>[...(a==='Tous'||a==='Parents'?live('eleves').map(e=>pk(e.parent)):[]),...(a==='Tous'||a==='Enseignants'?live('enseignants').map(t=>'t:'+t.id):[]),...(a==='Tous'||a==='Élèves'?live('eleves').map(e=>'s:'+e.id):[])];
function notify(ks,t){[...new Set(ks)].forEach(k=>DB.notifs.push({id:uid(),to:k,t,d:today(),r:0}))}
function log(a,k,o,n){DB.log.unshift({d:new Date().toLocaleString('fr-FR'),u:U?U.name:'Public',a,k,x:o&&n?Object.keys(n).filter(f=>o[f]!==n[f]).map(f=>f+' : '+o[f]+' → '+n[f]).join(' ; '):(nm(n)||n.id||'')});DB.log.length=Math.min(DB.log.length,200)}

const E={
 eleves:{t:'Élèves',s:'élève',f:[F('prenom','Prénom'),F('nom','Nom'),F('naissance','Date de naissance','date'),F('classe','Classe (vide = affectation automatique)','ref','classes',0),F('parent','Parent / tuteur'),F('tel','Téléphone','tel',null,0),F('medical','Antécédents médicaux','area',null,0),F('entree','Année d’entrée'),F('statut','Statut','sel',['Inscrit','En attente'])],cols:['nom','prenom','classe','parent','statut'],
  chk:(r,id)=>{if(!r.classe)r.classe=autoCl(r.naissance);const c=get('classes',r.classe);if(c&&live('eleves').filter(x=>x.classe===r.classe&&x.id!==id).length>=c.capacite)return 'Classe complète ('+c.capacite+' élèves maximum).'}},
 classes:{t:'Classes',s:'classe',f:[F('nom','Nom'),F('niveau','Niveau','sel',NIV),F('capacite','Capacité maximale','number'),F('titulaire','Enseignant titulaire','ref','enseignants',0),F('annee','Année scolaire')],cols:['nom','niveau','capacite','titulaire','annee'],
  g:r=>live('eleves').some(e=>e.classe===r.id)?'Impossible : des élèves sont affectés à cette classe. Réaffectez-les d’abord.':''},
 matieres:{t:'Matières',s:'matière',f:[F('nom','Nom'),F('coef','Coefficient','number'),F('niveau','Niveau','sel',['Tous',...NIV])],cols:['nom','coef','niveau'],
  g:r=>live('notes').some(n=>n.matiere===r.id)||live('creneaux').some(c=>c.matiere===r.id)?'Impossible : des notes ou des cours sont rattachés à cette matière.':''},
 enseignants:{t:'Enseignants',s:'enseignant',f:[F('prenom','Prénom'),F('nom','Nom'),F('email','E-mail','email')],cols:['nom','prenom','email'],
  g:r=>live('classes').some(c=>c.titulaire===r.id)||live('creneaux').some(c=>c.ens===r.id)?'Impossible : cet enseignant est affecté à une classe ou à un cours.':''},
 salles:{t:'Salles',s:'salle',f:[F('nom','Nom'),F('capacite','Capacité','number'),F('dispo','Disponible','sel',['Oui','Non'])],cols:['nom','capacite','dispo'],
  g:r=>live('creneaux').some(c=>c.salle===r.id)?'Impossible : cette salle est utilisée dans l’emploi du temps.':''},
 creneaux:{t:'Emploi du temps',s:'créneau',f:[F('classe','Classe','ref','classes'),F('jour','Jour','sel',D),F('debut','Début','time'),F('fin','Fin','time'),F('matiere','Matière','ref','matieres'),F('ens','Enseignant','ref','enseignants'),F('salle','Salle','ref','salles')],
  chk:(r,id)=>{if(r.debut>=r.fin)return 'L’heure de fin doit suivre l’heure de début.';const c=live('creneaux').find(x=>x.id!==id&&x.jour===r.jour&&x.debut<r.fin&&r.debut<x.fin&&(x.ens===r.ens||x.salle===r.salle||x.classe===r.classe));
   if(c)return 'Conflit : '+(c.ens===r.ens?'cet enseignant':c.salle===r.salle?'cette salle':'cette classe')+' est déjà occupé(e) de '+c.debut+' à '+c.fin+'.'}},
 notes:{t:'Notes',s:'note',f:[F('eleve','Élève','ref','eleves'),F('matiere','Matière','ref','matieres'),F('eval','Évaluation','sel',['Contrôle continu','Examen trimestriel']),F('valeur','Note /20','number'),F('trim','Trimestre','sel',['T1','T2','T3']),F('annee','Année scolaire')],cols:['eleve','matiere','eval','valeur','trim'],
  chk:r=>r.valeur<0||r.valeur>20?'La note doit être comprise entre 0 et 20.':'',after:n=>notify(fam(n.eleve),'Nouvelle note en '+nm(get('matieres',n.matiere))+' : '+n.valeur+'/20')},
 paiements:{t:'Paiements',s:'paiement',f:[F('eleve','Élève','ref','eleves'),F('type','Objet','sel',['Inscription','Scolarité T1','Scolarité T2','Scolarité T3']),F('montant','Montant (TND)','number'),F('mode','Mode','sel',['Espèces','Virement','Mobile money']),F('date','Date','date'),F('annee','Année scolaire')],cols:['eleve','type','montant','mode','date'],
  chk:r=>r.montant>0?'':'Le montant doit être positif.',x:r=>`<button class="btn sm" onclick="recu('${r.id}')">Reçu</button>`,
  after:p=>{const e=get('eleves',p.eleve);sendSys(pk(e.parent),'Paiement reçu – '+nm(e),`Montant payé : ${p.montant} TND\nDate : ${p.date} · Mode : ${p.mode}\nNouveau solde restant : ${solde(e.id)} TND`,p.id)},top:()=>soldes()},
 devoirs:{t:'Devoirs',s:'devoir',f:[F('titre','Titre'),F('description','Description','area'),F('matiere','Matière','ref','matieres'),F('classe','Classe','ref','classes'),F('remise','Date de remise','date'),F('bareme','Barème (points)','number'),F('correction','Correction (visible après la date de remise)','area',null,0)],cols:['titre','matiere','classe','remise'],
  w:r=>DB.depots.some(d=>d.devoir===r.id)?'Des élèves ont déjà déposé leur travail. ':'',after:d=>notify(cls(d.classe),'Nouveau devoir : '+d.titre),x:r=>devX(r)},
 annonces:{t:'Annonces',s:'annonce',f:[F('titre','Titre'),F('aud','Public concerné','sel',['Tous','Parents','Enseignants','Élèves']),F('corps','Message','area')],after:a=>notify(allKeys(a.aud),'Annonce : '+a.titre)}};
const W={a:['eleves','classes','matieres','enseignants','salles','creneaux','notes','paiements','devoirs','annonces'],c:['eleves','paiements'],t:['notes','devoirs','creneaux'],p:[],s:[]};
const can=k=>W[U.role].includes(k);
const NAV=[['dash','Tableau de bord','atpsc'],['eleves','Élèves','ac'],['classes','Classes','a'],['matieres','Matières','a'],['enseignants','Enseignants','a'],['salles','Salles','a'],['edt','Emploi du temps','atps'],['notes','Notes et bulletins','atp'],['paiements','Paiements','acp'],['devoirs','Devoirs','atps'],['msg','Messagerie','atpsc'],['annonces','Annonces','atpsc'],['journal','Journal','a']];
const mine=()=>U.role==='p'?live('eleves').filter(e=>e.parent===U.name):U.role==='s'?[get('eleves',U.eid)]:null;
function rows(k){const r=live(k),m=mine();if(!m)return r;const ids=m.map(e=>e.id),cl=m.map(e=>e.classe);
 return k==='eleves'?r.filter(x=>ids.includes(x.id)):k==='notes'||k==='paiements'?r.filter(x=>ids.includes(x.eleve)):k==='devoirs'||k==='creneaux'?r.filter(x=>cl.includes(x.classe)):r}

/* ---------- generic CRUD ---------- */
function put(k,rec,id){const e=E[k];const err=e.chk&&e.chk(rec,id);if(err)return err;
 if(id){const o=get(k,id);log('Modification',k,o,rec);Object.assign(o,rec)}else{rec.id=uid();rec.date=rec.date||today();rec.by=U?U.key:'public';DB[k].push(rec);log('Création',k,null,rec);e.after&&e.after(rec)}persist();return ''}
const fl=(k,c)=>E[k].f.find(f=>f.k===c),def=f=>f.k==='bareme'?20:f.k==='annee'||f.k==='entree'?DB.annee:f.t==='date'?today():'';
const cell=(f,r)=>f.t==='ref'?esc(nm(get(f.o,r[f.k]))):f.k==='montant'?r[f.k]+' TND':f.t==='area'?esc(String(r[f.k]||'').slice(0,60)):esc(r[f.k]);
function fld(f,v){const n=`name=${f.k} ${f.r?'required':''}`;let i;
 if(f.t==='sel')i=`<select ${n}>${J(f.o.map(x=>`<option ${x==v?'selected':''}>${x}</option>`))}</select>`;
 else if(f.t==='ref')i=`<select ${n}><option value="">—</option>${J(live(f.o).map(x=>`<option value=${x.id} ${x.id===v?'selected':''}>${esc(nm(x))}</option>`))}</select>`;
 else if(f.t==='area')i=`<textarea ${n} rows=3>${esc(v)}</textarea>`;
 else i=`<input ${n} type=${f.t} value="${esc(v)}" ${f.t==='number'?'step=any':''}>`;
 return `<label>${f.l}${i}</label>`}
function form(k,id,keys){const e=E[k],o=id?get(k,id):{};
 modal(`<h2>${k==='annonces'?'Publier une annonce':(id?'Modifier : ':'Ajouter : ')+e.s}</h2><form onsubmit="return sub(event,'${k}','${id||''}',${!!keys})">${J(e.f.filter(f=>!keys||keys.includes(f.k)).map(f=>fld(f,o[f.k]??def(f))))}<p class=err id=err></p><div class=act><button type=button class=btn onclick=closeM()>Annuler</button><button class="btn pri">${k==='annonces'?'Publier':'Enregistrer'}</button></div></form>`)}
function sub(ev,k,id,pub){ev.preventDefault();const fd=new FormData(ev.target),rec={};
 E[k].f.filter(f=>fd.has(f.k)).forEach(f=>{const v=fd.get(f.k);rec[f.k]=f.t==='number'?parseFloat(v):v});
 if(pub){rec.statut='En attente';rec.entree=DB.annee}
 const err=put(k,rec,id);if(err){$('#err').textContent=err;return false}closeM();toast(pub?'Pré-inscription envoyée à l’administration':id?'Modifié':k==='annonces'?'Publié':'Ajouté');go();return false}
function del(k,id){const r=get(k,id),e=E[k],g=e.g&&e.g(r);if(g)return toast(g,1);
 ask(`${e.w?e.w(r):''}Supprimer cet enregistrement (${e.s}) ? Il sera archivé (suppression logique) et restera tracé dans le journal.`,()=>{r.del=1;log('Suppression',k,null,r);persist();go()})}
function tbl(k){const e=E[k],w=can(k);return `<div class=ha style="margin-bottom:.6rem"><input placeholder="Rechercher" aria-label="Rechercher" oninput=flt(this)>${w?`<button class="btn pri" onclick="form('${k}')">Ajouter</button>`:''}</div>${e.top?e.top():''}<div class=tw><table><thead><tr>${J(e.cols.map(c=>`<th>${fl(k,c).l.split(' (')[0]}</th>`))}${e.x?'<th></th>':''}${w?'<th></th>':''}</tr></thead><tbody id=tb>${J(rows(k).map(r=>`<tr>${J(e.cols.map(c=>`<td>${cell(fl(k,c),r)}</td>`))}${e.x?`<td>${e.x(r)}</td>`:''}${w?`<td class=ra><button class="btn sm" onclick="form('${k}','${r.id}')">Modifier</button> <button class="btn sm danger" onclick="del('${k}','${r.id}')">Supprimer</button></td>`:''}</tr>`))}</tbody></table>${rows(k).length?'':'<p class=empty>Aucun enregistrement pour le moment.</p>'}</div>`}
const head=(t,a='')=>`<div class=hd><h1>${t}</h1><div class=ha>${a}</div></div>`,ent=k=>head(E[k].t)+tbl(k);
function flt(i){const q=i.value.toLowerCase();document.querySelectorAll('#tb tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))}

/* ---------- ui helpers ---------- */
function modal(h){$('#modal').innerHTML=`<div class=ov onclick="if(event.target===this)closeM()"><div class=md role=dialog aria-modal=true>${h}</div></div>`}
function closeM(){$('#modal').innerHTML=''}
function ask(m,cb){window._cb=cb;modal(`<p>${m}</p><div class=act><button class=btn onclick=closeM()>Annuler</button><button class="btn pri" onclick="closeM();_cb()">Confirmer</button></div>`)}
let tt;function toast(m,bad){const t=$('#toast');t.textContent=m;t.className=bad?'bad':'';t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',3500)}

/* ---------- finance ---------- */
function soldes(){const r=rows('eleves');return `<div class=card><h3>Soldes ${DB.annee} <small class=note>Tarif annuel : ${DB.tarif} TND (inscription + 3 tranches)</small> ${can('paiements')?'<button class="btn sm" onclick=tarif()>Modifier la grille</button>':''}</h3><div class=tw style="border:0"><table><tr><th>Élève<th>Payé<th>Solde<th>Statut<th></tr>${J(r.map(e=>{const s=solde(e.id);return `<tr><td>${esc(nm(e))}<td>${DB.tarif-s} TND<td>${s} TND<td><span class="tag ${s>0?'bad':''}">${s>0?'Impayé':'À jour'}</span><td>${s>0&&can('paiements')?`<button class="btn sm" onclick="rel('${e.id}')">Relancer</button>`:''}`}))}</table></div></div>`}
function tarif(){modal(`<h2>Grille tarifaire ${DB.annee}</h2><label>Montant annuel par élève (TND)<input id=tf type=number min=0 value=${DB.tarif}></label><div class=act><button class=btn onclick=closeM()>Annuler</button><button class="btn pri" onclick="setTarif()">Enregistrer</button></div>`)}
function setTarif(){const v=+$('#tf').value;log('Modification','tarif',{montant:DB.tarif},{montant:v});DB.tarif=v;persist();closeM();go()}
function rel(eid){const e=get('eleves',eid);sendSys(pk(e.parent),'Rappel de paiement – '+nm(e),`Solde restant à régler : ${solde(eid)} TND. Merci de vous rapprocher du secrétariat.`);persist();toast('Relance envoyée au parent')}
function recu(id){const p=get('paiements',id),e=get('eleves',p.eleve);modal(`<h2>Reçu n° ${id.toUpperCase()}</h2><p>École Abou el Kacem Chebbi · année ${p.annee}</p><table><tr><th>Élève<td>${esc(nm(e))}<tr><th>Objet<td>${p.type}<tr><th>Montant<td>${p.montant} TND<tr><th>Date et mode<td>${p.date} · ${p.mode}<tr><th>Solde restant<td>${solde(e.id)} TND</table><div class=act><button class=btn onclick=closeM()>Fermer</button><button class="btn pri" onclick="print()">Imprimer / PDF</button></div>`)}

/* ---------- notes ---------- */
function avg(eid,t){const by={};live('notes').filter(n=>n.eleve===eid&&(!t||n.trim===t)).forEach(n=>(by[n.matiere]=by[n.matiere]||[]).push(n.valeur));let s=0,c=0;
 const rows=Object.entries(by).map(([m,v])=>{const a=v.reduce((x,y)=>x+y,0)/v.length,co=get('matieres',m)?.coef||1;s+=a*co;c+=co;return{m,a,co}});return{rows,g:c?s/c:null}}
function bulHtml(e,t){const a=avg(e.id,t);return `<h3>Bulletin ${t||'annuel'} · ${esc(nm(e))}</h3><p>Classe ${esc(nm(get('classes',e.classe)))} · ${DB.annee}</p><div class=tw><table><tr><th>Matière<th>Coef.<th>Moyenne /20</tr>${J(a.rows.map(r=>`<tr><td>${esc(nm(get('matieres',r.m)))}<td>${r.co}<td>${fmt(r.a)}`))}<tr><th>Moyenne générale<th><th>${fmt(a.g)}</tr></table></div>`}
function bul(){const e=get('eleves',$('#be').value);$('#bul').innerHTML=e?bulHtml(e,$('#bt').value):'<p class=empty>Aucun élève.</p>'}
function bulPrint(){const e=get('eleves',$('#be').value);if(e)modal(bulHtml(e,$('#bt').value)+'<div class=act><button class=btn onclick=closeM()>Fermer</button><button class="btn pri" onclick="print()">Imprimer / PDF</button></div>')}

/* ---------- homework ---------- */
function devX(r){const R=U.role;if(R==='a'||R==='t')return `<button class="btn sm" onclick="deps('${r.id}')">Dépôts (${DB.depots.filter(d=>d.devoir===r.id).length})</button>`;
 return J((mine()||[]).filter(e=>e.classe===r.classe).map(e=>{const d=dp(r.id,e.id),st=d?(d.date>r.remise?'En retard':'Rendu'):(today()>r.remise?'Non rendu':'À rendre'),n=d&&d.note!=null;
  return `<div class=kid>${R==='p'?esc(e.prenom)+' : ':''}<span class="tag ${st==='Non rendu'?'bad':''}">${n?'Noté':st}</span>${n?` ${d.note}/${r.bareme}${d.comm?' – '+esc(d.comm):''}`:''} ${R==='s'&&today()<=r.remise?`<button class="btn sm" onclick="depot('${r.id}','${e.id}')">${d?'Remplacer':'Déposer'}</button>`:''}${r.correction&&today()>r.remise?` <button class="btn sm" onclick="corr('${r.id}')">Correction</button>`:''}${R==='p'?` <button class="btn sm" onclick="vu('${r.id}','${e.id}')">${DB.vus.includes(r.id+e.id)?'Vu ✓':'Marquer comme vu'}</button>`:''}</div>`}))}
function vu(d,e){const k=d+e,i=DB.vus.indexOf(k);i<0?DB.vus.push(k):DB.vus.splice(i,1);persist();go()}
function corr(id){const d=get('devoirs',id);modal(`<h2>Correction · ${esc(d.titre)}</h2><p style="white-space:pre-wrap">${esc(d.correction)}</p><div class=act><button class="btn pri" onclick=closeM()>Fermer</button></div>`)}
function depot(did,eid){modal(`<h2>Déposer mon travail</h2><label>Fichiers (PDF, images, documents)<input id=df type=file multiple></label><p class=err id=err></p><div class=act><button class=btn onclick=closeM()>Annuler</button><button class="btn pri" onclick="dsub('${did}','${eid}')">Envoyer</button></div>`)}
function dsub(did,eid){const f=[...$('#df').files].map(x=>x.name).join(', '),d=get('devoirs',did);if(!f)return $('#err').textContent='Sélectionnez au moins un fichier.';
 const p=dp(did,eid);if(p){p.fichiers=f;p.date=today();p.note=null}else DB.depots.push({id:uid(),devoir:did,eleve:eid,fichiers:f,date:today(),note:null});
 notify([d.by],nm(get('eleves',eid))+' a déposé son travail : '+d.titre);log('Dépôt','devoirs',null,{titre:d.titre+' – '+f});persist();closeM();toast('Travail déposé');go()}
function deps(did){const d=get('devoirs',did);modal(`<h2>Dépôts · ${esc(d.titre)}</h2><div class=tw><table><tr><th>Élève<th>Statut<th>Fichiers<th>Note /${d.bareme}<th>Commentaire<th></tr>${J(live('eleves').filter(e=>e.classe===d.classe).map(e=>{const p=dp(did,e.id);return `<tr><td>${esc(nm(e))}<td>${p?(p.date>d.remise?'En retard':'Rendu'):'Non rendu'}<td>${p?esc(p.fichiers):'—'}<td><input id=n_${e.id} type=number min=0 max=${d.bareme} step=any value="${p&&p.note!=null?p.note:''}" style="width:5rem"><td><input id=c_${e.id} value="${esc(p?.comm||'')}"><td><button class="btn sm" onclick="grade('${did}','${e.id}')">Publier</button>`}))}</table></div><div class=act><button class="btn pri" onclick="closeM();go()">Fermer</button></div>`)}
function grade(did,eid){const p=dp(did,eid),d=get('devoirs',did);if(!p)return toast('Aucun dépôt à noter pour cet élève.',1);const v=parseFloat($('#n_'+eid).value);
 if(isNaN(v)||v<0||v>d.bareme)return toast('La note doit être comprise entre 0 et '+d.bareme+'.',1);p.note=v;p.comm=$('#c_'+eid).value;
 notify(fam(eid),'Note publiée pour « '+d.titre+' » : '+v+'/'+d.bareme);log('Notation','devoirs',null,{titre:d.titre+' – '+nm(get('eleves',eid))});persist();toast('Note publiée')}

/* ---------- messaging ---------- */
function sendSys(to,objet,corps,recu){DB.messages.push({id:uid(),from:'c:',to,objet,corps,recu,date:today(),draft:0,lu:0,hide:[]});log('Message automatique','messages',null,{titre:objet+' → '+lab(to)+' (envoyé)'});notify([to],'Nouveau message : '+objet)}
function contacts(){const r=U.role,pars=[...new Set(live('eleves').map(e=>e.parent))].map(p=>[pk(p),'Parent '+p]);
 if(r==='a')return [...pars,...live('eleves').map(e=>['s:'+e.id,'Élève '+nm(e)])];
 if(r==='c')return pars;if(r==='s')return [['a:','Direction']];
 if(r==='t'){const cl=live('classes').filter(c=>tc(c.id).includes(U.id)).map(c=>c.id);return [...new Set(live('eleves').filter(e=>cl.includes(e.classe)).map(e=>e.parent))].map(p=>[pk(p),'Parent '+p])}
 const ts=[...new Set(mine().flatMap(e=>tc(e.classe)))];return [['a:','Direction'],['c:','Comptabilité'],...ts.map(t=>['t:'+t,'Enseignant '+nm(get('enseignants',t))])]}
function compose(id,to,obj){const m=id?get('messages',id):{to,objet:obj||''};
 modal(`<h2>${id?'Brouillon':'Nouveau message'}</h2><label>Destinataire<select id=mt>${J(contacts().map(x=>`<option value="${esc(x[0])}" ${x[0]===m.to?'selected':''}>${esc(x[1])}</option>`))}</select></label><label>Objet<input id=mo value="${esc(m.objet)}"></label><label>Message<textarea id=mb rows=5>${esc(m.corps||'')}</textarea></label><label>Pièces jointes<input id=mf type=file multiple></label><p class=err id=err></p><div class=act><button class=btn onclick="snd('${id||''}',1)">Enregistrer le brouillon</button><button class="btn pri" onclick="snd('${id||''}',0)">Envoyer</button></div>`)}
function snd(id,dr){const to=$('#mt').value,o=$('#mo').value.trim(),b=$('#mb').value.trim();if(!to||(!dr&&(!o||!b)))return $('#err').textContent='Choisissez un destinataire et renseignez l’objet et le message.';
 const pj=[...$('#mf').files].map(f=>f.name).join(', ');let m=id&&get('messages',id);
 if(m)Object.assign(m,{to,objet:o,corps:b,pj:pj||m.pj,draft:dr});else{m={id:uid(),from:U.key,to,objet:o,corps:b,pj,draft:dr,lu:0,hide:[]};DB.messages.push(m)}
 m.date=today();if(!dr){log('Envoi','messages',null,{titre:o+' → '+lab(to)});notify([to],'Nouveau message : '+o)}persist();closeM();toast(dr?'Brouillon enregistré':'Message envoyé');go()}
function rd(id){const m=get('messages',id);if(m.draft)return compose(id);if(m.to===U.key)m.lu=1;log('Consultation','messages',null,{titre:m.objet});persist();
 modal(`<h2>${esc(m.objet)}</h2><p class=note>De ${esc(lab(m.from))} à ${esc(lab(m.to))} · ${m.date}</p><p style="white-space:pre-wrap">${esc(m.corps)}</p>${m.pj?`<p>Pièces jointes : ${esc(m.pj)}</p>`:''}${m.recu?`<p><button class=btn onclick="recu('${m.recu}')">Voir le reçu</button></p>`:''}<div class=act>${m.to===U.key?`<button class=btn onclick="hideM('${id}')">Masquer de ma boîte</button>`:''}${m.to===U.key&&contacts().some(c=>c[0]===m.from)?`<button class=btn onclick="compose('','${m.from}','Re : ${esc(m.objet).replace(/'/g,'’')}')">Répondre</button>`:''}<button class="btn pri" onclick="closeM();go()">Fermer</button></div>`)}
function hideM(id){get('messages',id).hide.push(U.key);persist();closeM();go()}
function notifs(){const L=DB.notifs.filter(n=>n.to===U.key).reverse();modal(`<h2>Notifications</h2>${J(L.map(n=>`<p>${n.r?'':'<span class=tag>Nouveau</span> '}${esc(n.t)} <small class=note>${n.d}</small></p>`))||'<p class=empty>Aucune notification.</p>'}<div class=act><button class="btn pri" onclick="closeM();go()">Fermer</button></div>`);L.forEach(n=>n.r=1);persist()}
const vis=a=>a.aud==='Tous'||U.role==='a'||({p:'Parents',t:'Enseignants',s:'Élèves'})[U.role]===a.aud;
const annList=n=>J(live('annonces').filter(vis).reverse().slice(0,n).map(a=>`<article class=card><h3>${esc(a.titre)} <span class=tag>${a.aud}</span></h3><p>${esc(a.corps)}</p><small class=note>${a.date}</small></article>`))||'<p class=empty>Aucune annonce.</p>';

/* ---------- views ---------- */
const VIEWS={
 dash(){const st=CFG.stats();st.push(['Messages non lus',DB.messages.filter(m=>m.to===U.key&&!m.draft&&!m.lu&&!m.hide.includes(U.key)).length]);return head('Tableau de bord')+`<div class=stats>${J(st.map(s=>`<div class=card><b>${s[1]}</b><span>${s[0]}</span></div>`))}</div><h2>Dernières annonces</h2>`+annList(3)},
 paiements:()=>ent('paiements'),devoirs:()=>ent('devoirs'),
 edt(){const w=can('creneaux'),all=rows('creneaux'),r=all.filter(x=>(!ec||x.classe===ec)&&(!ed||x.jour===ed)),cl=live('classes').filter(c=>!mine()||all.some(x=>x.classe===c.id));
  return head('Emploi du temps',`<select aria-label="Classe" onchange="ec=this.value;go()"><option value="">Toutes les classes</option>${J(cl.map(c=>`<option value=${c.id} ${c.id===ec?'selected':''}>${nm(c)}</option>`))}</select><select aria-label="Vue" onchange="ed=this.value;go()"><option value="">Semaine</option>${J(D.map(d=>`<option ${d===ed?'selected':''}>${d}</option>`))}</select>${w?`<button class="btn pri" onclick="form('creneaux')">Ajouter un créneau</button>`:''}`)
  +`<div class=week>${J(D.filter(d=>!ed||d===ed).map(d=>`<div class=day><h3>${d}</h3>${J(r.filter(x=>x.jour===d).sort((a,b)=>a.debut.localeCompare(b.debut)).map(x=>`<div class=slot><b>${x.debut}–${x.fin}</b> ${esc(nm(get('matieres',x.matiere)))}<small>${esc(nm(get('classes',x.classe)))} · ${esc(nm(get('enseignants',x.ens)))} · ${esc(nm(get('salles',x.salle)))}</small>${w?`<div><button class="btn sm" onclick="form('creneaux','${x.id}')">Modifier</button> <button class="btn sm danger" onclick="del('creneaux','${x.id}')">Supprimer</button></div>`:''}</div>`))||'<p class=empty>Aucun cours</p>'}</div>`))}</div>`},
 notes(){post=bul;const m=mine()||live('eleves');
  return head('Notes et bulletins')+`<div class=card><div class=ha style="margin-bottom:.6rem"><select id=be aria-label="Élève" onchange=bul()>${J(m.map(e=>`<option value=${e.id}>${esc(nm(e))}</option>`))}</select><select id=bt aria-label="Période" onchange=bul()><option value="">Année complète<option>T1<option>T2<option>T3</select><button class="btn pri" onclick=bulPrint()>Télécharger en PDF</button></div><div id=bul></div></div>`+(can('notes')?'<h2>Saisie des notes</h2>'+tbl('notes'):'')},
 msg(){const me=U.key,M=DB.messages,L=(tab==='in'?M.filter(m=>m.to===me&&!m.draft&&!m.hide.includes(me)):tab==='out'?M.filter(m=>m.from===me&&!m.draft):M.filter(m=>m.from===me&&m.draft)).slice().reverse(),n=M.filter(m=>m.to===me&&!m.draft&&!m.lu&&!m.hide.includes(me)).length;
  return head('Messagerie',`<button class="btn pri" onclick=compose()>Nouveau message</button>`)+`<div class=tabs>${J([['in','Réception'+(n?' ('+n+')':'')],['out','Envoyés'],['dr','Brouillons']].map(t=>`<button class="btn ${t[0]===tab?'on':''}" onclick="tab='${t[0]}';go()">${t[1]}</button>`))}</div>`+(tab==='out'?'<p class=note>Un message envoyé ne peut être ni modifié ni supprimé.</p>':'')
  +(J(L.map(m=>`<div class="msg ${tab==='in'&&!m.lu?'new':''}" tabindex=0 onclick="rd('${m.id}')" onkeydown="if(event.key==='Enter')rd('${m.id}')"><b>${esc(m.objet||'(sans objet)')}</b><span>${tab==='in'?esc(lab(m.from)):'À '+esc(lab(m.to))}</span><small>${m.date}</small></div>`))||'<p class=empty>Aucun message ici.</p>')},
 annonces:()=>head('Annonces',U.role==='a'?`<button class="btn pri" onclick="form('annonces')">Publier une annonce</button>`:'')+'<p class=note>Une annonce publiée ne peut être ni modifiée ni supprimée. En cas d’erreur, publiez une annonce corrective.</p>'+annList(99),
};

/* ---------- shell (shared by all role pages) ---------- */
let CFG=null;
function login(){location.href='index.html'}
function go(v){if(!CFG)return;if(v){view=v;closeM()}const nav=CFG.nav.map(id=>NAV.find(n=>n[0]===id)),c=DB.notifs.filter(n=>n.to===U.key&&!n.r).length;
 $('#app').innerHTML=`<aside><div class=brand>École Abou el Kacem Chebbi</div><nav>${J(nav.map(n=>`<a href=# class="${n[0]===view?'on':''}" onclick="go('${n[0]}');return false">${n[1]}</a>`))}</nav></aside><main><header><span><b>${esc(U.name)}</b> · ${ROLE[U.role]}</span><span class=ha><button class="btn sm" onclick=notifs()>Notifications${c?' ('+c+')':''}</button><button class="btn sm" onclick=login()>Quitter</button></span></header><section>${VIEWS[view]()}</section></main>`;
 if(post){const p=post;post=null;p()}}
function start(cfg){CFG=cfg;load();U={...cfg.user};Object.assign(VIEWS,cfg.views||{});view='dash';go()}
