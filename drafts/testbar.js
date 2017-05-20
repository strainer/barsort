require ('../dlib/mutil.js')
Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')
Timsort=require('O:/hub/lead/node-timsort/build/timsort.min.js')

//~ var tlen=15000000
var tlen=27

console.log((tlen*8/1000000).toFixed(0),"megabyte test array")

//~ var zum=0,int_riser=Fdrandom.bulk( tlen,function(){return zum+++Fdrandom.irange(0,2)} )

var real_rg=Fdrandom.mixof( Fdrandom.bulk( 30000,function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g} ) ,tlen )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.gthorn()*Fdrandom.gthorn()*1000 } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.gbowl()*1000) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.dbl()*1000) } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.f48()*1000 } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) * Fdrandom.range(1,60) * Fdrandom.range(1,600) * Fdrandom.range(1,6000) *Fdrandom.range(1,60000)  *Fdrandom.range(1,600000) *Fdrandom.range(1,600000) } )
//~ real_rg.push(100000000000)


var ado =real_rg
var bars =8, reso=8, barix=[],barfrq=[] 
Barsort.bars({
 barnum: bars
,scores: ado
//~ ,st:,ov:
,keysbar:barix
,barfreq:barfrq
,savscore:1
,resolution:reso
//~ ,secure:true
})


checkbybar(ado,barix,bars)

var sx=Fdrandom.mixup(ado)


function dmpbarval(ado,barix ){
  var oo=[]
  for(var i=0,e=ado.length;i<e;i++){
    oo.push(barix[i]);oo.push(":"); oo.push(ado[i]); oo.push(" ")
  }
  console.log(oo.join(""))
}


function checkbybar(ado,barix,bars){
  
  var narr=[], noff=[], nlast=-1,nlat=0
  
  var wbars=[]
  
  for (var br=0; br<bars; br++)
  { var cbars=[]
    for(var i=0,e=ado.length;i<e;i++){
      if(barix[i]===br) { cbars.push(ado[i])}
    }
    cbars.sort( function (a, b) { return a - b } )
    wbars.push(cbars)
    var tz=""
    if(br>0&&wbars[br-1][wbars[br-1].length-1]>wbars[br][0]){
      tz="x" }
    console.log(tz,cbars.join(" "))
  }

}


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
  if(noff.length){ console.log("errors",noff.length) }
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
