const elv=()=>ent('eleves');
start({
 user:{role:'a',name:'Direction',key:'a:'},
 nav:['dash','eleves','classes','matieres','enseignants','salles','edt','notes','paiements','devoirs','msg','annonces','journal'],
 stats:()=>{const el=live('eleves');return [['Élèves inscrits',el.filter(e=>e.statut==='Inscrit').length],['Pré-inscriptions en attente',el.filter(e=>e.statut!=='Inscrit').length],['Classes',live('classes').length],['Impayés',el.reduce((s,e)=>s+Math.max(0,solde(e.id)),0)+' TND']]},
 views:{
  eleves:elv,classes:()=>ent('classes'),matieres:()=>ent('matieres'),enseignants:()=>ent('enseignants'),salles:()=>ent('salles'),
  journal:()=>head('Journal des modifications')+`<div class=tw><table><tr><th>Date<th>Utilisateur<th>Action<th>Entité<th>Détail</tr>${J(DB.log.map(l=>`<tr><td>${l.d}<td>${esc(l.u)}<td>${l.a}<td>${l.k}<td>${esc(l.x)}`))}</table></div>`
 }
});
