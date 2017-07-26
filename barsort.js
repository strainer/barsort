//  ~   Barsortjs - Fast full or range sorting of large arrays   ~  + 
/*           Copyright 2017 by Andrew Strain. No warranty           * 
 *  This program can be redistributed and modified under the terms  * 
 *  of the Apache License Version 2.0 - see LICENSE for details     * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/ 

var Barsortfactory = function(){ return (function(){ 
  
  'use strict'
   //es5 with code style quirks
   //vars may be initialised 0|-0 to hint integer|float type
   //a b c d e : shorthand for (a)nchor (b)efore (c)urrent (d)ue (e)nd
   //shrthnd lwrcase nms mstly. 
   
  function version(){ return "0.11.0" }

  var _cntofbin=[],_barsfill=[],_barofbin=[] //these arrays reused between calls
  var _agewkspc=0,_genwkspc=100            //count use of these workspace arrays
                                         //todo make these default off
  
  function barassign(arg){ //barnum:,kysval:,st:,ov:,keysbar:,barppl:
    
    //~ see=true
    see=false
    
    var nbar   = arg.barnum  //number of bars
       ,kysval = arg.scores  //sort weights
       ,kysbar = arg.keysbar //must pass array for bars
       ,kysbin = new Array(kysbar.length)
       ,barppl = arg.barppl  //reuse array for bar population counts
       ,st     = arg.st||0 
       ,ov     = arg.ov||kysval.length
       ,nkys   = ov-st
       ,resol  = arg.resolution||5  //over sample bins x5
                      
    if(see){
      console.log("nbar",nbar,"nkys",nkys,"resol",resol) 
      console.log("kysval")
      console.log(kysval.slice(0,50).join(","))
      console.log(kysval.slice(kysval.length-50,kysval.length).join(","))
    }
                      
    if(arg.secure){ 
      barassign_secure(kysval,nbar,barppl,arg); return 
    }
    
    //~ if(!arg.burnscore){  //clone score
      //~ kysbin=new Array(kysval.length)
    //~ }else{ kysbin=kysval } //! shouldnt do this
    
    
    var wel= welfordscan(kysval,st,ov)
    
    //~ if(see){console.log(wel)}
    
    var minv=wel.minv ,maxv=wel.maxv 
    
    var histat=wel.mean+wel.sdev*4.5, lostat=wel.mean-wel.sdev*4.5
    
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
    
    var binperval=-0, lomark=minv ,himark=maxv
    
    //~ if(pr.descend){ minq=maxy,maxq=miny }  //do this another way later
     if(see) console.log("histat",histat,"himark",himark,"lostat",lostat,"lomark",lomark)
    
    //potential range density savings from zooming in on spread
    var rdsav=-0
    if(histat<maxv){ rdsav+= histat-maxv }
    if(lostat>minv){ rdsav+= minv-lostat }
    //calib fast slow bin
    if(!(rdsav >= (maxv-minv)*0.1)) //clause convolution excludes Infinites 
    { //do fast bin

      if(see) console.log("fast bin")
      binperval=(nbin-0.0000001)/(maxv-minv) //tweaked so not to cleave maxv

      var valperbin = 1/binperval
      
      lomark = minv + valperbin //these are set for a later process
      himark = maxv - valperbin //not sure if himark needed...
            
      for(var i=st; i<ov; i++) 
      { kysbin[i]=(binperval*(kysval[i]-minv))>>0  } 
     
    }else{
      //do slower bin (may have infinitys)
      if(see) console.log("slow bin")
      
      // minv  lostat    highstat   maxv
      
      lomark=lostat 
      himark=histat
      binperval=(nbin-2)/(himark-lomark)
      valperbin=1/binperval
      
      lomark-=valperbin*1.0000001 
      //so lomark becomes 1, 0 is anything under
      //himark and over is nbin -2 +1 = ebin
             
      for(var i=st; i<ov; i++) 
      { 
        var qvl=binperval*(kysval[i]-lomark) //check work with infinitys
        if(qvl<1)    { kysbin[i]=0    ; continue }
        if(qvl>=ebin){ kysbin[i]=ebin ; continue } //todo: float optimise
        kysbin[i] = qvl>>0 
      }
 
    }
    
    //tally bins
          
    for(var i=0; i<nbin; i++){ _cntofbin[i]=0 } 
    for(var i=st;  i<ov; i++){ _cntofbin[kysbin[i]]++ } 
    
    var binfixfactor=0 //calib improvebins 
    var barfull=(nkys/nbar)>>0
    var spillo=binspillage(nbin,barfull)
    if( spillo > nbin*binfixfactor){
      if(see){console.log("spillo",spillo,"barfull",barfull)}
      if(see){console.log(wel)}
      //~ if(see){ console.log("imbins") }
      improveBins(ov,st,nbin,kysval,kysbin, minv,maxv, lomark,himark, binperval) 
      //improves kysbin and redo _cntofbin
    }else{ if(see) console.log("skip improve") }
    
    //while _barsfill fills, _barofbin can assign bins with bars 
    //_barofbin is used to route bars to keys kysbar output.
    
    var kysperbar=(nkys/nbar)
       ,fillbar=0
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
  


  
  function improveBins(ov,st,nbin,kysval,kysbin, minv,maxv, lomark,himark, binperval){
     
    var xsvals=0, xsbins=0
    
    var fulbin=(ov-st)/nbin
    
    var rmark_dposn=[] ,rmark_cload=[]
    
    var j=0 

    if(!similar85(lomark , minv + 1/binperval) ){ //minv is within 85% of normal
      rmark_dposn.push(1)              //1 is a new anchor
      rmark_cload.push(_cntofbin[j++]) //count of 0
    }
    
    //obin is window on current/trending countobin 
    var dbin=_cntofbin[j], bbin=dbin, obin=dbin
    
    //current range bin length ,total load, new range trip obin low and high
    var cr_len=1, cr_tot=dbin, cr_lo=(obin*0.66)>>0, cr_hi=1+(obin*1.33)>>0
    
    ///loop over bins, mark endStart of ranges of separate magnitude vals
    // for after interest in: may compress | leave | may expand | must expand
    while( ++j < nbin ){ // (j is in dbin) 
      
      //~ if(see)console.log(j)
      
      bbin=dbin, dbin=_cntofbin[j]
      
      //a decaying measure of trending value, same scale as avg value
      obin=(obin + (bbin + dbin)>>1)>>1 
      
      if(obin>cr_hi||obin<cr_lo){
        
        //note the beginning of subsequent range (bin nbr j)
        rmark_dposn.push(j) 
        //aside the population of preceeding range 
        rmark_cload.push(cr_tot)

        var h=cr_tot-((cr_len*fulbin)>>0)
        if(h>0){
          xsvals+=h
          xsbins+=cr_len
        }

        cr_tot=0, cr_len=0, obin=dbin
        cr_hi=1+(obin*1.33)>>0           //todo tune factors (and above)
        cr_lo=(obin*0.66)>>0
      }
      
      cr_tot+=dbin
      cr_len++
      
    }//till j>nbin

    if(cr_tot){              //(this should always be true anyways)
      rmark_dposn.push(nbin)       //this might be done in above loop
      rmark_cload.push(cr_tot)     //but test j==e in loop may slow 10-25% 

      var h=cr_tot-((cr_len*fulbin)>>0)
      
      if(h>0){
        xsvals+=h
        xsbins+=cr_len
      }
    }
    
    //push magic terminator values to rmarks also...
    rmark_dposn.push(0)
    rmark_cload.push(Infinity) //todo ?really infinity or other breaking value
                               //an int might be better for array consistency
      
    if(see){
      console.log("cntbn",_cntofbin.join(", "))
      console.log("dposn",rmark_dposn.join(", "))
      console.log("cload",rmark_cload.join(", "))
      console.log("minv",minv,"lomark",lomark)
      console.log("maxv",maxv,"himark",himark)
      console.log("xsvals",xsvals,"xsbins",xsbins) 
    } 
                             
    /// rmarks done  -  begin rearangers .....
    
    //if low spillage skip this rebinning
    var spill_trip=0 //calib cancel rebinning
    if( xsvals < nbin*spill_trip ){ 
      if(see) console.log("low spill no rebin",xsvals)
      return 
    } //turns out doesnt need rebinned
    
                     // struc-of-array rearrangers:
    var rearsepv=[]  // value which separates from prev range
    var rearscal=[]  // targetnum of bins / full val len this range
    var rearbina=[]  // anchor bin of this range
      
    var valperbin   = 1/binperval
    var bin_per_ppl = (nbin-1)/(ov-st) 
    var rmbin=0.5                 // carry remainder of bin nb change 
    
    //minv, maxv are true bounds, they may be infinite 
    //lomark, himark are nominal bounds, finite 

    var bsepval=-0, csepval=-0    // behind separation value
   
    var oabin=0 //output anchor bin number (in redone bins)

    var bpos=0 ,cpos=0 ,dpos=0 //dpos -> cpos, cpos -> bpos 

    var dmk=1 , emk=rmark_dposn.length-1  //a terminator element at end
          
    var enter_range=0 , enter_sep=-1
    
    if(!similar85(lomark , minv + 1/binperval) ){//then first range is special
      
      //do something with range 0 ///skipping for now
      if(rmark_cload[0]){
        rearscal.push(0)          //val scale to result ibins
        rearsepv.push(-Infinity)  //behind sep val (low anchor of range )
        rearbina.push(oabin++)    //current anchor bin 
      } 
      //range 1 will start at bin 1, 
      //lomark is bin1 -valperbin
      //so the sep will work 
      enter_range=1, enter_sep=lomark, bpos=1 
    }else{
      enter_range=0, enter_sep=minv, bpos=0
    } 
            
    ///enter following loop with:
    ///
    /// go in with a range read in to vars, either 0 or 1
    // bpos is anchor of entrance range, when simple =0
    // cpos is overwritten by dpos 
    dpos=rmark_dposn[enter_range] //this is the bin after enter_range !
    // csepval as anchor val
    dmk=enter_range+1  // this is the subsequent range to assess in 
                       // relation to enter (rmark_cload[enter_range+1])
    
    csepval=enter_sep
    //subsequent seps are: csepval=lomark + valperbin*cpos
    
    //dppl becomes cppl
    var cppl=0, dppl=rmark_cload[enter_range] 
    
    //ddense becomes cdense 
    var ddense = dppl/(dpos-bpos), cdense=ddense 
            
    if(see){ console.log("rmark") }
    
    while( dpos ){   //last rmark_dposn is 0 for dpos

      cdense=ddense
          
      do{ /// /// /// /// /// /// /// ///
      
        cpos  =dpos  //extend c range
        cppl +=dppl
        
        dppl  =rmark_cload[dmk]   //end mark has Infinite lod
        dpos  =rmark_dposn[dmk++] //and 0 pos
        ddense=dppl/(dpos-cpos) //to leave loops
        
        if(see)console.log("\n read dmk",dmk-1,"cpos",cpos,"dpos",dpos,"dppl",dppl,"cd dense",cdense.toFixed(3),ddense.toFixed(3))
      
      }while( similar40(cdense,ddense) )
      
      //after that, a due range is set,
      //and current range is apos to cpos and cppl

      bsepval=csepval
      csepval=lomark + valperbin*(cpos-1)  //high end of src bin range 
                                           //todo refac the cpos-1
      if(see)console.log("b>csep",bsepval.toFixed(5),csepval.toFixed(5),"cpos",cpos,"cppl",cppl)
      
      if(see)console.log("ibins=cppl",cppl,"*binpp",bin_per_ppl.toFixed(5))
      
      var ibins= cppl*bin_per_ppl+rmbin  //ideal bins for population 
      rmbin= ibins-(ibins=Math.ceil(ibins)||1)  //carryon smartpants
      
      var valobins=(csepval-bsepval)/ibins  //range of an ideal bin
      
      if(see)console.log("valobins=(csepval",csepval.toFixed(5),"-",bsepval.toFixed(5),"bsepval)/ibins",ibins,(1/valobins).toFixed(6))
      
      if(cppl){ //skip enmpty ranges
        rearscal.push(1/valobins) //val scale to result ibins
        rearsepv.push(bsepval)    //behind sep val (low anchor of range )
        rearbina.push(oabin)      //current anchor bin 
        
        oabin+=ibins
        cppl=0
      } 
    }// leaves on last mark where dpos = 0 
   
    //the last rang will be up to the last bin pos marked
    //the sep val of the last bin is not infinite
    
    //rebin according to tallanalysis
   
    //last one to catch overflows
    
    rearscal.push(0) //val scale to result ibins
    rearsepv.push(maxv*1.000001)    //behind sep val (low anchor of range )
    rearbina.push(oabin++)      //current anchor bin 
    
    //real last one to bounce end
    rearscal.push(0)
    rearsepv.push(NaN)  //never passes
    rearbina.push(0) 
   
    if(see){
      console.log("rearscal",zap(rearscal,function(a){return a.toFixed(3)}).join(", "))
      console.log("rearsepv",zap(rearsepv,function(a){return a.toFixed(3)}).join(", "))
      console.log("rearbina",rearbina.join(", "))
    }
    
    if(see)console.log("Cntbnna",reduce(_cntofbin),"nbin",nbin,"cnt.len",_cntofbin.length)
    if(see)console.log("Cntbn",_cntofbin.join(", "))
    
    for(var ch=0; ch<nbin; ch++){ _cntofbin[ch]=0 }
             
    for(var i=st; i<ov; i++){    //got here in the end 
      var ri=1 , cval=kysval[i]
      
      while(cval>=rearsepv[ri]) ri++ //find sepval more than cval
      var bin=(((cval-rearsepv[--ri])*rearscal[ri])>>0)+rearbina[ri]
      
      kysbin[i]=bin
      if(see&&_cntofbin[bin]===undefined) console.log("xx",cval,rearbina[ri])
      //~ if(see&&cval>400) console.log("xb",cval,rearbina[ri])
      _cntofbin[bin]++ 
    }
   
    if(see)console.log("Cntbnnb",reduce(_cntofbin))
    if(see)console.log("Cntbn",_cntofbin.join(", "))
    if(see&&_cntofbin.length>nbin)
    { console.log("Cntbn LEN ERR",nbin,_cntofbin.length) }
  } 

  function similar85(a,b){ return (7.5*a/b)>>0 ==7 }
  function similar40(a,b){ return (a/b+0.5)>>0 ==1 }

  function binspillage(nbin,full){ 
    
    var spill=0 , kk=_cntofbin[0]+_cntofbin[1] 
    for(var i=2; i<nbin; i++){ 
      kk+=_cntofbin[i]
      var kov=kk-full
      kk-=_cntofbin[i-2] 
        
      if(kov>0){ 
        spill+=kov 
        //~ console.log("kk",kk)
        kk-=kov
      }
      kk=kk<0?0:kk
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
    
  var see=true
  
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

  function zap(Ai,f){
    
    var Ao=new Array(Ai.length)
    for(var j=0,e=Ai.length;j<e;j++){
      Ao[j]=f(Ai[j])
    }
    return Ao
  }

  function reduce(Ai){
    
    var s=0
    for(var j=0,e=Ai.length;j<e;j++){
      s+=Ai[j]
    }
    return s
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
