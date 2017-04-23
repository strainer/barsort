//  ~ Broadsortjs - Fast full or bucket sorting of large arrays ~   + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 


var newBroadsort = function(){ return (function(){ //factory
  'use strict'
  
  var cntofsub=[],destroom=[],destofsub=[]
  var wkcnt=0,wkcyc=100 //these count use of arrays

  //histosort(sectn  ,st,ov, sect_at_dlsi ,valq_at_dlsi, sectppl,false)
  
  //results into these arrays sect_at_dlsi, valq_at_dlsi, sectppl
  //                          bar_of_source, score_of_source, barppl
                          
  function histobar(barnm,st,ov, barndx, scores, sectppl, dupe){
    
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
    var resolution=5  //over sample x5
    
    var subdvn=resolution*barnm
    
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
      val=(val>subdvn)?subdvn-1:val  //to opt this out increase maxv ?
                                   //no, maxv is set deliberately low
      cntofsub[valq_at_dlsi[i]=val]++
    }
    
    var dvn=nb/barnm ,dvnfl=Math.floor(dvn), dvrem=(dvn-dvnfl)*1.0000000001
       ,drem=-0, xx=(drem+dvrem)%1
       ,fillit=0
    
    for(var h=0; h<subdvn; h++){
      
      destofsub[h]=fillit        //cntofsub bar h goes to dest[fillit]
      destroom[fillit]+=cntofsub[h]  //destroom[fillit] gets population of bar h
      while(destroom[fillit]>=(dvnfl+xx)){ //if dest[f] is full, fill then carry 
        destroom[fillit+1]+=(destroom[fillit]-dvnfl-xx)  //to next 
        destroom[fillit]=dvnfl+xx                  //that fillit is full
        fillit++                                   //and will fill no more 
        drem=drem+dvrem
        if(drem<1){ xx=0 }else{ drem-=1,xx=1}
      } 
    }
    
    //destroom is parallel to sectppl
    //destroom must empty but sectppl wants returned
    //ceil of destroom is complicated here by dvrems fraction..
    for(var i=0;i<barnm;i++){ sectppl[i]=destroom[i]=Math.ceil(destroom[i]) }
    
    for(var i=st; i<ov; i++){ 
      var hpotofi=valq_at_dlsi[i]
      
      while(destroom[destofsub[hpotofi]]===0){ destofsub[hpotofi]++ }
      destroom[destofsub[hpotofi]]--
      barndx[i]=destofsub[hpotofi]
    }
    
  }
  
  return{
     histobar: histobar
  }

}())}

//Hopefuly exports to node, amd, commonjs or global object
var mdname='Broadsort', facfnc=newBroadsort
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
