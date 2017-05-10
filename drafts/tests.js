require ('../dlib/mutil.js')
Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')
Timsort=require('O:/hub/lead/node-timsort/build/timsort.min.js')

//~ var tlen=15000000
var tlen=10000

console.log((tlen*8/1000000).toFixed(0),"megabyte test array")

//~ var zum=0,int_riser=Fdrandom.bulk( tlen,function(){return zum+++Fdrandom.irange(0,2)} )

var real_rg=Fdrandom.mixof( Fdrandom.bulk( 15,function(){return Fdrandom.irange(0,100)*Fdrandom.irange(0,100000)} ) ,tlen )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.gthorn()*Fdrandom.gthorn()*1000 } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.gbowl()*1000) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.dbl()*1000) } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.f48()*1000 } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) * Fdrandom.range(1,60) * Fdrandom.range(1,600) * Fdrandom.range(1,6000) *Fdrandom.range(1,60000)  *Fdrandom.range(1,600000) *Fdrandom.range(1,600000) } )
//~ real_rg.push(100000000000)

//~ speeds(real_rg)
//~ return


Fdrandom.repot("1")

  //~ bars  : bars
  //~ ,sortindex : sortindex
  //~ ,insertndx : insertndx
  //~ ,stndindex : stndindex

//~ var small_rg=Fdrandom.bulk( 40,function(){ return Fdrandom.gskip()*1000 } )

var ado=real_rg 
var bars=ado.length
var barix=[],barfeq=[]

var nim=[]
//~ var nim = Barsort.fullindex(ado)
for(var i=0;i<2000;i++){
var sx=Fdrandom.mixup(ado)

//~ nim = Timsort.sort(ado)
//~ return
//~ nim = Barsort.stndindex(ado)
nim = Barsort.fullindex(ado)

//~ nim = Barsort.fullindex(ado)
}
//~ return
outbydex(ado,nim)
console.log(nim[16],nim[17],nim[15])
//console.log(nim)
//~ var barx=barbtoinx(barix,barfeq)

//~ console.log(nim[0])
return


Broad.bars({
 barnum: bars
,scores: ado
//~ ,st:,ov:
,keysbar:barix
,barfreq:barfeq
,savscore:1
,resolution:1
})


function dmpbarval(ado,barix ){
  var oo=[]
  for(var i=0,e=ado.length;i<e;i++){
    oo.push(barix[i]);oo.push(":"); oo.push(ado[i]); oo.push(" ")
  }
  console.log(oo.join(""))
}

outbydex(ado,barx)
outbybar(ado,barix,bars)
return


function outbybar(ado,barix,bars){
  
  var narr=[], noff=[], nlast=-1,nlat=0
  
  for (var br=0; br<bars; br++)
  {
    for(var i=0,e=ado.length;i<e;i++){
      if(barix[i]===br) { nlat=ado[i]; narr.push(ado[i].toFixed(4)) }
      if(nlat<nlast){ noff.push( nlat.toFixed(4)+"<"+nlast.toFixed(4)+" " ) }
      nlast=nlat
    }
  }
  console.log(narr.join(" "))
  if(noff.length){ console.log("wops",noff.join(" ")) }
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
   
    console.log("wops",noff.join(" ")) 
  }
}

return

function speeds(real_rg){
console.log("speedtests",real_rg.length)

//~ benit({
  //~ dat:real_rg
 //~ ,fnc:function(x){ Barsort.bars(x) }
 //~ ,nam:'js sort'
 //~ ,itr:8
//~ })

benit({
  dat:real_rg
 ,fnc:function(x){ Barsort.stndindex(x) }
 ,nam:'stndindex'
 ,itr:8
})

benit({
  dat:real_rg
 ,fnc:function(x){ Barsort.fullindex(x) }
 ,nam:'barsort'
 ,itr:8
})


benit({
  dat:real_rg
 ,fnc:function(x){ Barsort.stndindex(x) }
 ,nam:'stndindex'
 ,itr:8
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
    ,p.itr
    ,p.nam, 0
  ) 
}

