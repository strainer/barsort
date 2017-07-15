//  ~   Barsortjs - Fast full or range sorting of large arrays   ~  + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 

var Barsortfactory = function(){ return (function(){ 
  'use strict'

  function version(){ return "0.11.0" }

  var _cntofbin=[],_barsfill=[],_barofbin=[] //these arrays reused between calls
  var _agewkspc=0,_genwkspc=100 //these count use of workspace arrays


  function barassign_secure(kysval,nbar,barppl,arg){
    var ixkeys=sortorder(kysval,[],0,0,arg.descend)  //unoptimal without st,ov
    ///todo this should leave original kysval untouched
    if(arg.arrange) return ixkeys

    var barsiz=(ov-st)/nbar, dubar=0, barppl=barppl||[]
    for(var i=0;i<nbar;i++){ barppl[i]=0 }
    for(var c=0,e=ixkeys.length;c<e;c++){
      if(ixkeys[c]>=st&&ixkeys[c]<ov){
        var cbr=Math.round(dubar++ /barsiz)
        kysbar[ixkeys[c]]= cbr 
        barppl[cbr]++ 
      } 
    } 
    return
  }
  
  
  function barassign(arg){ //barnum:,kysval:,st:,ov:,keysbar:,barppl:
    
    var nbar   = arg.barnum  //number of bars
       ,kysval = arg.scores  //sort weights
       ,kysbar = arg.keysbar //must pass array for bars
       ,barppl = arg.barppl  //reuse array for bar population counts
       ,st     = arg.st||0 
       ,ov     = arg.ov||kysval.length
       ,nb     = ov-st
       ,resol  = arg.resolution||5  //over sample bins x5
      
    var kysbin      //keep this integer for best performance
                   
    if(arg.secure){ 
      barassign_secure(kysval,nbar,barppl,arg); return 
    }
    
    //~ if(!arg.burnscore){  //clone score
      //~ kysbin=new Array(kysval.length)
    //~ }else{ kysbin=kysval } //! shouldnt do this
    
    
    var wel= welfordscan(kysval,st,ov)
    
    var minv=wel.minv ,maxv=wel.maxv ,sdev=wel.sdev 
    
    var maxwelf=mean+sdev*4.5, minwelf=mean-sdev*4.5
    
    var nbin=resol*nbar, ebin=nbin-1
    
    //grow or occasionally refresh persistent workspaces
    if( true || _cntofbin.length<nbin //todo test this, its disabled
      ||( _cntofbin.length>nbin && _agewkspc++ >_genwkspc ) ){
       _agewkspc = 0
       _cntofbin = new Array(nbin) 
       _barofbin = new Array(nbin)  //may try these typed as ints
       _barsfill = new Array(nbar)  //or zeroing them here to pack them
     }                              //or redo 2 arrays nearer use
     
    for(var ch=0; ch<nbin; ch++){ _cntofbin[ch]=0 }
    
    //~ if(arg.burnscore){
      //we cant burn score - or this would be fast shortcut 
    //~ }else{
    
    var binperval=-0, minw=minv ,maxw=maxv
    
    //~ if(pr.descend){ minq=maxy,maxq=miny }  //do this another way later
        
    if(maxwelf>maxw && minwelf<minw) //&&minw!==-Infinty&&maxw!==Infinty 
    { //do fast bins
      
      binperval=(nbin-0.0000001)/(maxw-minw)
      
      for(var i=st; i<ov; i++) 
      { kysbin[i]=(binperval*(kysval[i]-minw))>>0  } 
     
    }else{
      //do slow bins (may have infinitys)
      maxw=maxwelf,minw=minwelf
      binperval=(nbin-0.0000001)/(maxw-minw)
      
      for(var i=st; i<ov; i++) 
      { 
        var qvl=binperval*(kysval[i]-minw) //check work with infinitys
        if(qvl<1)    { kysbin[i]=0    ; continue }
        if(qvl>=ebin){ kysbin[i]=ebin ; continue } //todo: float optimise
        kysbin[i] = qvl>>0 
      }
 
    }
    
    //tally bins
          
    for(var i=0; i<nbin; i++){ _cntofbin[i]=0 } 
    for(var i=st;  i<ov; i++){ _cntofbin[kysbin[i]]++ } 
    
    var binfixfactor=100 //todo !binfix disabled 
    
    if(binspillage(nbin) > nbin*binfixfactor){
      //~ if(see){ console.log("imbins") }
      improveBins(ov,st,nbin,kysval,kysbin, minv,maxv, minw,maxw, binperval) 
      //improves kysbin and redo _cntofbin
    }
    
    //while _barsfill fills, _barofbin can assign bins with bars 
    //_barofbin is used to route bars to keys kysbar output.
    
    var kysperbar=(nb/nbar)
       ,fillbar=0,fldbar=0,spills=[]
       ,nxtcap=kysperbar+0.5, fcap=Math.floor(nxtcap)

    for(var ch=0; ch<nbar; ch++){ _barsfill[ch]=0 }
    
    for(var bin=0; bin<nbin; bin++){
      
      _barofbin[bin]=fillbar            //_cntofbin bar bin goes to dest[fillbar]
      _barsfill[fillbar]+=_cntofbin[bin]  //_barsfill[fillbar] gets population of bar bin

      while(_barsfill[fillbar]>=fcap){
        _barsfill[fillbar+1]+=_barsfill[fillbar]-fcap
        _barsfill[fillbar]=fcap
        fillbar++
        nxtcap+=kysperbar-fcap
        fcap=nxtcap >>>0
      }
    } //bins have there anchor bars .. next give keys their bars 
        
    //_barsfill[fillit] is capacity of bars
       
    //_barsfill is parallel to barppl
    //_barsfill must empty but barppl wants returned
    //ceil of _barsfill is complicated here by dvrems fraction..
    
    if(arg.arrange){ //write keys into order in kybars 
      var bapos=new Array(nbar); bapos[0]=0 
      for(var i=0;i<nbar-1;i++){ bapos[i+1]=bapos[i]+_barsfill[i] }
    
      for(var i=st; i<ov; i++){ //is not st ov capable
        var binofel=kysbin[i]
        
        while(_barsfill[_barofbin[binofel]]===0){ 
          //_barsfill[_barofbin[binofel]]--
          _barofbin[binofel]++ 
        }
        _barsfill[_barofbin[binofel]]--
        kysbar[bapos[_barofbin[binofel]]++ ]=i //i know its crazy, but its true
      }
    }else{ //write barnums in order of keys
      if(barppl) //this array is used by calling function
      { for(var i=0;i<nbar;i++){ barppl[i]=_barsfill[i] } }

      for(var i=st; i<ov; i++){ 
        var binofel=kysval[i]
        
        while(_barsfill[_barofbin[binofel]]===0){ 
          //~ _barsfill[_barofbin[binofel]]--
          _barofbin[binofel]++ 
        }
        _barsfill[_barofbin[binofel]]--
        kysbar[i]=_barofbin[binofel] /// /// /// business line
        
      }
    }
    
    return _barsfill //this was used for checking but is not used now
  }
  


  
  function improveBins(ov,st,nbin,kysval,kysbin, minv,maxv, minw,maxw, binperval){
     
    var spilled=0, spills=0
    
    var fbin=Math.floor((ov-st)/nbin) ,bigbin=fbin*2
    
    var markbin_pos=[] ,markbin_lod=[]
    //window on current/trend value 
    var dbin=_cntofbin[0], bbin=dbin, obin=dbin, j=1
    
    //current range details
    var cr_len=1, cr_tot=dbin, cr_lo=0, cr_hi=(bigbin>>2)+1
    
    // loop over bins, mark endStart of ranges of similar magnitude vals
    // for after interest in: may compress | leave | may expand | must expand
    while( j<=nbin ){ 
      
      bbin=dbin, dbin=_cntofbin[j]
      
      //a decaying measure of trending value, same scale as avg value
      obin=(obin + (bbin + dbin)>>1)>>1 
      
      if(obin>cr_hi||onbin<cr_lo){
        markbin_pos.push(j)  //exclusive end, inclusive start of new range
        markbin_lod.push(cr_tot)

        if(onbin>bigbin){ 
          spilled+=cr_tot-(cr_len*fbin)
          spills++
        }

        cr_tot=0, cr_len=0
        cr_hi=1+(onbin*1.33)>>0
        cr_lo=(onbin*0.66)>>0
      }
      
      cr_tot+=_cntofbin[j]
      cr_len++
      
    }//till j>nbin

    //if low spillage skip this rebinning
    var spill_trip=1
    
    if(spilled < nbin*spill_trip ){ return } //it actually doesnt need rebinned
    
    //make rearrangers:

    var rangSepv=[]   // value which separates from last range
    var rangScal=[]   // target bins / full val len of range
    var rangBina=[]   // anchor bin of target range
    
    //minv, maxv are true bounds, they may be infinite 
    //minw, maxw are nominal bounds, finite 
  
    var valperbin=1/binperval
    
    //initial low anchor is possibily infinite :(
    //todo if minw is -infinity
    //fix it by skipping it
    //and decreasing minw if needed
      
    var bsepval=(minv < minw)? minv : minw 
    var csepval=0
    var bpos=0,cpos=0,dpos=0 //marked positions  b_efore c_urrent d_ue 
                             //todo dpos range consolidation
    var cabin=0 //current anchor bin number (in redone bins)
    
    for( var m=0,me=markbin_pos.length; m<me; m++){
      
      //todo: lookahead mark rejoin
     
      cpos=markbin_pos(m)      //src bin 
      
      csepval=minw + valperbin*cpos  //high end of src bin range
      
      cload=markbin_lod(m)      //population of marked range
      
      ibins=(cload*bins_per_load)>>0 //ideal bins for population 
      
      valobins=(csepval-bsepval)/ibins //range of an ideal bin
      
      rangScal.push(1/valobins) //val scale to result ibins
      rangSepv.push(bsepval)    //behind sep val (low anchor of range )
      rangBina.push(cabin)      //current anchor bin 
      
      cabin+=ibins
      bval=cval
      bpos=cpos

    }
   
    //rebin according to tallanalysis
   
    for(var ch=0; ch<nbin; ch++){ _cntofbin[ch]=0 }
             
    for(var i=st; i<ov; i++){ 
      var ri=1 , cval=kysval[i]
      
      //first rangSepv is anchor of first range
      while(cval>=rangSepv[ri]) ri++ //find sepval more than cval
      var bin=(((val-rangSepv[--ri])*rangScal[ri])>>0)+rangBina[ri]
      
      kysbin[i]=bin
      _cntofbin[bin]++ 
    }
   
  } 

  function binspillage(nbin){ 
    
    var spill=0 , kk=_cntofbin[0]+_cntofbin[1] 
    for(var i=2; i<nbin; i++){ 
      kk+=_cntofbin[i]
      var kov=kk-full
      if(kov>0){ 
        spill+=kov 
        kk=kk>>1  //half instead of zero rates consequtive harder
      } 
    }
    return spill
  }
  
  function welfordscan(Ai,st,ov){
    
    var minv=Ai[st] ,maxv=minv ,smnm=0, qvl=-0 
    var delt=-0 ,delt2=-0 ,mean=-0 ,me2=-0 
    
    for(var i=st; i<ov; i++) //need to max,min 
    { 
      qvl=Ai[i]||-0 
      
      if (qvl>=maxv)
      { maxv=qvl ; if(qvl === Infinity) continue } 
      else if (qvl<minv)
      { minv=qvl ; if(qvl === -Infinity) continue }
          
      //calc variance.. welfords alg
      smnm++	
      delt  = qvl  - mean
      mean += delt / smnm
      delt2 = qvl  - mean
      me2  += delt * delt2	
    
    }
    
    var sdev= smnm>1? Math.sqrt( me2/(smnm-1) ) : 0

    return {minv:minv ,maxv:maxv ,sdev:sdev ,mean:mean } 
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
       ,arrange:true
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
