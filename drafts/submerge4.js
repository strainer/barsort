require ('../dlib/mutil.js')
Fdr=Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')
//~ Barsort=require('../barsort_fsta.js')

    
function lessthan(a,b){ return a<b }
function morethan(a,b){ return a>b }
var compar = morethan
var submcach=[], dbc=0
var see=false//true//false//true
var see2=false//true//false

function wub(len){ var ll=0; return Fdrandom.bulk( len,function(){ return (ll++)+Math.round(Fdrandom.gspire()*Fdrandom.gspire()*1000 )*Fdrandom.rbit()} ) }

function web(len){ var ll=0; 
  return Fdrandom.bulk( len,function(){ return (ll++)+Fdrandom.irange(-len/10,len/10)*(Math.sin(ll/len*7)+Math.sin(ll/len*8)+Math.sin(ll/len*18)+Math.sin(ll/len*9)) } ) 
  }

function wab(len)
{ return Fdrandom.bulk( len,function(){ return Fdrandom.gaus()} ) }

function wib(len)
{ return Fdrandom.bulk( len,function(){ 
    var f=Fdr.gthorn(); f=f*f*f
    
    return (Fdr.rbit()+Fdr.rpole())*100+f
   } ) 
}

function wob(len)
{ return Fdrandom.bulk( len,function(){ 
    var f=Fdr.f48(); f=f
    
    return (Fdr.rpole())*0+f
   } ) 
}

//~ var zlen=130000 //broke
var zlen=30000 //broke
var zlen=20000 
var zlen=20000 //broke
var zlen=1000000 //broke

var Av=wab(zlen), Alen=Av.length, Ax=[]

var Alen=Av.length, Ax=new Array(Alen)
for(var j=0;j<Alen;j++) Ax[j]=j

//~ rslt=sortcheck(Av,Ax)
//~ console.log(rslt)

rslt=sortcheck(Av,sosort(Av))
console.log(rslt,dbc)

//~ return

var cooz
if(!see)bench( 
    function(){ 
      cooz+=sosort(Av)[0]
    }
    ,1.3
    ,"inmgsort", 0
)

if(!see)bench( 
    function(){ 
      cooz+=Barsort.stndindex(Av)[0]
    }
    ,1.3
    ,"stndsort", 0
)

conlog("cooz",cooz)
var po//=true 

    
    
function sosort(Av){
  var Alen=Av.length, Ax=new Array(Alen)
  for(var j=0;j<Alen;j++) Ax[j]=j
  
  
  var perma=3000, stint=400, trig=30, bottle=150//(~>25 min easyval) //

  soulsort( Av ,Ax ,1000 ) 
  return Ax
}
  

//contain a by b and c
function ntain(a,b,c){ 
  if(a<b){ return b }else{ if(c<a) return c } return a
}



function runcheck(Av,Ax,s,e){
  var f=0, de=[]
  for(var c=s+1;c<e;c++){ if (!compar(Av[Ax[c]],Av[Ax[c-1]])){ de.push(c-1);f++ }}
  if(f)console.log("disoz:",f,",",s,"to",e,"[",de.join(", ")),"]"	
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
  var bado=0
  
  var dentical=1
  
  for( var ord=0,e=valz.length; ord<e; ord++ ){

    if(sdic[ord]===chex[ord]){ continue }
    dentical=false
    
    var ook=sdic[ord] //outoforderkey  original order initaddresskey 
    
    var vook=valz[ook] //valof ookey
    
    if(!((ook>0||ook===0)&&(ook<e))){ ern++,ersu+=e } //ook must be in range
      
    var cxord=ord, dford=0
    
    while(cxord<e&&vook>valz[chex[cxord]]){ //search cxord+++
      //chex 
      
      //skip dupes
      while(valz[chex[cxord]]===valz[chex[cxord+1]]){ 
        
        if(ook===chex[cxord]){
          if(sdic[ord+1]!==chex[cxord+1]) { bado++ }
        }
        if(ook===chex[cxord+1]){
          if(ook!==chex[cxord]) { bado++ }
        }	
        
        cxord++ }
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
   
  if(ersu||bado) {
    return {iss:ern||0,txt:ern+" disordered keys "+(ersu/ern).toFixed(2)+"places per key,"+maxmis+" max. badors:",bado}
  }else{ 
    var tx=dentical?"stable":"unstable"
    return {iss:0,txt:tx} }
  
 
  //else{ conlog(" Order is clean") }

  //if(tot){ conlog("tot!",tot) }
    
  //~ if(valz.length<16){ 
    //~ conlog(valz)
    //~ conlog(sdic)
  //~ }
  
}


   
    
  
  //contain filter bind trap limit
  function soulsort(Av,Ax,bottle){
    
    var Alen=Av.length ,mergs=bottle*(Alen+10000) 
     
    var tail=30 ,block=250
    var parts=[0], uflow=0, umost=1000, umo=500
    
    var first=ntain(150,0,Alen), st=first ,nx,snip
    
    insertndx(Av,Ax,1,first,0)
     
    while ( st < Alen){ 
      //~ if(see)console.log(st) 
      
      nx=ntain(st+block,0,Alen)
      
      snip=insertndx(Av,Ax,st,nx,st-tail)
     
      if(snip){ 
        
        //uflow should the last partition pos
        //uflow should not be too far back
        //or too little back
        if((nx-uflow)>umost){ uflow+=umo }
        
        var k=backmerge2(Av,Ax,st-tail,nx,uflow )
        
        mergs-=Math.sqrt(snip)*k 
        if(mergs<0){ return false }
        if(k>uflow-(st-tail)){ //note new partition
          if(parts[parts.length-1]!==uflow){
            parts.push(uflow)
          }
          //k =return wrpos<b?s-wrpos+1:s-wrpos 
        }
     
      }
      mergs+=bottle
      st=nx 
    }
    
    if(see2)console.log("parts:",parts.length)
    if(see2)console.log(parts.join(", "))
    if(parts.length>1){
      var cpr=2//parts.length
      var bp,cp,dp=parts[1], qp
      
      var dpars=parts.length-1, apars=parts.length
      while(dpars){
        
        while(parts[ cpr ]===0){ cpr++ } //skip zeroed
        if(cpr>=apars){ break }
        
        bp = dp                                    //  100
        cp = parts[ cpr ]; parts[ cpr ]=0          //  200
        while(parts[ cpr ]===0){ cpr++ }           //skip zeroed
        
        dp = (cpr<apars)? parts[ cpr ] : Alen     //  300
        qp=cpr++
        
        if(see2)console.log("bakm",bp,"<-",cp,ntain(cp+umost,0,dp))
        if(see2)runcheck(Av,Ax,bp,cp)
        if(see2)runcheck(Av,Ax,cp,ntain(cp+umost,0,dp)) 
        var k=backmerge2(Av,Ax ,cp,dp,bp ) //test see if this is req

        while(parts[ cpr ]===0){ cpr++ }
        if(qp!==apars){
          dp = (cpr<apars)? parts[ cpr++ ] : Alen
          cp = parts[ qp ]; parts[qp]=0
          var k=backmerge2(Av,Ax ,cp,dp,bp )
        }
        
        while(parts[ cpr ]===0){ cpr++ }
        //~ if(cpr!==apars-2){ cpr++ }
        if(cpr>=apars){ dp=0,cpr=0}
      }
    }//merged parts
    
    return st===Alen

  }


  function insertndx(Av,Ax,s,e,a){ 
    
    var bacway=0, xdua=0, xdub=0, baced=0
       ,f=s+((e-s)>>>1)*2
    
    var duewa=s,duewb=s+1
    while( duewb<f ){
            
      bacway= duewa-1
      xdua = Ax[duewa] 
      
      if(compar(Av[xdua],Av[Ax[duewb]])){
        Ax[duewa]=Ax[duewb] ,Ax[duewb]=xdua ,xdua=Ax[duewa] 
      }
      xdub = Ax[duewb] 
            
      while( bacway>=a && compar(Av[Ax[bacway]] , Av[xdub])){ //if pre is smaller
        Ax[bacway+2] = Ax[bacway]              //
        bacway--
        //~ //moved++
      }	
      if(bacway<a){ baced++ }
      Ax[bacway+2] = xdub
      
      while( bacway>=a && compar(Av[Ax[bacway]] , Av[xdua])){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
      }
      if(bacway<a){ baced++ }
      Ax[bacway+1] = xdua
      
      duewa+=2,duewb+=2
    }
     
    if(f!==e){
      xdua=Ax[e-1]
      bacway=e-2
        
      while( bacway>=a && compar(Av[Ax[bacway]], Av[xdua])){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
      }	
      if(bacway<a){ baced++ }
      Ax[bacway+1] = xdua 
    }
    
    return baced 
  }


  var submcach=[] 
  function backmerge(Av,Ax,s,e,b){
   
    //~ if(see)console.log ("bakm:",s,e,e-s) 
    //~ if(see)console.log(Ax.slice(0,10).join(" "))
    
    if(e-s>submcach.length) submcach=new Array(e-s)
    for(var h=0,j=s,ee=e-s;h<ee; ) submcach[h++]=Ax[j++] 
    
    //~ var wrpos=e-1, clonx=e-s-1, hipt=s(-1), bhipt=hipt, lep=1 
    var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

    //loop till clonx<0 
    while(clonx!==-1)// ix of copyel to place
    {
      lep=1,bhipt=hipt
      
      //~ if(see) console.log("wrpos:",wrpos)
      //~ if(see) console.log("clopt",clonx,"clova",Av[submcach[clonx]])
      //~ if(see) console.log("hipt:",hipt ,"hiva:",Av[Ax[hipt]])
      
      //find hipt for clonel, the highest ix where clonel can go 
      while( (hipt>=b) && compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
      { hipt=hipt-(lep++) } 
      if(hipt<b){ hipt=b } 
      
      while( (hipt<=bhipt) && !compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is jdest
      { hipt++ }  //careful with stability here, get equal high as poss
      hipt--
      
      //~ if(see) console.log("hapt:",hipt ,"hava:",Av[Ax[hipt]])
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

    //return s-wrpos //how far back merged
    return wrpos<b?s-wrpos+1:s-wrpos //merge underflowed
  } 
  

   function backmerge2(Av,Ax,s,e,b){
   
    //~ if(see)console.log ("bakm:",s,e,e-s) 
    //~ if(see)console.log(Ax.slice(0,10).join(" "))
    
    if(e-s>submcach.length) submcach=new Array(e-s)
    for(var h=0,j=s,ee=e-s;h<ee; ) submcach[h++]=Ax[j++] 
    
    //~ var wrpos=e-1, clonx=e-s-1, hipt=s(-1), bhipt=hipt, lep=1 
    var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

    ///1st loop till clonx<0 
    
    while( (hipt>=b) && compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
    { hipt=hipt-(lep++) } 
    if(hipt<b){ hipt=b } 
    
    while( (hipt<=bhipt) && !compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is jdest
    { hipt++ }  //careful with stability here, get equal high as poss
    hipt--
    
    //~ if(see) console.log("hapt:",hipt ,"hava:",Av[Ax[hipt]])
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
    
    ///
     
    while(clonx!==-1)// ix of copyel to place
    {
      lep=1,bhipt=hipt
      
      //~ if(see) console.log("wrpos:",wrpos)
      //~ if(see) console.log("clopt",clonx,"clova",Av[submcach[clonx]])
      //~ if(see) console.log("hipt:",hipt ,"hiva:",Av[Ax[hipt]])
      
      //find hipt for clonel, the highest ix where clonel can go 
      while( (hipt>=b) && compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
      { hipt-- } 
   
      for(var c=bhipt,d=c+wrpos-bhipt;  c>hipt; ){
        Ax[d--]=Ax[c--]  //fiddle these byones
      }
      
      wrpos-=(bhipt-hipt)
      Ax[wrpos]=submcach[clonx]
      wrpos--,clonx--
      
    }//while

    //return s-wrpos //how far back merged
    return wrpos<b?s-wrpos+1:s-wrpos //merge underflowed
  } 
  
 