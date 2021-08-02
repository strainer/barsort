require ('./dlib/mutilxt.js')
//~ Fdrandom=require ('../Fdrandom.min.js')
Fdrandom=require ('./dlib/Fdrandom.js')
require ('./dlib/Testprngs.js')
require ('./dlib/floatpresc.js')



//makes histogram of key data distribution
//indexes bars of the histogram to equally fill bins
//loops through key data assigning bin


//sect_at_dlsi[dli]= cel      //the dwnsector of the jote in the line
//sectppl[cel]++              //population of cel


//uses jote and dlns
//outputs to sect_at_dlsi , sectppl

/// Histosort - sorts into bins of ascending scale like radix
/// is much faster than full standard sort

//required doofles..

var sect_at_dlsi=[]
var sectppl=[]
var valq_at_dlsi=[]

function histosort(dv,st,ov){
  
  var avg=-0 , val=-0 ,nb=ov-st, secti=sect_at_dlsi
  
  var Ar = valq_at_dlsi ,minv=maxv=Ar[st] 
  
  for(var i=st; i<ov; i++) //need to max,min 
  { 
    ///this is setup before histosort
    //~ var j=dlns[st]
    //~ val=Math.sqrt(
      //~ jote.x[j]*jote.x[j]+jote.y[j]*jote.y[j]+jote.z[j]*jote.z[j]
    //~ )
    
    val=Ar[i]||0
    avg+=val
    if (val>maxv){ maxv=val }
    if (val<minv){ minv=val }
  }
   
  avg/=nb
  avg-=minv
  maxv-=minv

  var hiv=0,havg=-0
  
  for(var i=st; i<ov; i++) 
  { val=Ar[i]-=minv 
    if (val>avg){ hiv++;havg+=val }
  }
 
  
  var qhi=2*havg/hiv  //prelim estimate of good maxv
  //~ conlog('qhi',qhi,'maxv',maxv)
  if(qhi>=maxv){ qhi=maxv*0.99999999 }
  
  //~ var hfac=5  //over sample x5
  var hfac=0.5  //over sample x5
  
  //~ vel_of_dlsi.sort(function (a, b){return a - b}) 
  var hdiv=Math.floor(hfac*dv), hdi=hdiv-1
  
  //todo recycle these temp arrays
  var uphistn=new Array(hdiv), destofup=new Array(hdiv)
  for(var ch=0; ch<hdiv; ch++){ uphistn[ch]=0 }
  
  var destn=[]//sectppl
  for(var ch=0; ch<dv; ch++){ destn[ch]=0 }
  
  for(var i=st; i<ov; i++){
    //~ Ar[i]/maxv is not morethan 1, hdiv is max pot id
    //gets floored so if v > hpot[dv] and v < hpot[dv+1] its counted
    
    val=Math.floor(hdiv*Ar[i]/maxv)
    val=(val>hdi)?hdi:val
    uphistn[valq_at_dlsi[i]=val]++
  }
  
  var dvn=nb/dv ,dvnfl=Math.floor(dvn), dvrem=(dvn-dvnfl)*1.0000000001
  var drem=-0, xx=(drem+dvrem)%1
  var fillit=0, dvn=Math.floor(dvn) //err??
  
  for(var h=0; h<hdiv; h++){
    
    destofup[h]=fillit        //uphistn bar h goes to dest[fillit]
    destn[fillit]+=uphistn[h]  //destn[fillit] gets population of bar h
    while(destn[fillit]>=(dvnfl+xx)){ //if dest[f] is full, dest[f] will fill then carry 
      destn[fillit+1]+=(destn[fillit]-dvnfl-xx)  //to next 
      destn[fillit]=dvnfl+xx                     //that fillit is full
      fillit++ 
      drem=drem+dvrem
      if(drem<1){ xx=0 }else{ drem-=1,xx=1}
    }                                       //and will fill no more
    
  }

  //~ console.log('uphistn',uphistn)
  //~ conlog('0 > mx/dv, mx/dv > 2mx/dv, ... >dv*mx/dv')
  
  //~ console.log('destofup',destofup)
  //~ conlog('same value intervals goes to id as dest[id]')
  
  //~ console.log('destn',destn)
  //~ conlog('spaces free in dests')
    
  //dumb fix for pop fraction issues
  for(var i=0;i<dv;i++){ sectppl[i]=destn[i]=Math.ceil(destn[i]) }
  
  for(var i=st; i<ov; i++){
    
    var hpotofi=valq_at_dlsi[i]
    
    while(destn[destofup[hpotofi]]===0){ destofup[hpotofi]++ }
    destn[destofup[hpotofi]]--
    secti[i]=destofup[hpotofi]
  }
  
}

//~ var a= Fdrandom.bulk(10 ,Fdrandom.lrange ,0.01 ) 
//~ var a= Fdrandom.bulk(40 ,function(){return st++} ,1 ,60) //array of 40 d60 rolls

//~ for(var testlen=10; testlen<500000; testlen*=1.1)
{

var testlen=100000

var rough=Fdrandom.mixof(Fdrandom.bulk( 500,function(){return Fdrandom.irange(0,1000)} ),Math.floor(testlen))
var valq_at_dlsi = rough 

var sects=Math.floor(testlen/75)//Fdrandom.irange(1,20)

var stq=0,ovq=valq_at_dlsi.length

//~ valq_at_dlsi.sort(function(a, b){return b-a})
histosort(sects ,stq ,ovq)
//~ conlog(sect_at_dlsi)
//~ bench(function(){ histosort(sects ,stq ,ovq) }, 1, "hist", 0) 

logoot()

//perf is approx 10million keys per sec on 1.5 ghz core2
///////////////////////

function logoot(){
  var tcnt=0
  var oot="hs report\n"
  for(var s=0; s<sects;s++)
  {
    oot+="\n"+s+":"
    for(var i=stq;i<ovq;i++){
      if(sect_at_dlsi[i]==s){ 
        tcnt++,oot+=" "+valq_at_dlsi[i] 
        sectppl[s]--
      }
    }
  }
  
  for(var s=0;s<sects;s++)
  { if(sectppl[s]) conlog("probl",sectppl[s]) }
  //~ conlog(oot)

  if(tcnt!==ovq-stq){ conlog("bad size!")}
  else{ conlog("size is alright") }
    
  //conlog('valq_at_dlsi',valq_at_dlsi)
  //conlog('sect_at_dlsi',sect_at_dlsi)
  //conlog('sectppl',sectppl)
  
}

}