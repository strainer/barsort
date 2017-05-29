require ('../dlib/mutil.js')
Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')
//~ Barsort=require('../barsort_fsta.js')
//~ Barsort=require('../barsort2.js')
Timsort=require('O:/hub/lead/node-timsort/build/timsort.min.js')

Fdrandom.repot("2")
//~ Fdrandom=Fdrandom.hot()

testbatch()

function testbatch(){
  
  barchecking=false
  //~ barchecking=true
  detail_missbars=false
  secure_barindex=false//true//false
  bar_resolution=2
  sub_range=true
  
  sortchecking=true
  flawcheck=false//true//false

  benchsecs    =1
  sortbenching =true
  stndbench    =true
  sortobench   =true
  resortbench  =true
  fasortbench  =false
  timsortbench =true

  nopresort =false//true//false
  nopostsort=false//true//false
  
  descen=false//true

  if(sortbenching){
    console.log("Benchmarking "+benchsecs+" seconds each function")
  } 
  if(sortchecking){
    conlog("Checking sort functions")	
  }
  
  if(sortbenching||sortchecking){
    if(nopresort){ conlog(" No quickiesorting ") }
    if(nopostsort){ conlog(" No suresorting ") }
    if(descen){ conlog(" Descending order") }
  }
  
  var tloops=1
  var tlens=[10,100,1000,10000]
  var tlens=[50,200,450,850,1250,2000,3000,5000,7500,10000,25000,100000,500000,2000000]
  var tlens=[0,1,2,3,4,6,10,14,18,25,40,80,150,250,500]
  var tlens=[3,5,9,12,16,25,36,60,120,250,500,1000,2000,5000,10000,25000,100000,500000,2000000]
  //~ var tlens=[50,200,600,1250,3000,7500,25000,100000,500000]
  //~ var tlens=[10000]
  //~ var tlens=[25000,100000,500000,5000000]

  //~ var tlens=[100,10000,1000000,5000000]
  //~ var tlens=[1000000]
  //~ var tlens=[2,3,5,8,12,14,16,20,25,30,36,42,50]
  
  var dists=[
    { desc:"warmup equally distributed reals from -20 to 20",
      func:function(len){ return Fdrandom.mixof( Fdrandom.bulk( 1000,function(){ return Fdrandom.range(-20,20)} ) ,len ) } }
    ,
    { desc:"equally distributed reals from -20 to 20",
      func:function(len){ return Fdrandom.bulk( len,function(){ return Fdrandom.range(-20,20)} )  } }
    ,
    { desc:"huge magnitude with gaps and duplicates",
      func:function(len){ return Fdrandom.mixof( Fdrandom.bulk( Math.floor(len/30+10)),function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g*g} ,len ) } }
   ,
   ,{ desc:"gaussian distribution -1 to 1",
      func:function(len){ return Fdrandom.bulk( tlen,function(){ return Fdrandom.gaus()}  ,len ) } } 
   , 
   { desc:"sideloaded reals -1000 to 1000",
      func:function(len){ return Fdrandom.bulk( tlen,function(){ return Fdrandom.gbowl()*1000}  ,len ) } }
    , 
    { desc:"midspiked reals with duplicates -200 to 200",
    func:function(len){ return Fdrandom.mixof( Fdrandom.bulk( Math.floor(1+len/3),function(){ return Fdrandom.gspire(-200,200)}) ,len ) } }
 ,

 { desc:"descending ints",
    func:function(len){ var ll=len; return Fdrandom.bulk( len,function(){ return --ll} ) }}

 ,
 { desc:"descending ints with maveric vals",
    func:function(len){ var ll=len; return Fdrandom.bulk( len,function(){ return --ll+Math.round(Fdrandom.gspire()*Fdrandom.gspire()*1000*Fdrandom.rbit()*Fdrandom.rbit() )} ) }}

 ,
 { desc:"ascending ints with maveric vals",
    func:function(len){ var ll=0; return Fdrandom.bulk( len,function(){ return (ll++)+Math.round(Fdrandom.gspire()*Fdrandom.gspire()*1000*Fdrandom.rbit() )} ) }}

 ,{ desc:"ascending ints",
    func:function(len){ var ll=0; return Fdrandom.bulk( len,function(){ return ll++} ) }}
 
 ]


  //~ dists=[
    //~ { desc:"huge magnitude with gaps and duplicates",
      //~ func:function(len){ return Fdrandom.mixof( Fdrandom.bulk( Math.floor(len/100+10)),function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g*g} ,len ) } }
  //~ ]
  
  conlog("Batch Testing Barsort")
  
  var sortissues=0
  var sortchecks=0
  
  for(var dsti in dists){
    var desc=dists[dsti].desc
    var func=dists[dsti].func
    for(var ttin in tlens){
            
      var tlen=tlens[ttin]
      
      var otx="\n:: "+tlen+" "+desc
      if(barchecking||(sortbenching&&!sortchecking)){ conlog(otx) }
      
      var loops=Math.floor(tloops/tlen)+1
      loops=1
      
      var tzA=[],bara=[], brfa=[]
      while(loops--){
        
        tzA=func(tlen)
        bara=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(0,100000) } )
        var st,ov ,bst,bov
        if(sub_range){
          st=Math.floor(Fdrandom.gnorm(0,tlen/4))
          ov=tlen-Math.floor(Fdrandom.gnorm(0,tlen/4))
          bst=bara[st-1],bov=bara[ov]
        }

        if(barchecking){
                            
          var barnm= Math.floor(Fdrandom.gnorm(2,tlen))
          var resol= Math.floor(Fdrandom.gnorm(2,10))
          var odesc = Fdrandom.rbit()
          
          Barsort.barassign ({
           barnum: barnm
          ,scores: tzA
          ,st:st  ,ov:ov
          ,keysbar:bara
          ,barppl:brfa
          ,resolution: bar_resolution
          ,descend:odesc
          ,secure: secure_barindex
          })
           
          if(bst!==bara[st-1]||bov!==bara[ov]){
            conlog("Indices spilt",bst,bov,bara[st-1],bara[ov])
          }
          barcheck(tzA,bara,brfa,barnm,odesc,st,ov)
        }
      
        if(sortchecking){
          var nim=Barsort.sortorder(tzA,descen,[],nopresort,nopostsort)
          
          //~ nim[1000]=10 //check 1 disordered key
          if(flawcheck){ nim[2]=5 } 
          rslt=sortcheck(tzA,nim,nopresort,descen)
          sortissues+=rslt.iss
          rslt=rslt.txt
          sortchecks++
         
          if(!rslt){ conlog(otx+" - passed sortchecks") }
          //~ if(!rslt){ conlog(otx+" - passed sortchecks"+descen?"descending":"") }
          else{ conlog(otx+ " - with issues:"); conlog(rslt) }

        }
        
        if(sortbenching){
          compar=(descen)?morethan:lessthan
          
          if(stndbench) benit({
            dat:tzA
           ,fnc:function(){ return Barsort.stndindex(tzA,descen) }
           ,nam:'stndindex'
           ,tim:benchsecs
          })
          
          
          if(sortobench) benit({
            dat:tzA
           ,fnc:function(){ return Barsort.sortorder(tzA,descen,[],nopresort,nopostsort) }
           ,nam:'sortorder'
           ,tim:benchsecs
          }) 
                    
          if(resortbench) benit({
            dat:tzA
           ,fnc:function(){ 
             return Barsort.reorder(tzA,Barsort.sortorder(tzA,descen,[],nopresort,nopostsort))
             }
           ,nam:'reorder  '
           ,tim:benchsecs
          }) 

          if(fasortbench) benit({
            dat:tzA
           ,fnc:function(){ return Barsort.sortorder(tzA,descen,[],nopresort,true) }
           ,nam:'sortarder'
           ,tim:benchsecs
          }) 
                              
          if(timsortbench) benit({
            dat:tzA
           ,fnc:function(){ return Timsort.sort(tzA.slice(),compar ) }
           ,nam:'timsort  '
           ,tim:benchsecs
          })
          
        } 
      }
    }
  }
  if(sortchecks){
    conlog("\nChecked sorts",sortchecks,"times. Saw",sortissues,"issues")
  }
}

var compar
function lessthan(a,b){ return a-b }
function morethan(a,b){ return b-a }


function dmpbarval(ado,barix ){
  var oo=[]
  for(var i=0,e=ado.length;i<e;i++){
    oo.push(barix[i]);oo.push(":"); oo.push(ado[i]); oo.push(" ")
  }
  console.log(oo.join(""))
}

//~ outbydex(ado,barx)
//~ outbybar(ado,barix,barassign )

function barcheck(valz,brvl,brfq,barnm,odesc,st,ov){
  
  st=st||0, ov=ov||valz.length
  
  odesc=odesc||false

  var otxt="Checked "+barnm+" Bars."
  if(odesc) otxt+=" (dscnd)"
  var brfst=sstats(brfq) 
  otxt+=" Bar popls: "+brfst.lw+" to "+brfst.hi
  
  var chex=Barsort.stndindex(valz)
  var ern=0,ersu=0, cch=-1,dch=-1 ,maxmis=0,miz
  
  for(var c=0,e=valz.length;c<e;c++){
    
    if(chex[c]>=st&&chex[c]<ov){
      cch=dch, dch=chex[c]
      brfq[brvl[chex[c]]]-- 
    }
    
    if(cch>0){
      if(odesc){
        if(brvl[cch]<brvl[dch]&&valz[cch]>valz[dch]){ //maybe fix here >
          ern++,ersu+=(miz=Math.abs(brvl[cch]-brvl[dch]))
          if(miz>maxmis)maxmis=miz
        }
      }else{
        if(brvl[cch]>brvl[dch]&&valz[cch]<valz[dch]){
          ern++,ersu+=(miz=Math.abs(brvl[cch]-brvl[dch]))
          if(miz>maxmis)maxmis=miz
        }
      }
    }
  }
  
  brfst=sstats(brfq)
  if(brfst.lw!=0&&brfst.hi!=0) otxt+="where off by: "+brfst.lw+" to "+brfst.hi
  if(ersu) {
    conlog(ern+" Missedbars by "+(ersu/ern).toFixed(2)+" per bar,"+maxmis+" max")
    if(detail_missbars){
      var zoe=" ["
      for(var i=0;i<8;i++){ zoe+= brvl[chex[i]]+":"+valz[chex[i]]+", " }
      zoe+="\n ...."
      for(var e=chex.length,i=e-7;i<e;i++){ zoe+= brvl[chex[i]]+":"+valz[chex[i]]+", " }
      conlog(zoe)
    }
    
  }else{ otxt+=" Bar Order is clean" }

  conlog(otxt)

  return ersu
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


function outbydex(ado,inx){
  
  var narr=[], noff=[], nlast=-Infinity,nlat=0
  
  for(var i=0,e=ado.length;i<e;i++){
    nlat=ado[inx[i]]||-1
    //~ narr.push( nlat.toFixed(4) ) 
    if(nlat<nlast){ noff.push( "ix"+i+":"+nlat.toFixed(4)+"!>="+nlast.toFixed(4)+" " ) }
    nlast=nlat
  }
  //~ console.log(narr.join(" "))
  if(noff.length){ 
    console.log(noff.length,"wrongways")
    console.log("index len",inx.length)
   
    //~ console.log("wops",noff.join(" ")) 
  }
}



function speedtest(real_rg){
console.log("speedtests",real_rg.length)

//~ benit({
  //~ dat:real_rg
 //~ ,fnc:function(x){ Barsort.barassign (x) }
 //~ ,nam:'js sort'
 //~ ,tim:8
//~ })

benit({
  dat:real_rg
 ,fnc:function(x){ Barsort.stndindex(x) }
 ,nam:'stndindex'
 ,tim:8
})

benit({
  dat:real_rg
 ,fnc:function(x){ Barsort.sortorder(x) }
 ,nam:'barsort'
 ,tim:8
})


benit({
  dat:real_rg
 ,fnc:function(x){ Barsort.stndindex(x) }
 ,nam:'stndindex'
 ,tim:8
})

}



function benit(p){
  var tsa=p.dat, r=[]
  var ii=0 ,le=tsa.length*p.mulz||1
  
  bench( 
    function(){ 
      for(var i=0;i<tsa.length;i++){ r[i]=tsa[ii=(ii<le)?ii+1:0] }
      p.fnc(r)
    }
    ,p.tim
    ,p.nam, 0
  ) 
}

