start({
 user:{role:'s',name:'Yassine Ben Salah',eid:'e1',key:'s:e1'},
 nav:['dash','edt','devoirs','msg','annonces'],
 stats:()=>mine().map(e=>[nm(e)+' · '+nm(get('classes',e.classe)),'Moyenne '+fmt(avg(e.id).g)])
});
