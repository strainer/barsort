require ('../dlib/mutil.js')
Fdrandom=require ('../dlib/Fdrandom.js')
Barsort=require('../barsort.js')

//~ var tlen=15000000
var tlen=1000000
console.log((tlen*8/1000000).toFixed(0),"megabyte test array")

//~ var zum=0,int_riser=Fdrandom.bulk( tlen,function(){return zum+++Fdrandom.irange(0,2)} )

var real_rg=Fdrandom.mixof( Fdrandom.bulk( 30000,function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g} ) ,tlen )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.gthorn()*Fdrandom.gthorn()*1000 } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.gbowl()*1000) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return (Fdrandom.dbl()*1000) } )

//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.f48()*1000 } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) } )
//~ var real_rg=Fdrandom.bulk( tlen,function(){ return Fdrandom.irange(1,6) * Fdrandom.range(1,60) * Fdrandom.range(1,600) * Fdrandom.range(1,6000) *Fdrandom.range(1,60000)  *Fdrandom.range(1,600000) *Fdrandom.range(1,600000) } )
//~ real_rg.push(100000000000)

//~ speeds(real_rg)
//~ return




             
  function comb3a(Av,Ax,s,e,jmp){ 
    var t=0,jmps=0, uu,ww, probles=0
    var jmpb=Math.floor(jmp*0.28)
    var jmpc=Math.floor(jmp*0.98)
    
    for(var cc=s ,es=e-1-jmp; cc<es; cc+=1) //or2
    { 
      var cd=cc+1,jc=cc+jmp,jd=jc+1 
      
      //cc>cd cd>jd  =8 
      //cc>cd cd>jc  =8 

      //~ uu=cc+jmpb+1, ww=jc
      uu=cc, ww=jd
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=cc+jmpb, ww=cc+jmpb+1
      uu=cc+jmpb, ww=cc+jmpc
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=cc, ww=cc+jmpb
      uu=cc, ww=cc+jmpb
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }



      //~ uu=cc+jmpb+1, ww=jc
      //~ if( Av[Ax[uu]] > Av[Ax[ww]] )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=jd, ww=jc, oo=1
      //~ if( Av[Ax[uu]] > Av[Ax[ww]]*oo )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t,jmps++ }
    }
  
    return jmps/(e-1-jmp-s)
  } 
             
  function comb22(Av,Ax,s,e,jmp){ 
    var t=0,jmps=0, uu,ww, probles=0
    //~ var jmpb=Math.floor(jmp*0.65)+1
    
    for(var cc=s ,es=e-1-jmp; cc<es; cc+=1) //or2
    { 
      var cd=cc+1 ,jd=cc+jmp ,jc=jd-1 
      
      //cc>cd cd>jd  =8 
      //cc>cd cd>jc  =8 

      uu=cc, ww=jd
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      uu=cd, ww=jc
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=cc+jmpb, ww=cc+jmpb+1
      //~ if( Av[Ax[uu]] > Av[Ax[ww]] )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=cc+jmpb+1, ww=jc
      //~ if( Av[Ax[uu]] > Av[Ax[ww]] )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=jd, ww=jc, oo=1
      //~ if( Av[Ax[uu]] > Av[Ax[ww]]*oo )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t,jmps++ }
    }
  
    return jmps/(e-1-jmp-s)
  } 

  function comb3(Av,Ax,s,e,jmp){ 
    var t=0,jmps=0, uu,ww, probles=0
    var jmpb=Math.floor(jmp*0.65)+1
    
    for(var cc=s ,es=e-1-jmp; cc<es; cc+=1) //or2
    { 
      var cd=cc+1,jc=cc+jmp,jd=jc+1 
      
      //cc>cd cd>jd  =8 
      //cc>cd cd>jc  =8 

      uu=cc, ww=cd
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      uu=cd, ww=cc+jmpb
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      uu=cc+jmpb, ww=cc+jmpb+1
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      uu=cc+jmpb+1, ww=jc
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=jd, ww=jc, oo=1
      //~ if( Av[Ax[uu]] > Av[Ax[ww]]*oo )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t,jmps++ }
    }
  
    return jmps/(e-1-jmp-s)
  } 

  function comb(Av,Ax,s,e,jmp){ 
    var t=0,jmps=0, uu,ww, probles=0
  
    for(var cc=s ,es=e-1-jmp; cc<es; cc+=1) //or2
    { 
      var cd=cc+1,jc=cc+jmp,jd=jc+1 
      
      //cc>cd  jc>jd  cc>jc  =~7 
      //cc>cd  jc>jd  cd>jc  =~8 
      //cc>cd  jc>jd  cd>jd  =~0! 
      //cc>cd  jc>jd  cc>jd  =~0! 

      //cc<cd  jc>jd  cc>jc  =<6
      //cc<cd  jc>jd  cd>jc  =<6
      //cc<cd  jc>jd  cd>jd  =<6 
      //cc<cd  jc>jd  cc>jd  =<6 
      
      //cc<cd  jc<jd  cc>jc  =<6
      //cc<cd  jc<jd  cd>jc  =<6
      //cc<cd  jc<jd  cd>jd  =<6 
      //cc<cd  jc<jd  cc>jd  =<6 

      //cc>cd cc>jc  =7
      //cc>cd cc>jd  =6.5
      //cc>cd cd>jd  =8 
      //cc>cd cd>jc  =8 
      
      //cc<cd cc>jc  =<6
      //cc<cd cc>jd  =<6
      //cc<cd cd>jd  =<6 
      //cc<cd cd>jc  =<6 
      
      
      //cc>cd  jc>jd  cd>jc  =~8 
      
      //cc>cd cd>jd  =8 
      //cc>cd cd>jc  =8 


      uu=cc, ww=cd
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      if(jc>e) probles++
      uu=cd, ww=jc
      if( Av[Ax[uu]] > Av[Ax[ww]] )
      { 
        t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t }

      //~ uu=jd, ww=jc, oo=1
      //~ if( Av[Ax[uu]] > Av[Ax[ww]]*oo )
      //~ { t=Ax[uu],Ax[uu]=Ax[ww],Ax[ww]=t,jmps++ }
    }
  
    if(probles) console.log("probs",probles)
    return jmps/(e-1-jmp-s)
  } 

  //lowindex lowvalue

  function score(Av,Ah){
    
    var ss, sm=0, Aj= Barsort.stndindex(Av)
    
    for(var i=0,e=Av.length;i<e;i++){
      
      if((Av[Ah[i]]-Av[Aj[i]])!=0){
        ss=Math.abs(Av[Ah[i]]-Av[Aj[i]])
        sm+=ss*ss
      }
    }
    
    return sm
  }
  
  
  function sutest(){
    
    Fdrandom=Fdrandom.hot()
    
    var tzlen=100000, rep=10, arep=rep, sumsc=0
    
    var ctz=0
    var dx=Fdrandom.bulk( tzlen,function(){ return ctz++ } )
    
    var sweeps=0
    while(rep--){
      
      var tzt=Fdrandom.mixof( Fdrandom.bulk( tzlen>>>2,function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g} ) ,tzlen )
      
      //~ sumsc-=score(tzt,dx)
      
      for(var jp=tzt.length*0.67;jp>30; jp=jp*0.66){
        sweeps++ 
        
        comb3f( tzt,dx, 0, tzt.length, Math.floor(jp+1) ) //0.50  60 sweeps
        //~ comb3f( tzt,dx, 0, tzt.length, Math.floor(jp+1) ) //0.50  60 sweeps
        //~ comb3( tzt,dx, 0, tzt.length, Math.floor(jp+1) ) //0.50  60 sweeps
        //~ comb( tzt,dx, 0, tzt.length, Math.floor(jp+1) )      //0.60  80 sweeps
      
      }
      
      //~ insertndx(tzt,dx,20000000)
      
      //~ console.log(tzt[dx[0]],tzt[dx[1]],tzt[dx[2]])
      //~ console.log(dx[0],dx[1],dx[2])
      var gg=score(tzt,dx)
      //~ console.log()
      
      sumsc+=gg
    }
    
    //~ console.log("improved",sumsc/(tzlen*rep*131000000000000))
    console.log("sweeps",sweeps,"entrop",sumsc/(tzlen*arep*1310000000000000000000000))
    
  }
  
    
  function insertndx(Av,Ax,limlim){ 
    
    var lim=0, limlim=(limlim||20)*Ax.length
    
    for(var e=Ax.length ,dueway=1 ;dueway<e; dueway++){
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
        return dueway-1 }
    }

    return dueway
  }
  



  function fullcomb(Av,Ax,s,e,jmp,gap){ 
    var t=0
    for(var jp=(e-s)*0.67 ;jp>gap; jp=jp*0.6667 ){
      for(var cc=s,cd=cc+1,jc=s+Math.floor(jp); jc<e; jc++,cc=cd,cd++) 
      { 
        if( Av[Ax[cc]] > Av[Ax[cd]] ){ t=Ax[cc],Ax[cc]=Ax[cd],Ax[cd]=t }
        if( Av[Ax[cd]] > Av[Ax[jc]] ){ t=Ax[cd],Ax[cd]=Ax[jc],Ax[jc]=t }
      }
    } 
  } 
  
  //notes on fullcomb:
  //the proceedure orders completely with jump sub factor of 0.6666
  //if whole range is combed every time including where +gap goes out of bounds.
  //If only gap fitting range is combed proc orders less than completely, but 99.99% , 
  //- the high end of the range is not bubble sorted like the rest 
  //this will likely be insignificant when stopped early and followed by insertsort
  
  //a 3 focus comb might see significant improves over 2 focus...


  function scancomb(Av,Ax,s,e,jmp){ 
    var t=0,jmps=0
  
    for(var cc=s,cd=cc+1,jc=s+jmp,es=e-1-jmp; cc<e; jc++,cc=cd,cd++) 
    { 
      if( Av[Ax[cc]] > Av[Ax[cd]] ){ t=Ax[cc],Ax[cc]=Ax[cd],Ax[cd]=t }
      if( Av[Ax[cd]] > Av[Ax[jc]] ){ t=Ax[cd],Ax[cd]=Ax[jc],Ax[jc]=t, jmps++ }
    }
  
    return jmps/(e-1-jmp-s)
  } 


  function fulla(){
    
    Fdrandom=Fdrandom.hot()
    
    var tzlen=2000000, rep=1, arep=rep, sumsc=0
    
    var ctz=0
    var dx=Fdrandom.bulk( tzlen,function(){ return ctz++ } )
    
    var sweeps=0
    
    while(rep--){
      
      var tzt=Fdrandom.mixof( Fdrandom.bulk( tzlen>>>2,function(){ var g=Fdrandom.range(0,5000000); return Fdrandom.range(-20,20)*g*g} ) ,tzlen )
      
      //~ sumsc-=score(tzt,dx)
      //~ /*
      for(var jp=tzt.length*0.6667;jp>70; jp=jp*0.6667){
        //comb3f( tzt,dx, 0, tzt.length, Math.floor(jp+1) ) //0.50  60 sweeps
        comb3f( tzt,dx, 0, tzt.length, Math.floor(jp+1) ) //0.50  60 sweeps
        //~ comb( tzt,dx, 0, tzt.length, Math.floor(jp+1) )      //0.60  80 sweeps
      }
      
      fo=insertndx(tzt,dx,10)
      
      if(fo<tzt.length){ console.log("crapped out",fo/tzt.length) }
      //~ */
      
      //~ fo=Barsort.stndindex(tzt)
      //~ console.log(tzt[dx[0]],tzt[dx[1]],tzt[dx[2]])
      //~ console.log(dx[0],dx[1],dx[2])
      //~ var gg=score(tzt,dx)
      //~ console.log()
      
      //~ sumsc+=gg
    }
    
    //~ console.log("improved",sumsc/(tzlen*rep*131000000000000))
    //~ console.log("sweeps",sweeps,"entrop",sumsc/(tzlen*arep*1310000000000000000000000))
    
  }

   
function comb3f(Av,Ax,s,e,jmp){ 
  var t=0
     ,jmpb=Math.floor(jmp*0.28)
     ,jmpc=Math.floor(jmp*0.98)

  for(var cc=s ,es=e-jmp; cc<es; cc+=1) //or2
  { 
    var cd=cc+jmpb ,ce=cc+jmpc ,jd=cc+jmp 
    if( Av[Ax[cc]] > Av[Ax[cd]] ){ t=Ax[cc],Ax[cc]=Ax[cd],Ax[cd]=t }
    if( Av[Ax[cd]] > Av[Ax[ce]] ){ t=Ax[cd],Ax[cd]=Ax[ce],Ax[ce]=t }
    if( Av[Ax[cc]] > Av[Ax[jd]] ){ t=Ax[cc],Ax[cc]=Ax[jd],Ax[jd]=t }
  }
} 

//~ sutest()
fulla()
