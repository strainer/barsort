require ('../dlib/mutilxt.js')
//~ Fdrandom=require ('../Fdrandom.min.js')
Fdrandom=Fdr=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')



var g=[2,3,4,6,7,8,9]

var b= new Uint32Array(g)

console.log(b)

return



ascending10RandomEndInt = function (n) {
  var arr = [];
  for (var i = 0; i < n; i++) {
    arr.push(i);
  }
  var endStart = n - 10;
  for (i = endStart; i < n; i++) {
    arr[i] = Math.floor(Fdr.next() * n);
  }
  return arr;
};


function wub(len){ var ll=0; return Fdrandom.bulk( len,function(){ return (ll++)+Math.round(Fdrandom.gspire()*Fdrandom.gspire()*1000*Fdrandom.rbit()*Fdrandom.rbit() )} ) }

//~ var ss=wub(4000000)
var ss=ascending10RandomEndInt(10000)

conlog(Barsort.sortorder(ss)[0])

return


//~ console.log(Barsort.sortorder([7,3,4,6]))

//~ return

var tlen=10000000, tdlen=Math.floor(tlen/16), zum=0

console.log((tlen*8/1000000).toFixed(0),"megabyte test array")

//~ var int_rise=Fdrandom.bulk( tlen,function(){return zum+++Fdrandom.irange(0,2)} )

//~ var int_rough=Fdrandom.mixof(
  //~ Fdrandom.bulk( tdlen,function(){return Fdrandom.irange(0,1000)} )
 //~ ,tlen
//~ )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.gthorn()*Fdrandom.gthorn()*1000 } )

var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.gnorm()*1000 } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.f48()*1000 } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,600) } )
//~ real_rg.push(100000000000)

console.log(Barsort.sort(real_rg,false,[],true,true)[0])
//~ console.log((real_rg.sort(function(a,b){ return a>b }))[0])

return

Fdrandom.repot("1")

  //~ bars  : bars
  //~ ,sortindex : sortindex
  //~ ,insertndx : insertndx
  //~ ,stndindex : stndindex

//~ var small_rg=Fdrandom.bulk( 40,function(){ return Fdrandom.gskip()*1000 } )

//~ Broad.histobar(barnm,st,ov, barndx, scores, sectppl, dupe)
//~ Broad.histobar(10,0,real_rg.length, [], real_rg, [], false)

//barnum:,scores:,st:,ov:,keysbar:,barfreq:,savscore:

var ado=real_rg 
var bars=ado.length
var barix=[],barfeq=[]

//~ var nim = ado.sort( function(a,b){return a-b} ) 
//~ var nim = ado.sort( function(a,b){return a-b} ) 
//~ var nim = Broad.stndindex(ado)
//~ return
var nim = Broad.fullindex(ado)
//~ var nim = Broad.stndindex(ado)

//console.log(nim)
//~ var barx=barbtoinx(barix,barfeq)

outbydex(real_rg,nim)
console.log(nim[0])
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
//~ console.log(barfeq.join(" "))

//~ console.log(barix.join(" "))

var barx=barbtoinx(barix,barfeq)
outbydex(ado,barx)
outbybar(ado,barix,bars)
return


function bartoinx(barix){
  var ind=new Array(barix.length)
  for(var i=0,e=barix.length;i<e;i++){
    ind[barix[i]]=i
  }
  return ind
}


function barbtoinx(barix,bfill){
  
  var rfill=bfill[0]; bfill[0]=0
  for(var i=0,e=bfill.length-1; i<e; i++) {
    var c=bfill[i+1]
    bfill[i+1]=rfill
    rfill+=c
  }
  
  var ind=new Array(barix.length)
  for(var i=0,e=barix.length;i<e;i++){
    ind[bfill[barix[i]]++]=i
  }
  return ind
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
  if(noff.length){ console.log("wops",noff.join(" ")) }
}

function outbydex(ado,inx){
  
  var narr=[], noff=[], nlast=-Infinity,nlat=0
  
  for(var i=0,e=ado.length;i<e;i++){
    nlat=ado[inx[i]]||-1
    //~ narr.push( nlat.toFixed(4) ) 
    if(nlat<nlast){ noff.push( nlat.toFixed(4)+"<"+nlast.toFixed(4)+" " ) }
    nlast=nlat
  }
  //~ console.log(narr.join(" "))
  if(noff.length){ console.log("wops",noff.join(" ")) }
}


return

benit({
  dat:real_rg
 ,fnc:function(x){ x.sort( function(a,b){return a-b} ) }
 ,nam:'js sort'
 ,itr:8
})


benit({
  dat:real_rg
 ,fnc:function(x){ Broad.histobar(x) }
 ,nam:'js sort'
 ,itr:8
})


function benit(p){
  var ii=0 ,le=tlen*p.mulz||1
  var tsa=p.dat, r=[]

  bench( 
    function(){ 
      for(var i=0;i<tsa.len;i++){ r[i]=tsa[ii=(ii<le)?ii+1:0] }
      p.fnc(r)
    }
    ,p.itr
    ,p.nam, 0
  ) 
}

/*
    bar
   desig
 0123456789
 0332231100   0123  bars
              3223  ppls
              0357  st pos
              
 take pos
 write increm~ord of pos
 
 take pos 0
 see bar of pos 0  = bar[0]
 determine increm or of bar  bfill[bar]++
 
 write ord of bar into bar
 <save info of bar before overwrite
 
 use that info next instead of pos+1
 will that info always be fresh?
*/
