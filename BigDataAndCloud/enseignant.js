start({
 user:{role:'t',name:'Sonia Trabelsi',id:'t1',key:'t:t1'},
 nav:['dash','edt','notes','devoirs','msg','annonces'],
 stats:()=>[['Devoirs publiés',live('devoirs').length],['Dépôts à noter',DB.depots.filter(d=>d.note==null).length]]
});
