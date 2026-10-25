start({
 user:{role:'c',name:'Comptabilité',key:'c:'},
 nav:['dash','eleves','paiements','msg','annonces'],
 stats:()=>{const el=live('eleves');return [['Élèves inscrits',el.filter(e=>e.statut==='Inscrit').length],['Paiements enregistrés',live('paiements').length],['Impayés',el.reduce((s,e)=>s+Math.max(0,solde(e.id)),0)+' TND']]},
 views:{eleves:()=>ent('eleves')}
});
