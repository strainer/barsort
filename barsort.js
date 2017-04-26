//  ~ Broadsortjs - Fast full or bucket sorting of large arrays ~   + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 


var Barsortfactory = function(){ return (function(){ 
  'use strict'
  
  var cntofsub=[],destroom=[],destofsub=[]
  var wkcnt=0,wkcyc=100 //these count use of arrays

  
  //results into these arrays sect_at_dlsi, valq_at_dlsi, sectppl
  //                          bar_of_source, score_of_source, barppl
  
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
    
    var barix=[],barfrq=[]
    
    ranges({
      barnum: bars
     ,scores: Ai
     //~ ,st:,ov:
     ,keysbar:barix
     ,barfreq:barfrq
     ,savscore:1
     ,resolution:reso
    })
        
    barix=barstoix(barix,barfrq)
    
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
  
  
  //function bars(barnm,st,ov, barndx, scores, sectppl, dupe){
  function ranges(p){ //barnum:,scores:,st:,ov:,keysbar:,barfreq:,savscore:
    
    var barnm= p.barnum
       ,scores=p.scores
       ,st=p.st||0,ov=p.ov||scores.length
       ,barndx=p.keysbar||[]
       ,sectppl=p.barfreq||[]
       ,resolution=p.resolution||5  //over sample x5
       
    if(!p.burnscore){
      scores=[]
      for(var i=st; i<ov; i++){
        scores[i]=p.scores[i]
      }
    }
    
    var avg=-0 , val=-0 ,nb=ov-st
    
    var minv=scores[st],maxv=scores[st] 
    
    for(var i=st; i<ov; i++) //need to max,min 
    { 
      ///this is setup before histosort
      //~ var j=dlns[st]
      //~ val=Math.sqrt(
        //~ jote.x[j]*jote.x[j]+jote.y[j]*jote.y[j]+jote.z[j]*jote.z[j]
      //~ )
      if(isNaN(scores[i])) scores[i]=0
      val=scores[i]||0
      avg+=val
      if (val>maxv){ maxv=val }
      if (val<minv){ minv=val }
    }
     
    avg/=nb, avg-=minv, maxv-=minv

    var hiv=0,havg=-0
    
    for(var i=st; i<ov; i++) 
    { val=scores[i]-=minv 
      if(val>avg){ hiv++;havg+=val }
    }
   
    var qhi=2*havg/hiv  //prelim estimate of good maxv
    if(qhi>=maxv){ qhi=maxv*0.99999999 } //(not used)
                                         //maxv is used... 
    var subdvn=resolution*barnm
    
    //~ console.log(subdvn)
    //recycle these temp arrays
    //var cntofsub=new Array(subdvn), destofsub=new Array(subdvn)
    
    if (cntofsub.length<subdvn 
     ||(wkcnt++>wkcyc&&cntofsub.length>subdvn)){
      cntofsub   = new Array(subdvn) 
      destofsub = new Array(subdvn)
      wkcnt=0
    }
    
    for(var ch=0; ch<subdvn; ch++){ cntofsub[ch]=0 }
    
    if (destroom.length<barnm){ destroom=new Array(barnm) }
    
    for(var ch=0; ch<barnm; ch++){ destroom[ch]=0 }
    
    for(var i=st; i<ov; i++){
      
      val=Math.floor(subdvn*scores[i]/maxv)
      val=(val<subdvn)?val:subdvn-1    //to opt this out increase maxv ?
                                     //no, maxv is set deliberately low
      cntofsub[scores[i]=val]++    //! scores is written here
      
    }
    
    var rlbar=(nb/barnm)
       ,fllbar=0,fldbar=0,spills=[]
       ,nxtcap=rlbar+0.5, fcap=Math.floor(nxtcap)
    
    //largest subdv is sometimes getting a key - fixit....
    
    //determining sub anchors to bar anchors  (anchor is first address)
    //~ console.log("subdvn:",subdvn,'barnm:',barnm)
    //~ 
    
    for(var sub=0; sub<subdvn; sub++){
      
      destofsub[sub]=fllbar            //cntofsub bar sub goes to dest[fllbar]
      destroom[fllbar]+=cntofsub[sub]  //destroom[fllbar] gets population of bar sub

      while(destroom[fllbar]>=fcap){
        destroom[fllbar+1]+=destroom[fllbar]-fcap
        destroom[fllbar]=fcap
        fllbar++
        nxtcap+=rlbar-fcap
        fcap=Math.floor(nxtcap)
        //~ if(fllbar-fldbar>1){ spills.push(fldbar); fldbar++ }
      }
      //~ fldbar=fllbar
    }
      
    //cntofsub[h] is the freq of sub 
    //destroom[fillit] is capacity of bars
    
    
    //destroom is parallel to sectppl
    //destroom must empty but sectppl wants returned
    //ceil of destroom is complicated here by dvrems fraction..
    for(var i=0;i<barnm;i++){ sectppl[i]=destroom[i] }
    
    for(var i=st; i<ov; i++){ 
      var hpotofi=scores[i]
      
      while(destroom[destofsub[hpotofi]]===0){ destofsub[hpotofi]++ }
      destroom[destofsub[hpotofi]]--
      barndx[i]=destofsub[hpotofi]
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
  
  function insertndx(Av,Ax){ 
    
    var lim=0
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
        lim++
      }
      Ax[bacway+1] = pick                     //put pick down
      if(lim>400000000){ return false }
    }

    return true
  }

  return{
     bars      : ranges
    ,fullindex : fullindex
    ,insertndx : insertndx
    ,stndindex : stndindex
  }

}())}

//Hopefuly exports to node, amd, commonjs or global object
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
