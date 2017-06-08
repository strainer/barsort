//  ~   Barsortjs - Fast full or range sorting of large arrays   ~  + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 

var Barsortfactory = function(){ return (function(){ 
  'use strict'

  function version(){ return "0.10.0" }


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
   
    ///make scorerange function and repeat it to zoom on bunched dists
    //~ scorerange(pscores,scores,pr.descend,)
    //~ function scorerange(inputs,scores,minv,maxv,minsc,maxsc)
   
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
    
    if( true || _cntofsub.length<subdvn ///test if this helps ?
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
    
    if(pr.ordinate){ //write keys into order in kybars instead of
      var bapos=new Array(barnum); bapos[0]=0 //writing barnums in order of keys
      for(var i=0;i<barnm-1;i++){ bapos[i+1]=bapos[i]+_destrema[i] }
    
      for(var i=st; i<ov; i++){ //not st ov capable
        var subposi=scores[i]
        
        while(_destrema[_destosub[subposi]]===0){ 
          //_destrema[_destosub[subposi]]--
          _destosub[subposi]++ 
        }
        _destrema[_destosub[subposi]]--
        kysbar[bapos[_destosub[subposi]]++ ]=i //i know its crazy, but its true
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
  
      
  var compar
  function lessthan(a,b){ return a<b }
  function morethan(a,b){ return a>b }
  
  function sortorder(Av,desc,Ax,skiptry,skipfix){
    
    see=0//1//false//true//false//true//false//true
    if(see)console.log("doing sortorder",desc)
    
    var flipp=false, Alen=Av.length, minlen=10, hard=false
    if((!skiptry)&&Alen>minlen){
      
      var up=0,dw=0, samp=ntain(Alen>>>5,minlen)  // /64
            
      var dd,bb=dd=Av[0] ,nc=Math.ceil(0.1+Alen/(samp*8))
      for(var j=Alen-nc*samp; j<Alen; j+=nc){ //fast gamble on intro sample
        //~ console.log (j)
        bb=dd,dd=Av[j]
        if(dd<bb){ up++ }
        if(dd>bb){ dw++ }
      }

      var upness=(up-dw)/samp

      if(desc) upness=-upness
      
      var threshup=0.3 //1 maxout -1 neg-out
      if(upness>threshup){ flipp=true; }
      if((up*3>samp)&&(dw*3>samp)) hard=true
    }
    if(see)console.log ("hard:",hard,"flipp:",flipp)
    if( !(Ax&&Ax.length>=Alen) ){ Ax = ixArray(Av,flipp) }
    
    if(desc) { compar=lessthan } else { compar=morethan }
    var st=0
    ////////////////////////////////// take away true!!!!!!!!!!!!!!!!!!!!!
    if((!skiptry)&&!(hard&&(Alen>80))){ //try insertsort
      if(see) console.log ("easysoul sorting")
      
      var bottle=Math.ceil(Alen/10000)+2 //?
      
      if(longsort(Av,Ax,bottle)){ 
        if(see)console.log("solved by easysoul")
        return Ax 
      }
    }
 
    if(true) //made poor progress before
    { 
      if(see)console.log("doing barsort")
      
      var barlen=14, reso=2 //these values mined, mebbie 16/4 or other better?
      if(Av.length<1500000){ barlen=10}
      if(Av.length<300000){ barlen=6 }
      
      var bars=Math.ceil(Av.length/barlen)+1 
      //~ var barppl=new Array(bars)
      Ax=Ax||new Array(Alen)
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

    //~ return combubinsort(Av,Ax,desc)
    
    if(see)console.log("doing hardsoul") 
    
    bottle=150000000 //check bottle val
    
    longsort(Av,Ax,bottle)
    
    //~ console.log(Ax.join(" "))
    return Ax
    
  }

  
  function ntain(a,b,c){ //contain a by b and c
    if(a<b) return b
    if(c<a) return c
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
  
  function fliparray(A){
    for(var e=A.length-1,i=(e+1)>>>1,sw=A[i]; i<=e; i++){
      sw=A[i], A[i]=A[e-i], A[e-i]=sw
    }
    return A
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
    
  var see=false
  
  function longsort(Av,Ax,bottle){
    
    var Alen=Av.length ,mergs=bottle*(Alen+10000) 
     
    var tail=30 ,block=250
    var parts=[0], uflow=0, umost=1000, umo=500
    
    var first=ntain(150,0,Alen), st=first ,nx,snip
    
    inpairsort(Av,Ax,1,first,0)
     
    while ( st < Alen){ 
     
      nx=ntain(st+block,0,Alen)
      
      snip=inpairsort(Av,Ax,st,nx,st-tail)
      
      if(snip){ 
        
        if((nx-uflow)>umost){ uflow+=umo }
        
        var k=minglemerge(Av,Ax,st-tail,nx,uflow )
        
        mergs-=Math.sqrt(snip)*k 
        if(mergs<0){ return false }
        if(k>uflow-(st-tail)){ //note new partition
          if(parts[parts.length-1]!==uflow){
            parts.push(uflow)
          }
        } 
      }
      mergs+=bottle
      st=nx 
    }
    
    if(parts.length>1){
      var cpr=2//parts.length
      var bp,cp,dp=parts[1], qp
      
      var dpars=parts.length-1, apars=parts.length
      while(dpars){
        
        while(parts[ cpr ]===0){ cpr++ } //skip zeroed
        if(cpr>=apars){ break }
        
        bp = dp                                    //  100
        cp = parts[ cpr ]; parts[ cpr ]=0          //  200
        while(parts[ cpr ]===0){ cpr++ }           //skip zeroed
        
        dp = (cpr<apars)? parts[ cpr ] : Alen     //  300
        qp=cpr++
        
        var k=minglemerge(Av,Ax ,cp,dp,bp ) //test see if this is req

        while(parts[ cpr ]===0){ cpr++ }
        if(qp!==apars){
          dp = (cpr<apars)? parts[ cpr++ ] : Alen
          cp = parts[ qp ]; parts[qp]=0
          var k=minglemerge(Av,Ax ,cp,dp,bp )
        }
        
        while(parts[ cpr ]===0){ cpr++ }
        if(cpr>=apars){ dp=0,cpr=0}
      }
    }//merged parts
    
    return st===Alen

  }


  function inpairsort(Av,Ax,s,e,a){ 
    
    var bacway=0, xdua=0, xdub=0, baced=0
       ,f=s+((e-s)>>>1)*2
    
    var duewa=s,duewb=s+1
    while( duewb<f ){
            
      bacway= duewa-1
      xdua = Ax[duewa] 
      
      if(compar(Av[xdua],Av[Ax[duewb]])){
        Ax[duewa]=Ax[duewb] ,Ax[duewb]=xdua ,xdua=Ax[duewa] 
      }
      xdub = Ax[duewb] 
            
      while( bacway>=a && compar(Av[Ax[bacway]] , Av[xdub])){ //if pre is smaller
        Ax[bacway+2] = Ax[bacway]              //
        bacway--
        //~ //moved++
      }	
      if(bacway<a){ baced++ }
      Ax[bacway+2] = xdub
      
      while( bacway>=a && compar(Av[Ax[bacway]] , Av[xdua])){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
      }
      if(bacway<a){ baced++ }
      Ax[bacway+1] = xdua
      
      duewa+=2,duewb+=2
    }
     
    if(f!==e){
      xdua=Ax[e-1]
      bacway=e-2
        
      while( bacway>=a && compar(Av[Ax[bacway]], Av[xdua])){ //if pre is smaller
        Ax[bacway+1] = Ax[bacway]              //
        bacway--
      }	
      if(bacway<a){ baced++ }
      Ax[bacway+1] = xdua 
    }
    
    return baced 
  }


  var submcach=[] 

  function sparsemerge(Av,Ax,s,e,b){
   
    if(e-s>submcach.length) submcach=new Array(ntain((e-s)*3,0,Av.length))
    for(var h=0,j=s,ee=e-s;h<ee; ) submcach[h++]=Ax[j++] 
    
    var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

    ///skip to first insert 
    while( (clonx>=0) && !compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
    { clonx--,wrpos-- } 
    
    while(clonx>=0)// ix of copyel to place
    {
      lep=1,bhipt=hipt
      
      ///insert first chunk
      while( (hipt>=b) && compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
      { hipt=hipt-(lep++) } 
      if(hipt++<b){ hipt=b } 
      
      while( (hipt<=bhipt) && !compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is jdest
      { hipt++ }  //careful with stability here, get equal high as poss
      hipt--
      
      for(var c=bhipt,d=c+wrpos-bhipt;  c>hipt; ){
        Ax[d--]=Ax[c--]  //fiddle these byones
      }
      
      wrpos-=(bhipt-hipt)
      Ax[wrpos]=submcach[clonx]
      wrpos--,clonx--
                          
    }//while

    return wrpos<b?s-wrpos+1:s-wrpos //merge underflowed
  } 
  
  
  function minglemerge(Av,Ax,s,e,b){
     
    if(e-s>submcach.length) submcach=new Array(ntain((e-s)*3,0,Av.length))
    for(var h=0,j=s,ee=e-s;h<ee; ) submcach[h++]=Ax[j++] 
    
    var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

    ///skip to first insert 
    while( (clonx>=0) && !compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
    { clonx--,wrpos-- } 
    
    while(clonx>=0)// ix of copyel to place
    {
      bhipt=hipt
      
      while( (hipt>=b) && compar( Av[Ax[hipt]],Av[submcach[clonx]] ) ) // is not jdest
      { hipt-- } 
   
      for(var c=bhipt,d=c+wrpos-bhipt;  c>hipt; ){
        Ax[d--]=Ax[c--] 
      }
      
      wrpos-=(bhipt-hipt)
      Ax[wrpos]=submcach[clonx]
      wrpos--,clonx--
                
    }//while

    return wrpos<b?s-wrpos+1:s-wrpos //merge underflowed
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
    ,longsort  : longsort
    
    ,stndindex : stndindex
    ,insertndx : inpairsort
    
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
