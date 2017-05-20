require ('../dlib/mutil.js')
Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')
Timsort=require('O:/hub/lead/node-timsort/build/timsort.min.js')

//~ var tlen=15000000
var tlen=2000000

console.log((tlen*8/1000000).toFixed(0),"megabyte test array")

//hard distribution >
//~ var real_rg=Fdrandom.mixof( Fdrandom.bulk( 30000,function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g } ) ,tlen )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.gthorn()*Fdrandom.gthorn()*1000 } )

var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.gbowl()*1000) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.f48()*1000 } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) } )

//stinger >
//~ real_rg.push(100000000000)

//~ speedtest(real_rg)
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
for(var i=0;i<1;i++){

var sx=Fdrandom.mixup(ado)
//~ nim = Timsort.sort(ado)
//~ return
//~ nim = Barsort.stndindex(ado)
nim = Barsort.fullindex(ado)

}
//~ return
outbydex(ado,nim)
console.log(nim[16],nim[17],nim[15])
//console.log(nim)
//~ var barx=barbtoinx(barix,barfeq)

//~ console.log(nim[0])
return


function dmpbarval(ado,barix ){
  var oo=[]
  for(var i=0,e=ado.length;i<e;i++){
    oo.push(barix[i]);oo.push(":"); oo.push(ado[i]); oo.push(" ")
  }
  console.log(oo.join(""))
}

//~ outbydex(ado,barx)
//~ outbybar(ado,barix,bars)


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
   
    //~ console.log("wops",noff.join(" ")) 
  }
}
