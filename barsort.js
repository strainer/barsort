//  ~   Barsortjs - Fast full or range sorting of large arrays   ~  + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 

var Barsortfactory = function(){ return (function(){ 
  'use strict'

  function version(){ return "0.8.0" }


  var _cntofsub=[],_destrema=[],_destosub=[]
  var wkcnt=0,wkcyc=100 //these count use of arrays


  function barindex(pr){ //barnum:,scores:,st:,ov:,keysbar:,barfreq:,burnscore:
    
    var scores = pr.scores
       ,st     = pr.st||0 
       ,ov     = pr.ov||scores.length
       ,barnm  = pr.barnum
       ,resol  = pr.resolution||5  //over sample x5
       ,kysbar = pr.keysbar        //bari into kysbar[st..ov]
       ,barppl = pr.barppl
  
    if(pr.secure){
      var ixkeys=stndindex(scores)  //unoptimal without st,ov
                                //this should leave original scores untouched
      var barsiz=(ov-st)/barnm, dubar=0, barppl=barppl||[]
      for(var i=0;i<barnm;i++){ barppl[i]=0 }
      for(var c=0,e=ixkeys.length;c<e;c++){
        if(ixkeys[c]>=st&&ixkeys[c]<ov){
          var cbr=Math.round(dubar++/barsiz)
          kysbar[ixkeys[c]]= cbr 
          barppl[cbr]++ 
        } 
      } 
      return
    }else{
      if(!pr.burnscore){  //clone score
        scores=[]
        for(var i=st; i<ov; i++){
          scores[i]=pr.scores[i]  //eventually slice this and offset ix for reads
        }
      }
    }
    
    var smnm=0, qvl=-0 ,nb=ov-st
    
    var minv=scores[st] ,maxv=minv ,minv2=minv ,maxv2=minv 
    var lowex=-281474976710656 //-2^48

    var delt=0,delt2=0,mean=0,me2=0 
    
    for(var i=st; i<ov; i++) //need to max,min 
    { 
      if(!(scores[i]>lowex)){ scores[i]=lowex }  //but score should not be NaN!
      qvl=scores[i]||0 
      
      if (qvl>maxv){ if (qvl>maxv2){ maxv=maxv2, maxv2=qvl }else{ maxv=qvl } 
      }else if (qvl<minv){ if (qvl<minv2){ minv=minv2, minv2=qvl }else{ minv=qvl } }
          
      //variance.. welfords alg
      smnm++	
      delt = qvl - mean
      mean += delt/smnm
      delt2 = qvl - mean
      me2 += delt*delt2	

    }
    
    var sdev=Math.sqrt( me2/(smnm-1) )
    
    var maxy=mean+sdev*3.5, miny=mean-sdev*3.5
    
    //~ console.log("minmax",miny,maxy)
    
    if(maxy>maxv) maxy=maxv
    if(miny<minv) miny=minv
    
    var subdvn=resol*barnm-1
    var qun=(subdvn-1)/(maxy-miny)
   
    if(pr.descend){
      //~ console.log("minmax",miny,maxy)
      for(var i=st; i<ov; i++) 
      { qvl= maxy-scores[i] 
        qvl=Math.floor(qun*qvl+1)
        //~ console.log(qvl)
        scores[i]=qvl<0? 0:qvl>subdvn? subdvn:qvl
        //~ console.log(scores[i])
      }
    }else{
      for(var i=st; i<ov; i++) 
      { qvl= scores[i]-miny 
        qvl=Math.floor(qun*qvl+1)
        scores[i]=qvl<0? 0:qvl>subdvn? subdvn:qvl
      }
    }
    
    subdvn++  //true number of subdivisions
    
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

    for(var i=st; i<ov; i++){  _cntofsub[scores[i]]++  } ///...
    
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
       
    //_destrema is parallel to barppl
    //_destrema must empty but barppl wants returned
    //ceil of _destrema is complicated here by dvrems fraction..
    if(barppl) //clone to this array if it was supplied
    { for(var i=0;i<barnm;i++){ barppl[i]=_destrema[i] } }
    
    for(var i=st; i<ov; i++){ 
      var subposi=scores[i]
      
      while(_destrema[_destosub[subposi]]<1){ 
        _destrema[_destosub[subposi]]--
        _destosub[subposi]++ 
      }
      _destrema[_destosub[subposi]]--
      kysbar[i]=_destosub[subposi] /// /// /// business line
    }
    
    return _destrema 
  }
  
  
  
  function barstoix(Ax,bfill,st,ov){
    
    st=st||0, ov=ov||Ax.length
    
    var rfill=bfill[0]; bfill[0]=0
    for(var i=0,e=bfill.length-1; i<e; i++) {
      var c=bfill[i+1]
      bfill[i+1]=rfill
      rfill+=c
    }
    
    var ind=Ax.slice(st,ov)
    
    for(var i=0,e=ov-st; i<e; i++){
      Ax[st+bfill[ind[i]]++ ]=i+st
    }

    return Ax
  }
    
  
  function fullindex(Av,Ax,skiptry,skipfix){
    
    if(!skiptry){ //try insertsort
      Ax =Ax||ixArray(Av)
      var srslt, trys=1, tryt=2, bx=0

      while ( (srslt=insertndx(Av,Ax,tryt,bx)).bk < Ax.length){
        if(srslt.du<Ax.length*(trys/5)) break
        bx=srslt.du,trys++
      }
      if(srslt.bk===Av.length){ return Ax }
    }else{
      Ax=Ax||new Array(Av.length)
    }

    var barlen=16, reso=8
    var bars=Math.ceil(Av.length/barlen)+1 
    var barppl=new Array(bars)
    
    //~ console.log("Barlen:",barlen,"reso:",reso)
      
    var rgallocs=barindex({
      barnum: bars
     ,scores: Av     //will be copied if no burnscore:true
     //~ ,st:,ov:
     ,keysbar:Ax
     ,barppl:barppl 
     ,savscore:1
     ,resolution:reso
     ,secure:false
     //~ ,secure:true
    })
            
    Ax=barstoix(Ax,barppl) //barppl gets 'integralled' here
    //~ inslim=16
    var st=0,ov=0, revs=1, srslt
    var inbreak=64, inslimit=skipfix?72:96
    
    if(skipfix) return Ax
    
    while(inbreak++<inslimit && (srslt=insertndx(Av,Ax,inbreak>>>4,st)).bk<Ax.length){ 
      
      //~ console.log("inbroke, bak:",srslt.bk,"to:",srslt.du)
      var cmbspan=Math.floor((srslt.du-srslt.bk)*1.5)
        , maxspan=Math.floor(Ax.length*0.01)+1000

      st=srslt.du-cmbspan ,ov=srslt.du+cmbspan*2
      
      st=ctain(st,0,Ax.length) ,ov=ctain(ov,0,Ax.length)
      
      var aswps,sswps
      aswps =strafe(Av,Ax,st,ov,Math.floor((ov-st)*0.6)) 
      aswps+=strafe(Av,Ax,st,ov,Math.floor((ov-st)*0.3)) 
      sswps=aswps*=0.4
      
      //~ console.log("swaps there:",aswps,"(",st,"to",ov,")")
      
      if(aswps>0.1){
        do{
          cmbspan=Math.floor(cmbspan*1.45), 
          st=srslt.du-cmbspan ,ov=srslt.du+cmbspan*2
          st=ctain(st,0,Ax.length) ,ov=ctain(ov,0,Ax.length)
          
          aswps=sswps*0.9
          sswps=strafe(Av,Ax,st,ov)
          //~ console.log("scanning:",ov-st,"swaps:",sswps)
         
        }while( sswps>aswps*0.8 && cmbspan<maxspan)
        
        if(sswps){
          var rr=combubble(Av,Ax,st,ov)
          //~ console.log("fullcombed:",st,"to",ov,"(ttl:",ov-st)
          //~ console.log("scored:",rr,"lowvs:",Av[Ax[0]],Av[Ax[1]])
        }
      } 
    }
  
    if((!skipfix)&&inbreak>=inslimit){ 
      console.log("falledback")
      stndindex(Av,Ax) 
    }
    //~ else{console.log(inbreak,":brks<lim:",inslimit)}
    
    return Ax
  }

  function ctain(a,b,c){
    if(a<b) return b
    if(a>c) return c
    return a
  }
  
  function stndindex(Ai,Ax){
    
    if(!Ax||Ax.length<Ai.length){
      Ax=new Array(Ai.length)
      for (var i=0,e=Ai.length; i<e; i++) Ax[i] = i
    }
    
    Ax.sort( function (a, b) { return Ai[a] - Ai[b] } )
    
    return Ax
  }

  function ixArray(A){
    var Ar=new Array(A.length)
    for(var c=0,e=Ar.length; c<e; c++){ Ar[c]=c}
    return Ar
  }
    
  function insertndx(Av,Ax,limlim,s){ 
    if(s===undefined) s=1
    //~ console.log("starting:",s)
    var lim=0, limlim=(limlim||20)*Ax.length
    
    for(var e=Ax.length ,dueway=s ;dueway<e; dueway++){
      var pickx = Ax[dueway],pickv=Av[pickx]
      var bacway =dueway-1
      while( bacway>=0 && Av[Ax[bacway]] > pickv){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway = bacway - 1
      }
      lim+=dueway-bacway
      Ax[bacway+1] = pickx                     //put pickx down
      if(lim>limlim){ 
        //~ console.log("insert bail:",dueway-1); 
        return {bk:bacway,du:dueway} }
    }
     
    return {bk:dueway,du:dueway}
  }
   
  function strafe(Av,Ax,s,e,j){
    
    var jmp=j||Math.floor((e-s)*0.5)
    var t=0,cnt=0 
       ,jmpb=Math.floor(jmp*0.28)
       ,jmpc=Math.floor(jmp*0.98)
    
    for(var cc=s ,es=e-jmp; cc<es; cc++) //or2
    { 
      var cd=cc+jmpb ,ce=cc+jmpc ,jd=cc+jmp 
      if( Av[Ax[cc]] > Av[Ax[cd]] ){ t=Ax[cc],Ax[cc]=Ax[cd],Ax[cd]=t }
      if( Av[Ax[cd]] > Av[Ax[ce]] ){ t=Ax[cd],Ax[cd]=Ax[ce],Ax[ce]=t }
      if( Av[Ax[cc]] > Av[Ax[jd]] ){ t=Ax[cc],Ax[cc]=Ax[jd],Ax[jd]=t,cnt++ }
    }	
    return cnt/(e-s)
    //~ return cnt
  }
     
  function combubble(Av,Ax,s,e,jmp){
    
    var r=0
    s=s||0,e=e||Av.length 
    for( jmp=jmp||(e-s)*0.66667 ;jmp>70; jmp=jmp*0.6667){
         
      var jmpa=Math.floor(jmp)
         ,jmpb=Math.floor(jmp*0.28)
         ,jmpc=Math.floor(jmp*0.98),t=0
         
      for(var cc=s ,es=e-jmpa; cc<es; cc+=1) //or2
      { 
        var cd=cc+jmpb ,ce=cc+jmpc ,jd=cc+jmpa 
        if( Av[Ax[cc]] > Av[Ax[cd]] ){ t=Ax[cc],Ax[cc]=Ax[cd],Ax[cd]=t }
        if( Av[Ax[cd]] > Av[Ax[ce]] ){ t=Ax[cd],Ax[cd]=Ax[ce],Ax[ce]=t,r++ }
        if( Av[Ax[cc]] > Av[Ax[jd]] ){ t=Ax[cc],Ax[cc]=Ax[jd],Ax[jd]=t,r++ }
      }
    
    }
    return r
  } 
    
    
  return{
     barindex  : barindex
    
    ,fullindex : fullindex
    ,stndindex : stndindex
    ,insertndx : insertndx
    
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
