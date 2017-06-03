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

var zlen=100000
var Av=wab(zlen), Alen=Av.length, Ax=[]

var Alen=Av.length, Ax=new Array(Alen)
for(var j=0;j<Alen;j++) Ax[j]=j

//~ rslt=sortcheck(Av,Ax)
//~ console.log(rslt)


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

rslt=sortcheck(Av,sosort(Av))
console.log(rslt,dbc)
    
    
function sosort(Av){
  var Alen=Av.length, Ax=new Array(Alen)
  for(var j=0;j<Alen;j++) Ax[j]=j
  
  
  var perma=3000, stint=400, trig=30, bottle=150//(~>25 min easyval) //

  soulsort( Av ,Ax ,10000000 ) 
  return Ax
}
  

//contain a by b and c
function ntain(a,b,c){ 
  if(a<b){ return b }else{ if(c<a) return c } return a
}


//contain filter bind trap limit
function soulsort2(Av,Ax,stint,prema,bottle,trig){
  
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


//contain filter bind trap limit
function soulsort(Av,Ax,bottle){
  
  var Alen=Av.length ,mergs=0 
   
  var tail=15,block=250 
  
  var first=150, st=first ,nx,backed
  
  insertndx(Av,Ax,1,first,0)
   
  while ( st < Alen){ 
    if(see)console.log(st) 
    
    nx=ntain(st+block,0,Alen)
    backed=insertndx(Av,Ax,st,nx,st-tail)
   
    if(backed){ 
     
      if((mergs++)>bottle){ break }
      backmerge(Av,Ax,st-tail,nx) 
   
    }
    st=nx 
  }
  
  return st===Alen

}

  function insertndx(Av,Ax,s,e,a){ 
    
    if(a===undefined) a=0
    if(s===undefined) s=1
    if(e===undefined) e=Ax.length
    
    var pickv=compar(Av[Ax[s]],Av[Ax[s]]+1)?Av[Ax[s]]+1:Av[Ax[s]]-1
    var oback=0, bacway=0, pickx=0, baced=0
    
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
      //~ bacway=dueway-1
      
      pickv=Av[pickx]
      
      while( bacway>=a && compar(Av[Ax[bacway]] , pickv)){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
        //~ moved++
      }
      if(bacway<a){ baced++ }
      Ax[++bacway] = pickx                     //put pickx down
      oback=bacway
      //~ moved+=dueway-bacway
      //~ if( moved > prema){ 
        //~ return {bk:bacway,du:dueway} 
      //~ }
    }
     
    return baced //{ bk:dueway,du:dueway }
  }


var submcach=[] 
function backmerge(Av,Ax,s,e){
 
  if(see)console.log ("min:",s,e,e-s) 
  //~ if(see)console.log(Ax.slice(0,10).join(" "))
  
  if(e-s>submcach.length) submcach=new Array(e-s)
  for(var h=0,j=s,ee=e-s;h<ee; ) submcach[h++]=Ax[j++]
  
  //~ var cop=Ax.slice(s,e)
  
  if(see)console.log ("sli:",s,e,e-s) 
  
  //~ var wrpos=e-1, clonx=e-s-1, hipt=s(-1), bhipt=hipt, lep=1 
  var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

  //loop till clonx<0 
  while(clonx!==-1)// ix of copyel to place
  {
    lep=1,bhipt=hipt
    
    if(see) console.log("wrpos:",wrpos)
    if(see) console.log("clopt",clonx,"clova",Av[submcach[clonx]])
    if(see) console.log("hipt:",hipt ,"hiva:",Av[Ax[hipt]])
    
    //find hipt for clonel, the highest ix where clonel can go 
    while( (hipt>-1) && compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
    { hipt=hipt-(lep++) } 
    if(hipt<1){ hipt=0 } 
    
    while( (hipt<=bhipt) && !compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is jdest
    { hipt++ }  //careful with stability here, get equal high as poss
    hipt--
    
    if(see) console.log("hapt:",hipt ,"hava:",Av[Ax[hipt]])
    //if hipt is bhipt
    
    //move bhipt to hipt up to wrpos (up by wrpos-bhipt)
    //for(var c=bhipt(-1),d=c+copn; c>(=)hipt; c--){
    for(var c=bhipt,d=c+wrpos-bhipt;  c>hipt; ){
      Ax[d--]=Ax[c--]  //fiddle these byones
    }
    
    //bhipt moving to wrpos, mvby wrpos-bhipt
    //add bhipt-hipt to wrpos
    wrpos-=(bhipt-hipt)
    //THEN place copyel in wrpos
    Ax[wrpos]=submcach[clonx]
    //then dec wrpos and dec clonx
    wrpos--,clonx--
    
  }//while

  return e

}


function backmerge2(Av,Ax,s,e){
 
  if(see)conlog("min:",s,e,e-s) 
  
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

