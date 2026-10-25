start({
 user:{role:'p',name:'Ben Salah',key:'p:Ben Salah'},
 nav:['dash','edt','notes','paiements','devoirs','msg','annonces'],
 stats:()=>mine().map(e=>[nm(e)+' · '+nm(get('classes',e.classe)),'Moyenne '+fmt(avg(e.id).g)+' · solde '+solde(e.id)+' TND'])
});
