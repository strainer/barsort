require ('../dlib/mutil.js')
Fdr=Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')
//~ Barsort=require('../barsort_fsta.js')

    
function lessthan(a,b){ return a<b }
function morethan(a,b){ return a>b }
var compar = morethan
var submcach=[], dbc=0
var see=false//true//false//true

function wub(len){ var ll=0; return Fdrandom.bulk( len,function(){ return (ll++)+Math.round(Fdrandom.gspire()*Fdrandom.gspire()*1000 )*Fdrandom.rbit()} ) }

function web(len){ var ll=0; 
  return Fdrandom.bulk( len,function(){ return (ll++)+Fdrandom.irange(-len/20,len/20)*(Math.sin(ll/len*7)+Math.sin(ll/len*8)+Math.sin(ll/len*18)+Math.sin(ll/len*9)) } ) 
  }

function wab(len)
{ return Fdrandom.bulk( len,function(){ return Fdrandom.gaus()} ) }

var zlen=300000
var Av=wub(zlen), Alen=Av.length, Ax=[]

var Alen=Av.length, Ax=new Array(Alen)
for(var j=0;j<Alen;j++) Ax[j]=j

//~ rslt=sortcheck(Av,Ax)
//~ console.log(rslt)

console.log(Alen)





var cooz
if(!see)bench( 
    function(){ 
      cooz+=sosort(Av)[0]
    }
    ,1.3
    ,"sosrt", 0
)

conlog("cooz",cooz)
var po//=true 

//~ rslt=sortcheck(Av,sosort(Av))
//~ console.log(rslt,dbc)
    
    
function sosort(Av){
  var Alen=Av.length, Ax=new Array(Alen)
  for(var j=0;j<Alen;j++) Ax[j]=j
  
  
  var perma=3000, stint=400, trig=30, bottle=150//(~>25 min easyval) //

  soulsort( Av,Ax,stint,perma,bottle,trig ) 
  return Ax
}
  

//contain a by b and c
function ntain(a,b,c){ 
  if(a<b){ return b }else{ if(c<a) return c } return a
}


//contain filter bind trap limit
function soulsort(Av,Ax,stint,prema,bottle,trig){
  
  var trys=0 ,bst=0,st=0,Alen=Av.length  ,shfts=0
  bottle = 1/bottle
   
  while ( (sresult=insertndx(Av,Ax,stint,st)).bk < Alen){
    bst=st,st=sresult.du,trys+=stint
    
    shfts=(shfts+stint/(st-bst+1))*0.45
    if(see)console.log("st",st,"shfts",shfts)
    if(shfts>trig){
      var Alnt=Math.ceil((prema)/50) 
      if(st<trys*bottle-5000) break
     
      st=submerge(Av,Ax,prema,st,ntain(st+Alnt,0,Alen) )
      trys+=prema
      
      prema=prema>1000000?1000000:prema+50000
    }else{
      prema=prema>2000?prema-50000:2000
    }
  }
  
  if(see){
    if(sresult.du<Alen){ console.log("early",trys,sresult.bk,sresult.du)}
    else{ console.log("full",trys,sresult.bk,sresult.du)}
  }
}



function submerge(Av,Ax,prema,s,e){
 
  if(see)conlog("min:",s,e,e-s) 
  var res=insertndx(Av,Ax,prema,s+1,e,s)
  
  e=res.du
  
  if(e-s>submcach.length) submcache=new Array(e-s)
  for(var h=0,j=s;j<e; ) submcache[h++]=Ax[j++]
  
  //~ var submcache=Ax.slice(s,e)
  
  if(see)conlog("sli:",s,e,e-s)
   
  var c=e, h=s-1, j=e-s-1
  
  while(j>-1){
    if( compar( Av[Ax[h]] , Av[submcache[j]]) ){
      Ax[--c]= Ax[h--] , dbc++
    }else{
      Ax[--c]= submcache[j--] , dbc++
    }
  }
  
  return e
}


    
  function insertndx(Av,Ax,prema,s,e,a){ 
    
    if(a===undefined) a=0
    if(s===undefined) s=1
    if(e===undefined) e=Ax.length
    
    var moved=0, prema=Math.ceil( prema||20*e )
    var pickv=compar(Av[Ax[s]],Av[Ax[s]]+1)?Av[Ax[s]]+1:Av[Ax[s]]-1
    var oback=0,bacway=0,pickx
    
    for(var dueway=s ;dueway<e; dueway++){
      
      pickx = Ax[dueway] 
      
      //this pick is lower or equal than last pick
      //which was placed oback
      if( !compar( Av[pickx],pickv ) ){ 
        for(var t=dueway;t>oback;){ Ax[t] = Ax[--t] }
        moved+=bacway-oback ; bacway=oback
      }else{
        bacway=dueway-1
      }
      pickv=Av[pickx]
      
      while( bacway>=a && compar(Av[Ax[bacway]] , pickv)){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
        moved++
      }
      if(bacway<a){ budge++ }
      Ax[++bacway] = pickx                     //put pickx down
      oback=bacway
      //~ moved+=dueway-bacway
      if( moved > prema){ 
        return {bk:bacway,du:dueway} 
      }
    }
     
    return {bk:dueway,du:dueway}
  }


  
function insertndxu(Av,Ax,prema,s,e,a){ 
  
  if(a===undefined) a=0
  if(s===undefined) s=1
  if(e===undefined) e=Ax.length
  
  var moved=0, prema=Math.ceil( prema||20*e )
  //~ console.log("starting:",s,prema)
  var pickv=compar(Av[s],Av[s]+1)?Av[s]+1:Av[s]-1
  var oback=0,bacway=0,pickx
  
  for(var dueway=s ;dueway<e; dueway++){
    
    pickx = Ax[dueway] 
    
    //this pick is lower or equal than last pick
    //which was placed oback
    if( !compar( Av[pickx],pickv ) ){ 
      for(var t=dueway;t>oback;){ Ax[t] = Ax[--t] }
      bacway=oback
    }else{
      bacway=dueway-1
    }
    pickv=Av[pickx]
    while( bacway>=a && compar(Av[Ax[bacway]] , pickv)){ //if pre is smaller
      Ax[bacway+1] = Ax[bacway]              //
      bacway--
      moved++
    }
    Ax[++bacway] = pickx                     //put pickx down
    oback=bacway
    //~ moved+=dueway-bacway
    if( moved > prema){ 
      //~ console.log("insert bail:",dueway-1); 
      return {bk:bacway,du:dueway} 
    }
  }
   
  //~ console.log("fullinsfin",dueway,e)
  return {bk:dueway,du:dueway}
}
  
function insertndxr(Av,Ax,prema,s,e,a){ 
  
  if(a===undefined) a=0
  if(s===undefined) s=1
  if(e===undefined) e=Ax.length
  
  var moved=0, prema=Math.ceil( prema||20*e )
  //~ console.log("starting:",s,prema)
  var pickv=compar(Av[s],Av[s]+1)?Av[s]+1:Av[s]-1
  var oback=0,bacway=0,pickx
  
  for(var dueway=s ;dueway<e; dueway++){
    
    pickx = Ax[dueway] 
    
    //this pick is lower or equal than last pick
    //which was placed oback
    //~ if( !compar( Av[pickx],pickv ) ){ 
      //~ for(var t=dueway;t>oback;){ Ax[t] = Ax[--t] }
      //~ bacway=oback
    //~ }else{
      //~ bacway=dueway-1
    //~ }
    
    bacway=dueway-1
    pickv=Av[pickx]
    while( bacway>=a && compar(Av[Ax[bacway]] , pickv)){ //if pre is smaller
      Ax[bacway+1] = Ax[bacway]              //
      bacway--
      moved++
    }
    Ax[++bacway] = pickx                     //put pickx down
    //oback=bacway
    //~ moved+=dueway-bacway
    if( moved > prema){ 
      //~ console.log("insert bail:",dueway-1); 
      return {bk:bacway,du:dueway} 
    }
  }
   
  //~ console.log("fullinsfin",dueway,e)
  return {bk:dueway,du:dueway}
}



function insertndxx(Av,Ax,prema,s,e,a){ 
  
  if(a===undefined) a=0
  if(s===undefined) s=1
  if(e===undefined) e=Ax.length
  
  var moved=0, prema=Math.ceil( prema||20*e )
  //~ console.log("starting:",s,prema)
  var pickv=compar(Av[Ax[s]],Av[Ax[s]]+1)?Av[Ax[s]]+1:Av[Ax[s]]-1
  var oback=0,bacway=0,pickx,bunch=1
  
  for(var dueway=s ;dueway<e; dueway++){
    
    pickx = Ax[dueway] 

    bunch=1
    if( !compar( Ax[dueway],Ax[dueway+1] ) && (dueway+1<e) ){ //next isequal or less
      picky = Ax[dueway+1]
      bunch++
    }
        
    //this pick is lower or equal than last pick
    //which was placed oback
    
    if( !compar( Av[pickx],pickv ) ){ 
      for(var t=dueway-1+bunch,bt=dueway-1;t>oback;){ Ax[t--] = Ax[bt--] }
      bacway=oback
    }else{
      bacway=dueway-1
    }
    
    
    bacway=dueway-1
    pickv=Av[pickx]
    
    
    while(bunch>0){
      while( bacway>=a && compar(Av[Ax[bacway]] , pickv)){ //if pre is smaller
        Ax[bacway+bunch] = Ax[bacway]              //
        bacway--
        moved++
      }
      Ax[++bacway] = pickx                     //put pickx down
      
      if(bunch===2){ 
        
        pickx=picky
        pickv=Av[pickx] 
        
      }else{
        oback=bacway 
      }
      bunch--
    }
    
    //~ moved+=dueway-bacway
    if( moved > prema){ 
      //~ console.log("insert bail:",dueway-1); 
      return {bk:bacway,du:dueway} 
    }
  }
   
  //~ console.log("fullinsfin",dueway,e)
  return {bk:dueway,du:dueway}
}














function sortcheck(valz,sdic,nopre,odesc,st,ov){ //st,ov not implemented

  var printlim=0
  
  st=st||0, ov=ov||valz.length
  
  odesc=odesc||false

  var otxt="Checked "+odesc?"descnd.":""+" order."+nopre?" (nopre) ":""
  
  var chex=Barsort.stndindex(valz,odesc)
  
  var ern=0,ersu=0, cch=-1,dch=-1, maxmis=0,miz
  
  var dford=0
  var tot=0
  
  for( var ord=0,e=valz.length; ord<e; ord++ ){
    
    var ook=sdic[ord] //outoforderkey  original order initaddresskey 
    var vook=valz[ook]
    
    if(!((ook>0||ook===0)&&(ook<e))){ ern++,ersu+=e }
      
    var cxord=ord, dford=0
    
    while(cxord<e&&vook>valz[chex[cxord]]){ //search cxord+++
      //skip dupes
      while(valz[chex[cxord]]===valz[chex[cxord+1]]){ cxord++ }
      cxord++; dford++
    }
       
    while(cxord>-1&&vook<valz[chex[cxord]]){ //search cxord---
      //skip dupes
      while(valz[chex[cxord]]===valz[chex[cxord-1]]){ cxord-- }
      cxord--; dford++
    }
    
    if(dford){ 
      ern++;ersu+=dford
      if(dford>maxmis)maxmis=dford
    //}
      
      if(valz.length<16){
        conlog(
         "ts-o=",ord,"tr-o=",cxord,"ook=",sdic[ord]," val=",valz[sdic[ord]]," cval=",valz[chex[ord]])
      } 
    }
  } 
   
  if(ersu) {
    return {iss:ern||0,txt:ern+" disordered keys "+(ersu/ern).toFixed(2)+"places per key,"+maxmis+" max"}
  }else{ return {iss:0,txt:""} }
  
 
  //else{ conlog(" Order is clean") }

  //if(tot){ conlog("tot!",tot) }
    
  //~ if(valz.length<16){ 
    //~ conlog(valz)
    //~ conlog(sdic)
  //~ }
  
}

