//  ~   Barsortjs - Fast full or range sorting of large arrays   ~  + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 

var Barsortfactory = function(){ return (function(){ 
  'use strict'

  function version(){ return "0.9.0" }


  var _cntofsub=[],_destrema=[],_destosub=[] //these arrays reused between calls
  var wkcnt=0,wkcyc=100 //these count use of workspace arrays


  function barassign(pr){ //barnum:,scores:,st:,ov:,keysbar:,barfreq:,burnscore:
    
    var scores,pscores = pr.scores
       ,st     = pr.st||0 
       ,ov     = pr.ov||pscores.length
       ,barnm  = pr.barnum
       ,resol  = pr.resolution||5  //over sample x5
       ,kysbar = pr.keysbar        //bari into kysbar[st..ov]
       ,barppl = pr.barppl
  
    if(pr.secure){
      var ixkeys=sortorder(pscores,[],0,0,pr.descend)  //unoptimal without st,ov
                                //this should leave original scores untouched
      if(pr.ordinate) return ixkeys
      
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
    }
    
    if(!pr.burnscore){  //clone score
      scores=new Array(pscores.length)
    }else{ scores=pscores }
    
    var smnm=0, qvl=-0 ,nb=ov-st
    
    var minv=pscores[st] ,maxv=minv ,minv2=minv ,maxv2=minv 
    var lowex=-281474976710656 //-2^48

    var delt=0,delt2=0,mean=0,me2=0 
    
    for(var i=st; i<ov; i++) //need to max,min 
    { 
      if(!(pscores[i]>lowex)){ pscores[i]=lowex }  //but score should not be NaN!
      qvl=pscores[i]||0 
      
      if (qvl>maxv){ if (qvl>maxv2){ maxv=maxv2, maxv2=qvl }else{ maxv=qvl } 
      }else if (qvl<minv){ if (qvl<minv2){ minv=minv2, minv2=qvl }else{ minv=qvl } }
          
      //variance.. welfords alg
      smnm++	
      delt  = qvl - mean
      mean += delt/smnm
      delt2 = qvl - mean
      me2  += delt*delt2	

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
      { qvl=Math.floor(qun*(maxy-pscores[i]))
        //~ console.log(qvl)
        scores[i]=qvl<0? 0:qvl>subdvn? subdvn:qvl
        //~ console.log(scores[i])
      }
    }else{
      for(var i=st; i<ov; i++) 
      { 
        qvl=qun*(pscores[i]-miny )
        scores[i]=qvl<0? 0: qvl>subdvn? subdvn: qvl>>>0
      }
    }
    
    subdvn++  //true number of subdivisions
    
    //~ console.log(subdvn)
    //recycle these temp arrays
    //var _cntofsub=new Array(subdvn), _destosub=new Array(subdvn)
    
    if( true || _cntofsub.length<subdvn 
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
        //~ fcap=Math.floor(nxtcap)
        fcap=nxtcap >>>0
        //~ if(fllbar-fldbar>1){ spills.push(fldbar); fldbar++ }
      }
      //~ fldbar=fllbar
    }
      
    //_cntofsub[h] is the freq of sub 
    //_destrema[fillit] is capacity of bars
       
    //_destrema is parallel to barppl
    //_destrema must empty but barppl wants returned
    //ceil of _destrema is complicated here by dvrems fraction..
    
    if(pr.ordinate){  //write ordinals into kysbar instead of bars
      var bapos=[0]   //barAnchorPositions
      for(var i=0;i<barnm-1;i++){ bapos[i+1]=bapos[i]+_destrema[i] }
    
      for(var i=st; i<ov; i++){ //not st ov capable
        var subposi=scores[i]
        
        while(_destrema[_destosub[subposi]]===0){ 
          //_destrema[_destosub[subposi]]--
          _destosub[subposi]++ 
        }
        _destrema[_destosub[subposi]]--
        kysbar[bapos[_destosub[subposi]]++ ]=i  //i know its crazy, but its true
      }
    }else{ 
      if(barppl) //this array is used by an external callee
      { for(var i=0;i<barnm;i++){ barppl[i]=_destrema[i] } }

      for(var i=st; i<ov; i++){ 
        var subposi=scores[i]
        
        while(_destrema[_destosub[subposi]]===0){ 
          //~ _destrema[_destosub[subposi]]--
          _destosub[subposi]++ 
        }
        _destrema[_destosub[subposi]]--
        kysbar[i]=_destosub[subposi] /// /// /// business line
        
      }
    }
    
    return _destrema //this was used for checking but is not used now
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
    
  function fliparray(A){
    for(var e=A.length-1,i=(e+1)>>>1,sw=A[i]; i<=e; i++){
      sw=A[i], A[i]=A[e-i], A[e-i]=sw
    }
    return A
  }
    
  var compar
  function lessthan(a,b){ return a<b }
  function morethan(a,b){ return a>b }
  
  function sortorder(Av,desc,Ax,skiptry,skipfix){
    //conlog("doing sortorder",desc)
    
    var flipp=false, Alen=Av.length
    if((!skiptry)&&Alen>10){
      
      var up=0,dw=0, samp=ntain(Alen>>>3,8,Alen)
            
      var dd,bb=dd=Av[0],nc=Math.ceil(Alen/(samp*20))+0.8
      for(var j=1; j<samp; j+=nc){ //fast gamble on intro sample
        bb=dd,dd=Av[j]
        if(dd<bb){ up++,j-- }
        if(dd>bb){ dw++,j-- }
      }

      var upness=(up-dw)/samp

      if(desc) upness=-upness
      
      var threshup=0.3 //1 maxout -1 neg-out
      if(upness>threshup){ flipp=true; }
      if((Alen>100)&&(up*3>samp)&&(dw*3>samp)) skiptry=true
    }
    
    if( !(Ax&&Ax.length>=Av.length) ){ Ax = ixArray(Av,flipp) }
    
    if(desc) { compar=lessthan } else { compar=morethan }
    var st=0
    
    if(!skiptry){ //try insertsort
      //~ conlog("tryin")
      var sresult, trys=1, stint=1

      while ( (sresult=insertndx(Av,Ax,stint,st)).bk < Ax.length){
        if((sresult.du)<(Ax.length*trys/15)) {
          //~ console.log("pre-ins bust trying",st,sresult.du)
          break 
        }
        st=sresult.du,trys++
        stint*=1.1
      }
      
      if(sresult.bk===Av.length){ 
        //~ console.log("solved early")
        return Ax 
      }
    }
 
    if(st<Av.length*0.14) //made poor progress before
    { 
      //~ conlog("barsorted")
      //~ var barlen=19, reso=3 //these values mined, mebbie 16/4 or other better?
      //~ var barlen=22, reso=2 //these values mined, mebbie 16/4 or other better?
      var barlen=16, reso=2 //these values mined, mebbie 16/4 or other better?
      //~ var barlen=12, reso=2 //these values mined, mebbie 16/4 or other better?
      var bars=Math.ceil(Av.length/barlen)+1 
      //~ var barppl=new Array(bars)
      Ax=Ax||new Array(Av.length)
      //~ console.log("Barlen:",barlen,"reso:",reso)
        
      var rgallocs=barassign({
        barnum: bars
       ,scores: Av     //will be copied if no burnscore:true
       ,keysbar:Ax
       //~ ,barppl:barppl  //comment this out 
       ,savscore:1
       ,resolution:reso
       ,descend:desc
       ,secure:false
       ,ordinate:true
      })
            
    }else if( !(Ax&&Ax.length>=Av.length) ){ Ax = ixArray(Av,flipp) }
    
    if(skipfix){ return Ax }
    
        
    return combubinsort(Av,Ax)
 
  }

  
  function ntain(a,b,c){ //contain a by b and c
    if(a<b) return b
    if(a>c) return c
    return a
  }
  
  
  function stndindex(Ai,desc,Ax){
    
    if(!Ax||Ax.length<Ai.length){
      Ax=new Array(Ai.length)
      for (var i=0,e=Ai.length; i<e; i++) Ax[i] = i
    }
    
    if(desc){
      Ax.sort( function (b, a) { return Ai[a] - Ai[b] } )
    }else{
      Ax.sort( function (a, b) { return Ai[a] - Ai[b] } )
    }
    return Ax
  }


  function ixArray(A,flipp){
    var Ar=new Array(A.length)
    if(flipp){
      for(var c=0,e=Ar.length,d=e; c<e; c++){ Ar[c]=--d}
    }else{
      for(var c=0,e=Ar.length; c<e; c++){ Ar[c]=c} 
    }
    
    return Ar
  }
    
  
  function combubinsort(Av,Ax,desc){
    
    var bst=0,st=0,ov=0, sresult
    
    var fixcnt=0, fixlim=200, Alen=Av.length
    
    //~ var cfg=0.1 
    //~ var cfg=0.5 
    var cfg=1 
    var maxstint=3*cfg, stint=1*cfg, minstint=0.1*cfg
    var bdu=0
    
    //~ var mkforward=50
    var mkforward=0.3
    var firstee=1
    
    while((sresult=insertndx(Av,Ax,Math.floor(stint*Alen),st)).bk < Ax.length){ 
      
      //~ if(firstee){ combubble(Av,Ax,0,Alen,40,40); firstee=0 }
      //~ console.log(stint)
      var throwback = sresult.du - sresult.bk
      var forward   = sresult.du - bdu ,bdu=sresult.du
      
      var aveback= stint*Alen/forward 
      
      var bback=throwback+aveback*2
      
      //~ conlog("bback",bback,"stint",stint)
      if(bback>40){
        var tuneo=10,tunep=1
        var cmbspan=Math.floor(tuneo+ (bback)*tunep )
           ,maxspan=Math.floor(Ax.length*0.01)+10000

        st=sresult.du-cmbspan    ,ov=sresult.du+cmbspan*2
        st=ntain(st,0,Ax.length) ,ov=ntain(ov,0,Ax.length)
        
        var swps, bswps, jj=Math.floor((ov-st)*0.3)
        
        var rr=combubble(Av,Ax,st,ov,jj,40)
      
        stint=(minstint*2+stint)/3
            
      }else{
      
        stint=(maxstint*2+stint)/3
      }
      
      if( fixcnt++>fixlim ){ break } 
    }
  
    if(fixcnt>=fixlim){ 
      //~ console.log("falledback")
      stndindex(Av,desc,Ax) 
    }
    //~ else{console.log(fixcnt,":brks<lim:",fixlim)}
    //~ console.log("gup")

    return Ax 
    
  }
  
  function combubinsort1(Av,Ax,desc){
    
    var bst=0,st=0,ov=0, sresult
    var Alen=Av.length
    var fixcnt=0, fixlim=20000
    
    //~ var cfg=0.1 
    //~ var cfg=0.5 
    
    var cfg=40000 //almost passing through
    var maxstint=2*cfg, stint=1*cfg, minstint=1*cfg
    var bdu=0
    
    //~ var mkforward=50
    var mkforward=0.3
    var firstee=1
    
    //~ if(firstee){ combubble(Av,Ax,0,Alen,11,11); firstee=0 }
    
    while((sresult=insertndx(Av,Ax,stint,st)).bk < Alen){ 
      
      //~ console.log(stint)
      var throwback = sresult.du - sresult.bk
      var forward   = sresult.du - bdu ,bdu=sresult.du
      
      var aveback= stint/(forward+1) 
      var nomback=(throwback*2+aveback*3)/5
      var pass=60
      
      //~ conlog("forward",forward,"aveback",aveback.toFixed(2),"nomback",nomback.toFixed(2),"stint",stint.toFixed(2))

      if((throwback)<pass){
        if((nomback*1.5)<pass){ stint=(stint*2+maxstint)/3 }
        continue
      }
      
      var ccomb=throwback*1.25
      
      var cmbspan=Math.floor(ccomb)
         ,maxspan=Math.floor(Alen*0.01)+30000

      st=sresult.du-cmbspan ,ov=Math.floor(sresult.du+cmbspan*0.33)
      
      st=ntain(st,0,Alen) ,ov=ntain(ov,0,Alen)
      
      var jj=Math.floor(throwback*1.25)
      
      var rr=combubble(Av,Ax,st,ov,jj,Math.floor(jj*0.1+20) )
    
      //~ conlog("RR",rr,"st",st,"ov",ov,"ae",ov-st,"jj",jj)
      
      stint=(minstint*3+stint)/4
    
      if( fixcnt++>fixlim ){ break } 
  
    }
    
    if(fixcnt>=fixlim){ 
      console.log("falledback")
      stndindex(Av,desc,Ax) 
    }

    return Ax 
    
  }
  
    
    
  function insertndx(Av,Ax,giveover,s){ 
    
    if(s===undefined) s=1
    var moved=0, giveover=Math.floor((giveover||(20*Ax.length))+1)
    //~ console.log("starting:",s,giveover)
    
    for(var e=Ax.length ,dueway=s ;dueway<e; dueway++){
      var pickx = Ax[dueway],pickv=Av[pickx]
      var bacway =dueway-1
      while( bacway>=0 && compar(Av[Ax[bacway]] , pickv)){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
        moved++
      }
      Ax[bacway+1] = pickx                     //put pickx down
      //~ moved+=dueway-bacway
      if( moved > giveover){ 
        //~ console.log("insert bail:",dueway-1); 
        return {bk:bacway,du:dueway} 
      }
    }
     
    //~ console.log("fullinsfin",dueway,e)
    return {bk:dueway,du:dueway}
  }

     
  function combubble(Av,Ax,s,e,jmp,fin){
    
    var r=0
    s=s||0 ,e=e||Av.length ,fin=fin||70 
    for( jmp=jmp||(e-s)*0.66667 ; jmp>=fin ; jmp=jmp*0.66667 ){
         
      var jmpb=Math.floor(jmp*0.28)
         ,jmpe=Math.floor(jmp*0.98)
         ,jmpf=Math.floor(jmp)
         ,t=0
         
      for(var cc=s ,es=e-jmpf; cc<es; cc+=1)
      { 
        var jd=cc+jmpb ,je=cc+jmpe ,jf=cc+jmpf 
        if( compar(Av[Ax[cc]] , Av[Ax[jd]]) ){ t=Ax[cc],Ax[cc]=Ax[jd],Ax[jd]=t }
        if( compar(Av[Ax[jd]] , Av[Ax[je]]) ){ t=Ax[jd],Ax[jd]=Ax[je],Ax[je]=t }
        if( compar(Av[Ax[cc]] , Av[Ax[jf]]) ){ t=Ax[cc],Ax[cc]=Ax[jf],Ax[jf]=t,r++ }
      }
    
    }
    return r/(e-s)
  } 
    
    
  function reorder(Av,Ax){
    
    var Ar=new Array(Av.length)
    for(var j=0,e=Ax.length;j<e;j++){
      Ar[j]=Av[Ax[j]]
    }
    return Av=Ar
  }

  function sort(Av,desc){
    return reorder(Av,sortorder(Av,desc))
  }
    
  return{
     barassign : barassign 
    ,sortorder : sortorder
    ,sort      : sort
    ,reorder   : reorder
    
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
