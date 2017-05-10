//  ~   Barsortjs - Fast full or range sorting of large arrays   ~  + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 

var Barsortfactory = function(){ return (function(){ 
  'use strict'

  var _cntofsub=[],_destrema=[],_destosub=[]
  var wkcnt=0,wkcyc=100 //these count use of arrays

  function version(){ return "0.6.0" }

  function ranges(pr){ //barnum:,scores:,st:,ov:,keysbar:,barfreq:,burnscore:
    
    var barnm  = pr.barnum
       ,scores = pr.scores
       ,barndx = pr.keysbar||[]
       ,sectppl= pr.barpopl
       ,st=pr.st||0 
       ,ov=pr.ov||scores.length
       ,resol=pr.resolution||5  //over sample x5
       
    if(!pr.burnscore){  //clone score
      scores=[]
      for(var i=st; i<ov; i++){
        scores[i]=pr.scores[i]
      }
    }
    
    var avg=-0 , val=-0 ,nb=ov-st
    
    var minv=scores[st],maxv=scores[st] 
    var lowex=-281474976710656
    
    for(var i=st; i<ov; i++) //need to max,min 
    { 
      ///this is setup before histosort
      //~ var j=dlns[st]
      //~ val=Math.sqrt(
        //~ jote.x[j]*jote.x[j]+jote.y[j]*jote.y[j]+jote.z[j]*jote.z[j]
      //~ )
      if(!(scores[i]>lowex)){ scores[i]=lowex }  //but score should not be NaN!
      val=scores[i]||0 
      avg+=val
      if (val>maxv){ maxv=val }
      if (val<minv){ minv=val }
    }
     
    avg/=nb, avg-=minv, maxv-=minv

    var hiv=0,havg=-0 // highvals, highavg
    
    for(var i=st; i<ov; i++) 
    { val=scores[i]-=minv 
      if(val>avg){ hiv++;havg+=val }
    }
   
    var qhi=2*havg/hiv  //prelim estimate of good maxv
    if(qhi>=maxv){ qhi=maxv*0.99999999 } //(not used)
                                         //maxv is used... 
    var subdvn=resol*barnm
    
    //~ console.log(subdvn)
    //recycle these temp arrays
    //var _cntofsub=new Array(subdvn), _destosub=new Array(subdvn)
    
    if( _cntofsub.length<subdvn 
     ||( wkcnt++>wkcyc && _cntofsub.length>subdvn) ){
      _cntofsub = new Array(subdvn) 
      _destosub = new Array(subdvn)
      wkcnt=0
    } //just maintaining workspace arrays here ...
    for(var ch=0; ch<subdvn; ch++){ _cntofsub[ch]=0 }
    if (_destrema.length<barnm){ _destrema=new Array(barnm) }
    for(var ch=0; ch<barnm; ch++){ _destrema[ch]=0 }
    
    for(var i=st; i<ov; i++){
      
      val=Math.floor(subdvn*scores[i]/maxv)
      val=(val<subdvn)?val:subdvn-1    //to opt this out increase maxv ?
                                     //no, maxv is set deliberately low
      _cntofsub[scores[i]=val]++    //! scores is written here
      
    }
    
    var rlbar=(nb/barnm)
       ,fllbar=0,fldbar=0,spills=[]
       ,nxtcap=rlbar+0.5, fcap=Math.floor(nxtcap)
    //largest subdv is sometimes getting a key - fixit....
    
    //determining sub anchors to bar anchors  (anchor is first address)
    //~ console.log("subdvn:",subdvn,'barnm:',barnm)
    //~ 
    
    for(var sub=0; sub<subdvn; sub++){
      
      _destosub[sub]=fllbar            //_cntofsub bar sub goes to dest[fllbar]
      _destrema[fllbar]+=_cntofsub[sub]  //_destrema[fllbar] gets population of bar sub

      while(_destrema[fllbar]>=fcap){
        _destrema[fllbar+1]+=_destrema[fllbar]-fcap
        _destrema[fllbar]=fcap
        fllbar++
        nxtcap+=rlbar-fcap
        fcap=Math.floor(nxtcap)
        //~ if(fllbar-fldbar>1){ spills.push(fldbar); fldbar++ }
      }
      //~ fldbar=fllbar
    }
      
    //_cntofsub[h] is the freq of sub 
    //_destrema[fillit] is capacity of bars
       
    //_destrema is parallel to sectppl
    //_destrema must empty but sectppl wants returned
    //ceil of _destrema is complicated here by dvrems fraction..
    if(sectppl)
    { for(var i=0;i<barnm;i++){ sectppl[i]=_destrema[i] } }
    
    for(var i=st; i<ov; i++){ 
      var subposi=scores[i]
      
      while(_destrema[_destosub[subposi]]===0){ _destosub[subposi]++ }
      _destrema[_destosub[subposi]]--
      barndx[i]=_destosub[subposi]
    }
    
    
    //~ var spa,spb
    //~ for(var s=0,e=spills.length;s<e;s++){
      //~ if(spills[s]+1===spills[s+1]){
        //~ spa=s
        //~ while(spills[++s]+1===spills[s+1]){
          //~ spb=s 
        //~ }
      //~ }
    //~ }
    
  }
  
  function stndindex(Ai,Ax){
    
    if(!Ax||Ax.length<Ai.length){
      Ax=new Array(Ai.length)
      for (var i=0,e=Ai.length; i<e; i++) Ax[i] = i
    }
    
    Ax.sort( function (a, b) { return Ai[a] - Ai[b] } )
    
    return Ax
  }
  
  function fullindex(Ai){
    
    var barlen=16, reso=16
    var bars=Math.ceil(Ai.length/barlen)+1
    
    var barix=[],barpopl=[]
    
    ranges({
      barnum: bars
     ,scores: Ai
     //~ ,st:,ov:
     ,keysbar:barix
     ,barpopl:barpopl 
     ,savscore:1
     ,resolution:reso
    })
            
    //~ console.log("barx",barix.length,barpopl)

    barix=barstoix(barix,barpopl)

        
    if(!insertndx(Ai,barix)){
      barix=stndindex(Ai,barix)
    }
  
    return barix
  }
  
  
  function barstoix(barix,bfill){
    
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
    
    
  function insertndx(Av,Ax){ 
    
    var lim=0, limlim=200000*Ax.length //bails at *100k
    //~ if(!Ax){ 
      //~ Ax=new Array(Av.length)
      //~ for(var e=Ax.length,c=0;c<e;c++){ Ax[c]=c}
    //~ }
    
    for(var e=Ax.length ,dueway=1 ;dueway<e; dueway++){
      var pick = Ax[dueway],pv=Av[pick]
      var bacway =dueway-1
      while( bacway>=0 && Av[Ax[bacway]] > pv){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway = bacway - 1
      }
      lim+=pick-bacway-1
      Ax[bacway+1] = pick                     //put pick down
      if(lim>limlim){ 
        console.log("bail"); 
        return false }
    }

    return true
  }
  
 
  function insertndxx(Av,Ax){ 
    
    var lim=0, limlim=200000*Ax.length //bails at *100k
    var ej=Ax.length, ek=Math.floor(ej*0.375)
    
    for(var bacway=0,dueway=1 ;dueway<ej; bacway=dueway++){
      var pick = Ax[dueway], pv=Av[pick] 
      if( dueway<ek && pv > Av[Ax[ej-dueway]] )
      { pick=Ax[ej-dueway]
        pv=Av[pick] //?
        Ax[ej-dueway]=Ax[dueway] 
        if( pv > Av[Ax[ek+dueway]] ) 
        { Ax[dueway]=pick  //dueway is  free/overwritten by pick
          pick=Ax[ek+dueway]
          Ax[ek+dueway]=Ax[dueway]
        }
      }
      while( bacway>=0 && Av[Ax[bacway]] > pv){ //if pick is smaller
        Ax[bacway+1] = Ax[bacway--]              //move move them up
      }
      lim+=pick-bacway-1
      if(lim>limlim){ 
        console.log("bail"); 
        return false 
      }

      Ax[bacway+1] = pick        //put pick down its larger
    }
  }
   
    
  return{
     bars      : ranges
    
    ,fullindex : fullindex
    ,insertndx : insertndx
    ,stndindex : stndindex
    
    ,barstoix  : barstoix
    ,version   : version 
  }

}())}


var mdname='Barsort', facfnc=Barsortfactory
if (typeof exports !== 'undefined') 
{ if (typeof module !== 'undefined' && module.exports)
  { exports = module.exports = facfnc({}) }
  else { exports[mdname] = facfnc({}) }
} else {
  if (typeof define === 'function' && define.amd) 
  { define( mdname,[],function(){return facfnc({})} ) }
  else
  { (1,eval)('this')[mdname] = facfnc({}) } 
}
