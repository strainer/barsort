//                 ~ Barsortjs - Fast Number Sort ~                 + 
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
   
  function version(){ return "0.13.0" }

  var _cntofbin=[],_barsfill=[],_barofbin=[] //these arrays reused between calls
  var _agewkspc=0,_genwkspc=10             //count use of these workspace arrays
                                         //todo make these default off
  var see=0//true

  function barassign(arg){ //barnum:,kysval:,st:,ov:,keysbar:,barppl:
    
    //~ see=0//1//0//true
    
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
    
    //if numbers are too big even stats overflow, so using max_value / 10
    if(!isFinite(histat)) histat=Number.MAX_VALUE/3
    if(!isFinite(lostat)) lostat=-Number.MAX_VALUE/3   //-Number.MAX_VALUE
    
    var nbin=resol*nbar, ebin=nbin-1
    
    //grow or occasionally refresh persistent workspaces
    if( _cntofbin.length<nbin //todo test this, its disabled
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
    
    //~ if(arg.descend){ minq=maxy,maxq=miny }  //do this another way later
    
    //potential range density savings from zooming in on spread
    var rdsav=-0
    if(histat<maxv){ rdsav+= histat-maxv }
    if(lostat>minv){ rdsav+= minv-lostat }
    
    //~ see=0
    if(see) console.log("histat",histat,"himark"
     ,himark,"lostat",lostat,"lomark",lomark,"rdsav",rdsav)
    //~ see=0
    
    //calib fast slow bin
    if(isFinite(rdsav)&&(rdsav < (maxv-minv)*0.1) ) //clause convolution excludes Infinites 
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
        
    if(arg.descend){ //simple hack to do convert to descending
      for(var i=st; i<ov; i++) 
      { kysbin[i]=nbin-kysbin[i]-1 } 
    }
    
    for(var i=st;  i<ov; i++){ _cntofbin[kysbin[i]]++ } 
    
    var binfixfactor=0.2 //calib improvebins 
    var barfull=(nkys/nbar)>>0
    var spillo=binspillage(nbin,barfull)
    
    if(see){console.log(
      "spillo",spillo,"barfull",barfull,"binfixfactor",binfixfactor)
    }
    if( spillo > nbin*binfixfactor){
      if(see){console.log("improvebins")}
      if(see){console.log(wel)}
      //~ if(see){ console.log("imbins") }
      var ndbin=improveBins(ov,st,nbin,kysval,kysbin, minv,maxv, lomark,himark, binperval,arg.descend,arg.lowdiverse)
      
      if(ndbin<nbin){ /*change nbin*/ 
        if(see)console.log("changing ndbin to".ndbin)
        nbin=ndbin,ebin=ndbin-1 ,nbar=ndbin>>1 //todo calibrate nbar ratio
      } 
      //improves kysbin and redo _cntofbin
    }else{ if(see) console.log("skip improve") }
    
    //while _barsfill fills, _barofbin can assign bins with bars 
    //_barofbin is used to route bars to keys kysbar output.
    
    var kysperbar=(nkys/nbar)
       ,fillbar=0
       ,nxtcap=kysperbar+0.5, fcap=Math.floor(nxtcap)

    for(var ch=0; ch<nbar; ch++){ _barsfill[ch]=0 }
    
    for(var bin=0; bin<nbin; bin++){
      
      _barofbin[bin]=fillbar             //_cntofbin bar bin goes to dest[fillbar]
      _barsfill[fillbar]+=_cntofbin[bin] //_barsfill[fillbar] gets population of bar bin

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
          _barofbin[binofel]++ 
        }
        _barsfill[_barofbin[binofel]]--
        kysbar[i]=_barofbin[binofel] /// /// /// business line
        
      }
    }
    
    return _barsfill //this was used for checking but is not used now
  }
  


  function improveBins( 
    ov,st,nbin,kysval,kysbin, minv,maxv
   ,lomark,himark, binperval, descend ,lowdiverse
  ){
     
    var xsvals=0, xsbins=0  //calc overpacked bins
    
    var fulbin=(ov-st)/nbin //median bin fill level
    
    var bingrp_dbin=[] ,bingrp_cppl=[] //mark groups of similar packed bins
    
    var j=0 

    if(!similar85(lomark , minv + 1/binperval) ){ //minv is not 85% of normal
      bingrp_dbin.push(1)              //first range goes bin 0 to bin 1 (exc)
      bingrp_cppl.push(_cntofbin[j++]) //count of bin 0
    }
     
    ///loop over bins, mark endStart of ranges of separate magnitude vals
    ///interested in: may compress | leave | may expand | must expand
    
    var cr_tot=_cntofbin[j++] , cr_len=1

    var cr_lo=(2*cr_tot*0.66)>>0, cr_hi=(2*cr_tot*1.33)>>0
    
    var dbin=_cntofbin[j] 
    
    var nebin=nbin-1 //keep last bingroup separate incase its special
    
    while( ++j < nebin ){ // (j is in dbin) 
      
      var bbin=dbin 
      
      cr_tot+=bbin, cr_len++
      
      dbin=_cntofbin[j]
      
      //a decaying measure of trending value, same scale as avg value
      var obin=bbin + dbin 
      
      if((obin>cr_hi)||(obin<cr_lo)){ //cr_tot doesnt have dbin
        //split off cr,
        var cj=j, dr_tot=0, dr_len=0
        //see if bbin should be included in new crange
        if( cr_len>1 &&((obin>cr_hi&&(bbin*2)>cr_hi)
         || (obin<cr_lo&&(bbin*2)<cr_lo) )){ //include bbin in dr 
          dr_tot+=bbin, dr_len++ 
          cr_tot-=bbin, cr_len-- ,cj--
        }
        
        //note the beginning of subsequent range (bin nbr j)
        bingrp_dbin.push(cj)
        //~ if(see) console.log("pushing",cj) 
        //aside the population of preceeding range 
        bingrp_cppl.push(cr_tot)

        var h=cr_tot-((cr_len*fulbin)>>0) //note spillage
        
        if(h>0){
          xsvals+=h
          xsbins+=cr_len
        }

        cr_tot=dr_tot, cr_len=dr_len
        
        cr_hi=(2*(cr_tot+dbin+1)*1.33/(cr_len+1))>>0//todo tune factors (and above)
        cr_lo=(2*(cr_tot+dbin)*0.80/(cr_len+1))>>0
      
      }
      
    }//till j>nebin ...
     //do uncompleted group: 
    
    if(see) console.log(
      "left bingrp loop with cj",cj,"j",j,"cr_tot",cr_tot,"cr_len",cr_len
      ,"dbin",dbin )
    
    //j-1 needs written, will be added to tail grp if it was not written
    
    cr_tot+=dbin, cr_len++ //accept j-1 to group
    
    bingrp_dbin.push(nebin)   // should be group is from cj ot j-1 to j 
    bingrp_cppl.push(cr_tot) 

    var h=cr_tot-((cr_len*fulbin)>>0)
    
    if(h>0){
      xsvals+=h
      xsbins+=cr_len
    }
   
    //push the special end bin to its own group
    bingrp_dbin.push(nbin) 
    bingrp_cppl.push(_cntofbin[nebin])
    
    //push magic terminator values to rmarks also...
    bingrp_dbin.push(0)
    bingrp_cppl.push(0) //todo ?really infinity or other breaking value
                        //an int might be better for array consistency
    
    //~ see=0

    if(see){
      console.log("bingrp_dbin:",bingrp_dbin.join(", "))
      console.log("bingrp_cppl:",bingrp_cppl.join(", "))
      console.log("minv",minv,"lomark",lomark)
      console.log("maxv",maxv,"himark",himark)
      console.log("xsvals",xsvals,"xsbins",xsbins) 
    }
    
    if(see){
      //~ console.log("cntbn",_cntofbin.join(", "))
      var ff=0,cc=0,bb=0
      while(bingrp_dbin[ff]){
        var nn=bingrp_cppl[ff]; bb=cc;cc=bingrp_dbin[ff++]
        console.log(
          "cntbn",bb,"to",cc,":",nn,"=",_cntofbin.slice(bb,cc).join(", ")
        )
      }
      
    } 
         
    /// rmarks done  -  begin rearangers .....
     
    //if low spillage skip this rebinning
    var spill_trip=0 //calib cancel rebinning
    if( xsvals < nbin*spill_trip ){ 
      if(see) console.log("low spill no rebin",xsvals)
      return nbin
    } //turns out doesnt need rebinned
    
    
    var ndbin=nbin
    if( lowdiverse ){
      if(nbin>50){ 
        ndbin=42 
        if(see) console.log("dropped ndbin ot 42")
      }
    }
                     // struc-of-array rearrangers:
    var rbinvala=[]  // value which separates from prev range
    var rbinscal=[]  // targetnum of bins / full val len this range
    var rbinbina=[]  // anchor bin of this range
      
    var valperbin   = 1/binperval
    var ndbin_per_ppl = (Math.floor(ndbin*0.99-2))/(ov-st) 
    var rmbin=0.5  //  carry remainder of bin nb change 
    
    //minv, maxv are true bounds, they may be infinite 
    //lomark, himark are nominal bounds, finite 

    var bsepval=-0, csepval=-0    // behind separation value
   
    var oabin=0 //output anchor bin number (in redone bins)

    var sbin_b=0 ,sbin_c=0 ,sbin_d=0 //sbin_d -> sbin_c, sbin_c -> sbin_b 

    var dmk=1 , emk=bingrp_dbin.length-1  //a terminator element at end
          
    var enter_rbinbin=0 , enter_rbinvala=-1
    
    //skip special intro range
    if(!similar85(lomark , minv + 1/binperval) ){//then first range is special
      
      //do something with range 0 ///skipping for now
      if(bingrp_cppl[0]){
        rbinscal.push(0)          //val scale to result ibins
        rbinvala.push(-Infinity)  //behind sep val (low anchor of range )
        rbinbina.push(oabin++)    //anchor of output bin 
      } 
      //range 1 will start at bin 1, 
      //lomark is bin1 -valperbin
      //so the sep will work 
      enter_rbinbin=1, enter_rbinvala=lomark, sbin_c=1 
    }else{
      enter_rbinbin=0, enter_rbinvala=minv, sbin_c=0
    } 
            
    ///enter following loop with:
    ///
    /// go in with a range read in to vars, either 0 or 1
    // sbin_b is anchor of entrance range, when simple its 0
    // sbin_c is overwritten by sbin_d 
    sbin_d=bingrp_dbin[enter_rbinbin] //this is the bin after enter_rbinbin !
    // csepval as anchor val
    dmk =enter_rbinbin+1 // this is the subsequent range to assess in 
                       // relation to enter (bingrp_cppl[enter_rbinbin+1])
    
    csepval=enter_rbinvala
    //subsequent seps are: csepval=lomark + valperbin*sbin_c
    
    //dppl becomes cppl
    var cppl=0, dppl=bingrp_cppl[enter_rbinbin] 
    
    //ddense becomes cdense 
    var ddense = dppl/(sbin_d-sbin_c), cdense=ddense 
            
    //if(see){ console.log("rmark") }
    
    var winfwd=nbin>>2 + 1  //todo calibrate
    
    var winppl=0, winmkc=dmk //window mark anchor, end 
    var winbina = bingrp_dbin[enter_rbinbin], winbine=winbina //window bin anchor, end
     
    var cutrang = 60//todo calibrate, large is fewer rearanges
    
    sbin_b=sbin_c
         
    //first span is starting at bin 0 or bin 1 (sbin_b and sbin_c)
    //enter_rbinbin is 0 or 1
    //  sbin_d : spanbin_due is bingrp_dbin[enter_rbinbin]
    //  is the e+1 of first span to place
    //dmk : due mark is enter range + 1
    //cppl is 0, dppl is ppl of first span to place bingrp_cppl[enter range]
        
    if(see){ console.log("begin make rebinners") }
    
    var negrps=bingrp_dbin.length
    
    while( dmk<negrps ){   //last bingrp_dbin is 0 for sbin_d
      
      if(see){ console.log("\n start rbin loop"
        ,"sbin_b" ,sbin_b ,"sbin_c" ,sbin_c ,"sbin_d",sbin_d
      )}
      
      //sbin_b is here: old sbin_c (prev range anchor bin)
      //sbin_c is here:
      //  the e+1 bin of the last placed span
      // &the anchor of the new start span
      //sbin_d is here:the end+1 bin of the next to place span
      //it was not accepted to the previous 
      //it becomes the growing end of this span
     
      winppl  -= cppl            //last placed range ppl, - from window
      winbina += sbin_c - sbin_b //last placed range length, step wbin anchor
      
      cppl=0, sbin_b=sbin_c
      
      var wreach= sbin_d+winfwd ; wreach = wreach<nebin ? wreach:nebin
      
      //spanbindue is end of current population
      //if winfwd was 0 ...
      //winbine moves to end of span after span ppl is added
      //minbina will move forward from sbin_bc..
      //this should track a window beginning at sbin_d 
      while( winbine<wreach ){    //reads 1/4 of array ahead
        winppl  += bingrp_cppl[winmkc] //winmkc starts as enterrange
        winbine  = bingrp_dbin[winmkc++] //winmkc only changes here
      }                                 //winbina starts as anchor of next candidate 
      
      var wdense=winppl/(winbine-winbina), cdense=ddense
      
      if(see){ console.log("local levels:"
        ,"wreach,",wreach,"winbina" ,winbina ,"winbine" ,winbine ,"winppl,",winppl
      )}
          
      do{ /// /// /// /// /// /// /// ///
        
        //advances sbin to end of current scale_range 
        //must not extend range to last if last is a special
        //overflow range
      
        sbin_c= sbin_d  //sbin_c=d can only be less 
        cppl += dppl    //than special end bin here
        
        dppl   = bingrp_cppl[dmk]   //end mark has Infinite load
        sbin_d = bingrp_dbin[dmk++] //and 0 pos
        
        cdense=cppl/(sbin_c-sbin_b) //this ranges density
        ddense=dppl/(sbin_d-sbin_c) //the due spans density
        
        // cdense is close to ddense never split
        var rbindev = Math.abs((cdense-ddense)/(cdense+ddense+1))
        
        // cdense is close to wdense tend not to split
        rbindev*= Math.abs((cdense-wdense)/(cdense+wdense+1))+0.7//todo calib 
  
        // if duration is low tend not to split
        rbindev *= Math.sqrt(4+sbin_d-sbin_b) //todo calib

        if(see)console.log(
          " dmk",dmk-1
         ,"sbin _c",sbin_c,"_d",sbin_d,"  dppl",dppl
         ," dense c",cdense.toFixed(3),"d",ddense.toFixed(3),"w",wdense.toFixed(3)
         ," rbindev",rbindev.toFixed(3)
        )
      
      }while( rbindev<cutrang && dmk<negrps )
      
      if(see&&rbindev<cutrang){
        console.log(":bunched bins sbin_b",sbin_b,"to sbin_c",sbin_c)
      }
      if(see&&dmk==negrps)console.log("near end of bins",dmk)
      //make it a little harder to split as number increases
      cutrang*=1.1 //todo calibrate
      
      //after that, a due range is sbin_c (inc) to sbin_d (exc), and dppl
      //and current range is: sbin_b(inc) to sbin_c(exc), and cppl

      bsepval=csepval
      csepval=lomark + valperbin*(sbin_c-1)  //high end of src bin range 
                                           //todo refac the sbin_c-1
      if(see)console.log("bsepv",bsepval.toFixed(7),"to csepv",csepval.toFixed(7),"cppl",cppl)
      i
      if(see)console.log("ibins = cppl",cppl,"* ndbinpp",ndbin_per_ppl.toFixed(5))
      
      var ibins= cppl*ndbin_per_ppl+rmbin  //ideal bins for population 
      rmbin= ibins-(ibins=Math.ceil(ibins)||1)  //carryon smartpants
      
      //~ ibins=Math.ceil(ibins)
      if(see) console.log("rmbin",rmbin,"ibins",ibins)
      
      var valobins=(csepval-bsepval)/ibins  //range of an ideal bin
      
      if(see)console.log("valobins=(csepval",csepval.toFixed(5),"-",bsepval.toFixed(5),"bsepval)/ibins",ibins,(1/valobins).toFixed(6))
      
    
      if(see)console.log("writing oabin",oabin,"bsep",bsepval,"scal",1/valobins,"\n")
      rbinvala.push(bsepval)    //behind sep val (low anchor of range )
      rbinbina.push(oabin)      //current anchor bin 

      if(cppl){
        rbinscal.push(1/valobins) //val scale to result ibins
        oabin+=ibins
      }else{ rbinscal.push(0) }
      
    }// leaves on last mark where sbin_d = 0 
   
    //the last rang will be up to the last bin pos marked
    //the sep val of the last bin is not infinite
    
    //rebin according to tallanalysis
   
    //last one to catch overflows
    //~ see=0
    if(see){ console.log(
      " exit rbin loop oabin",oabin,"cppl",cppl,"sbin_d",sbin_d,
    "\n bingrplen",bingrp_dbin.length  ) 
    }
    
    rbinscal.push(0) //val scale to result ibins
    rbinvala.push(himark) //behind sep val (low anchor of range )
    rbinbina.push(oabin++)      //current anchor bin 
    
    //real last one to bounce end
    rbinscal.push(0)
    rbinvala.push(NaN)  //never passes
    rbinbina.push(0) 
   
    
    
    if(see){
      console.log("rbinscal",zap(rbinscal,function(a){return a}).join(", "))
      console.log("rbinvala",zap(rbinvala,function(a){return a}).join(", "))
      console.log("rbinbina",rbinbina.join(", "))
    }
    
    //~ see=0
    
    /////////////////////////
    if(see)console.log("Cntbnna",reduce(_cntofbin),"nbin",nbin,"cnt.len",_cntofbin.length)
    if(see)console.log("Cntbn",joinendsfixedwidth(_cntofbin,0))
    
    
    for(var ch=0; ch<ndbin; ch++){ _cntofbin[ch]=0 }

    var ccc=0
             
    for(var i=st; i<ov; i++){    //got here in the end 
      var ri=1 , cval=kysval[i]
      
      while(cval>=rbinvala[ri]) ri++ //find sepval more than cval
      var bin=(((cval-rbinvala[--ri])*rbinscal[ri])>>0)+rbinbina[ri]
      
      kysbin[i]=bin
       
      if(see&&(_cntofbin[bin]===undefined||bin>=nbin||bin<0)){
        ccc++
        if(ccc<20){
          console.log("rebad key",i,"val",cval,"rebin ak",rbinbina[ri],"rebin",bin,"ndbin",ndbin)
          console.log(" rbinvala",rbinvala[ri],"rbinscal",rbinscal[ri])
          console.log(" rbinvale",rbinvala[ri+1],"rbinescal",rbinscal[ri+1])
        }
      }
      //~ if(see&&cval>400) console.log("xb",cval,rbinbina[ri])
      //~ _cntofbin[bin]++ 
    }
    
       
    if(descend){ //simple hack to do convert to descending
      ndbin--
      for(var i=st; i<ov; i++) 
      { kysbin[i]=ndbin-kysbin[i] }
      ndbin++ 
    }
    
    var maxbin=0
    for(var i=st; i<ov; i++){ 
      if(see){
        if(maxbin<kysbin[i]) maxbin=kysbin[i]
      }
      _cntofbin[kysbin[i]]++ 
    } 
   
    if(see)console.log("maxbin",maxbin,"cnt",_cntofbin[maxbin])
    if(see)console.log("reduce Cntbn",reduce(_cntofbin))
    
    if(see)console.log("reCntbn",joinendsfixedwidth(_cntofbin,0))
    if(see&&_cntofbin.length>nbin)
    { console.log("Cntbn LEN ERR",nbin,_cntofbin.length) }
    
    
    return ndbin
  } 

    
  function islowdiverse(kysval){
     
    var nkys=kysval.length 
    var cj=0, qn=Math.floor(kysval.length/10)

    var v0=kysval[0],v1,v2,v3

    while(++cj<nkys){
      if( kysval[cj]!==v0 ){ v1=kysval[cj]; break }
    }
    while(++cj<nkys){
      if( kysval[cj]!==v0
       && kysval[cj]!==v1 ){ v2=kysval[cj]; break }
    }
    while(++cj<nkys){
      if( kysval[cj]!==v0
       && kysval[cj]!==v1
       && kysval[cj]!==v2 ){ v3=kysval[cj]; break } 
    }
    while(++cj<nkys){
      if( kysval[cj]!==v0
       && kysval[cj]!==v1
       && kysval[cj]!==v2 
       && kysval[cj]!==v3 ){ if(--qn==0) break }
    }

    if(cj>=nkys){
      //low diversity input detected
      //reduce nbar andor nbins
      if(see)console.log("is low diversity",cj,qn)

      return true
    }

    if(see)console.log("is not low diversity")
    return false
  }

  function joinendsfixedwidth(Ar,fx){
    
    var an=Ar.length
    var en=ntain(Math.floor(an/3),0,50)
    var s=zap(Ar.slice(0,en),function(a){return a.toFixed(fx)}).join(", ")
        + ",...," + zap(Ar.slice((an-en)>>1,(an+en)>>1),function(a){return Number(a).toFixed(fx)}).join(", ")
        + ",...," + zap(Ar.slice(an-en,an),function(a){return Number(a).toFixed(fx)}).join(", ")
        
    return s
  }

  function similar85(a,b){ return (7.5*a/b)>>0 ==7 }
  function similar40(a,b){ return (a/b+0.5)>>0 ==1 }

  function binspillage(nbin,full){ 
    
    //~ if(see) console.log("_cnt00:",_cntofbin.join(","))
    var spill=0 , duoppl=_cntofbin[0]+_cntofbin[1] 
    for(var i=2; i<nbin; i++){ 
      
      duoppl+=_cntofbin[i] //(trio ppln)
      var kov=duoppl-full
        
      if(kov>0){ 
        spill+=kov*kov 
        //~ if(see)console.log("duoppl",duoppl,"kov",kov)
        duoppl-=kov
      }
      
      duoppl-=_cntofbin[i-2] 
      duoppl=duoppl<0?0:duoppl

    }
    return Math.sqrt(spill)>>0
  }
  
  
  function welfordscan(Ai,st,ov){
    
    var minv=Ai[st] ,maxv=minv ,smnm=0, qvl=-0 
    var delt=-0 ,delt2=-0 ,mean=-0 ,me2=-0 
    
    for(var i=st; i<ov; i++) //need to max,min 
    { 
      qvl=Ai[i]||-0 
      
      if (qvl>=maxv)
      { maxv=qvl ; if(qvl === Infinity) continue } 
      else if (qvl<=minv)
      { minv=qvl ; if(qvl === -Infinity) continue }
          
      //calc variance.. welfords alg
      smnm++	
      delt  = qvl  - mean
      mean += delt / smnm
      delt2 = qvl  - mean
      me2  += delt * delt2	
      
      //~ console.log(smnm,delt,delt2,delt*delt2,(delt/smnm)*delt2)
    }
    
    var sdev= smnm>1? Math.sqrt( me2/(smnm-1) ) : 0

    return {minv:minv ,maxv:maxv ,sdev:sdev ,mean:mean } 
  }
   

  function barassign_secure(kysval,nbar,barppl,arg){
    var ixkeys=sortorder(kysval,arg.descend,[],0,0)  //unoptimal without st,ov
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
    
    //~ see=0//1//1//1//false//true//false//true//false//true
    if(see)console.log("doing sortorder",desc)
    
    var flipp=false, Alen=Av.length, minlen=10, hard=false
    var lowdiverse=false
    
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
      if((up*3>samp)&&(dw*3>samp)){ 
        hard=true
      }else{
        lowdiverse=islowdiverse(Av)	
      }
    }
    if(see)console.log ("hard:",hard,"flipp:",flipp)
    if( !(Ax&&Ax.length>=Alen) ){ Ax = ixArray(Av,flipp) }
    
    if(desc) { compar=lessthan } else { compar=morethan }
    var st=0
    ////////////////////////////////// take away true!!!!!!!!!!!!!!!!!!!!!
    if( (!(skiptry||lowdiverse))&&!(hard&&(Alen>80)) ){ //try insertsort
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
      if(Av.length<1500000){ barlen=10 }
      if(Av.length< 300000){ barlen=6  }
      
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
       ,lowdiverse:lowdiverse
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
  
  
  function stndindex(Av,desc,Ax){
    
    if(!Ax||Ax.length<Av.length){
      Ax=new Array(Av.length)
      for (var i=0,e=Av.length; i<e; i++) Ax[i] = i
    }
    
    if(desc){
      Ax.sort( function (b, a) { return Av[a] - Av[b] } )
    }else{
      Ax.sort( function (a, b) { return Av[a] - Av[b] } )
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
    
  
    
  function longindex(Av,desc,Ax){
    
    //see=1
    
    if(!Ax||Ax.length<Av.length){
      Ax=new Array(Av.length)
      for (var i=0,e=Av.length; i<e; i++) Ax[i] = i
    }

    if(desc) { compar=lessthan } else { compar=morethan }
    longsort(Av,Ax,250000000)
    return Ax
  }
  
  function longsort(Av,Ax,bottle){
    mergcach=[] //reset this global
    var Alen=Av.length ,mergs=bottle*(Alen+10000) 
    
    var tail=30 ,block=250
    var parts=[0], uflow=0, umost=1000, umo=500
    
    var first=ntain(150,0,Alen), st=first ,nx,snip
    
    var rres=inpairsort(Av,Ax,1,first,0)
    //console.log("res was",rres)
    
    //like insertsort
    
     
    while ( st < Alen){ 
     
      //~ if(see)console.log("st",st)
    
      nx=ntain(st+block,0,Alen)
      
      snip=inpairsort(Av,Ax,st,nx,st-tail)
      
      if(snip){ //insertsort backflowed
        
        if((nx-uflow)>umost){ uflow+=umo } //move uflow
        
        var k=minglemerge(Av,Ax,st-tail,nx,uflow )
        
        //~ if(see)console.log(
          //~ "ming k",k,"s",st-tail,"nx",nx,"uflow",uflow
        //~ )
        
        mergs-=Math.sqrt(snip)*k 
        if(mergs<0){ return false } //some crazed loopout
        
        if(k>uflow-(st-tail)){ //note new partition
          //console.log("part",uflow)
          if(parts[parts.length-1]!==uflow){
            //console.log("wpart",uflow)
            parts.push(uflow)
          }
        } 
      }
      mergs+=bottle
      st=nx 
    }
    
    if(parts.length>1){ // partitions must be revisited
      
      var cpr=1//parts.length
      var bp,cp,dp=parts[0], qp
      
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
        
        //console.log("mingled cp",cp,"dp",dp,"bp",bp,"k",k)

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


  var mergcach=[] 

  function sparsemerge(Av,Ax,s,e,b){
   
    if(e-s>mergcach.length) mergcach=new Array(ntain((e-s)*3,0,Av.length))
    for(var h=0,j=s,ee=e-s;h<ee; ) mergcach[h++]=Ax[j++] 
    
    var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

    ///skip to first insert 
    while( (clonx>=0) && !compar( Av[Ax[hipt]],Av[mergcach[clonx]] ) ) // is not jdest
    { clonx--,wrpos-- } 
    
    while(clonx>=0)// ix of copyel to place
    {
      lep=1,bhipt=hipt
      
      ///insert first chunk
      while( (hipt>=b) && compar( Av[Ax[hipt]],Av[mergcach[clonx]] ) ) // is not jdest
      { hipt=hipt-(lep++) } 
      if(hipt++<b){ hipt=b } 
      
      while( (hipt<=bhipt) && !compar( Av[Ax[hipt]],Av[mergcach[clonx]] ) ) // is jdest
      { hipt++ }  //careful with stability here, get equal high as poss
      hipt--
      
      for(var c=bhipt,d=c+wrpos-bhipt;  c>hipt; ){
        Ax[d--]=Ax[c--]  //fiddle these byones
      }
      
      wrpos-=(bhipt-hipt)
      Ax[wrpos]=mergcach[clonx]
      wrpos--,clonx--
                          
    }//while

    return wrpos<b?s-wrpos+1:s-wrpos //merge underflowed
  } 
  
  //merge s-e with section behind them, back to b 
  function minglemerge(Av,Ax,s,e,b){
     
    if(e-s>mergcach.length) mergcach=new Array(ntain((e-s)*3,0,Av.length))
    for(var h=0,j=s,ee=e-s;h<ee; ) mergcach[h++]=Ax[j++] 
    
    var wrpos=e-1, clonx=e-s-1, hipt=s-1, bhipt=hipt, lep=1 

    ///skip to first insert 
    while( (clonx>=0) && !compar( Av[Ax[hipt]],Av[mergcach[clonx]] ) ) // is not jdest
    { clonx--,wrpos-- } 
    
    while(clonx>=0)// ix of copyel to place
    {
      bhipt=hipt
      
      while( (hipt>=b) && compar( Av[Ax[hipt]],Av[mergcach[clonx]] ) ) // is not jdest
      { hipt-- } 
   
      for(var c=bhipt,d=c+wrpos-bhipt;  c>hipt; ){
        Ax[d--]=Ax[c--] 
      }
      
      wrpos-=(bhipt-hipt)
      Ax[wrpos]=mergcach[clonx]
      wrpos--,clonx--
                
    }//while

    return wrpos<b? s-wrpos+1 : s-wrpos //merge underflowed
    //returns ... dunnonow...
  } 
   
    
  function reorder(Av,Ax){
    
    var Ar=new Array(Av.length)
    for(var j=0,e=Ax.length;j<e;j++){
      Ar[j]=Av[Ax[j]]
    }
    return Av=Ar
  }

  function zap(Ai,f){ //map
    
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
    
    ,stndindex : longindex//stndindex
    ,longindex : longindex
    ,insertndx : inpairsortx
    
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
