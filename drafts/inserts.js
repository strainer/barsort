require ('../dlib/mutil.js')
//~ Fdrandom=require ('../Fdrandom.min.js')
Fdrandom=require ('../dlib/Fdrandom.js')

var testlen=100000

var rough=Fdrandom.mixof(Fdrandom.bulk( 500,function(){return Fdrandom.irange(0,1000)} ),Math.floor(testlen))

insertsort3( rough )

return

for(var len=3;len<300;len=Math.floor(len*1.20)+8)
{

conlog()
conlog("Testing:",len)

var zum
var rough=Fdrandom.bulk( len*40,function(){return zum+++Fdrandom.irange(0,2)} )
var rough=Fdrandom.mixof(
  Fdrandom.bulk( len,function(){return Fdrandom.irange(0,1000)} )
 ,len*40
)
 
var r=[]


//~ for(var i=0;i<rough.length;i++){ r[i]=rough[i] }

//~ insertsort( r )
//~ r.sort( function(a,b){return a-b} )

//~ for(var i=1;i<rough.length;i++){ 
  //~ if(r[i-1]>r[i]) conlog('oops') 
//~ }


for(var reps=0;reps<1;reps++){


ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    r.sort( function(a,b){return a-b} )
  }
  , 10, "sort", 0
) 

ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    r.sort( function(a,b){return a-b} )
  }
  , 10, "sort", 0
) 

var ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort0( r )
  }
  , 10, "insert0", 0
) 

var ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort0( r )
  }
  , 10, "insert0", 0
) 

ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort3( r )
  }
  , 10, "insert3", 0
) 

ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort5( r )
  }
  , 10, "insert5", 0
) 

ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort5( r )
  }
  , 10, "insert5", 0
) 

ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort3( r )
  }
  , 10, "insert3", 0
) 

ii=0,le=len*36
bench( 
  function(){ 
    for(var i=0;i<len;i++){ r[i]=rough[ii=(ii<le)?ii+1:0] }
    insertsort4( r )
  }
  , 10, "insert4", 0
) 

conlog()
}

}//test loooo

function insertsort(A){ // best for 8 to 20 elements iirc
  
  for(var e=A.length ,dueway=1 ;dueway<e; dueway++){
    var pick = A[dueway]
    var bacway =dueway-1
    while( bacway>=0 && A[bacway] > pick){ //if pre is smaller
      A[bacway+1] = A[bacway]              //
      bacway = bacway - 1
    }
    A[bacway+1] = pick                     //put pick down
  }

}


//relative performance on mixed distribution
//len  sort  insert  insert2
//10   100   800     850
//30   100   230     300
//60   100   130     180
//120  100   115     145
//200  100    70     100
//350  100    50      70
//1000 100    20      30

//on equal distribution:
//len  sort  insert  insert2
//50   100   100     120
//100  100   55      80
//200  100   25      40
//350  100   15      25
//
//insert2 is 50-80% faster than insert1 on equal distributions
//insert2 is 60% faster than insert1 on hard distributions
//insert2 is 10% slower than insert1 on easiest distributions
// 
function insertsort2(A){ // best for 8 to 20 elements iirc
  
  var ej=A.length, ek=Math.floor(ej/2)-1
  
  for(var e=ek ,dueway=1 ;dueway<e; dueway++){
    var pick = A[dueway] //if pick is small it will move back
    if( pick > A[dueway+ek] ){ pick=A[dueway+ek];A[dueway+ek]=A[dueway] }
    var bacway =dueway-1 //while all shift up
    while( bacway>=0 && A[bacway] > pick){ //if pick is smaller
      A[bacway+1] = A[bacway--]              //move move them up
    }
    A[bacway+1] = pick        //put pick down its larger
  }
  
  for(var e=ej ,dueway=ek ;dueway<e; dueway++){
    var pick = A[dueway] //if pick is small it will move back
    var bacway =dueway-1 //while all shift up
    while( bacway>=0 && A[bacway] > pick){ //if pick is smaller
      A[bacway+1] = A[bacway--]              //move move them up
    }
    A[bacway+1] = pick        //put pick down its larger
  }
  
}
 
 
function insertsort3(A){ // best for 8 to 20 elements iirc
  
  //~ var ej=A.length, ek=Math.floor(ej/2)-1
  var ej=A.length, ek=Math.floor(3*(ej+2)/8)
  
  for(var dueway=1 ;dueway<ek; dueway++){
    var pick = A[dueway] //if pick is small it will move back
    if( pick > A[ej-dueway] ){ pick=A[ej-dueway];A[ej-dueway]=A[dueway] }
    var bacway =dueway-1 //while all shift up
    while( bacway>=0 && A[bacway] > pick){ //if pick is smaller
      A[bacway+1] = A[bacway--]              //move move them up
    }
    A[bacway+1] = pick        //put pick down its larger
  }
  
  for(var dueway=ek ;dueway<ej; dueway++){
    var pick = A[dueway] //if pick is small it will move back
    var bacway =dueway-1 //while all shift up
    while( bacway>=0 && A[bacway] > pick){ //if pick is smaller
      A[bacway+1] = A[bacway--]              //move move them up
    }
    A[bacway+1] = pick        //put pick down its larger
  }
  
}


//its 0 to 5% slower than insert3, 30 to 40% faster than insert0
//half the code length of insert0
function insertsort4(A){ 
  
  var ej=A.length, ek=Math.floor(ej*0.375)
  
  for(var bacwd=0,duewd=1 ;duewd<ej; bacwd=duewd++){
    var pick = A[duewd] //if pick is small it will move back
    if( duewd<ek && pick > A[ej-duewd] ) //this tweak <5% slower on easy cases
    { pick=A[duewd];A[ej-duewd]=A[duewd] } //upto 60% faster on hard cases
    while( bacwd>=0 && A[bacwd] > pick){ //if pick is smaller
      A[bacwd+1] = A[bacwd--]            //move them up till 
    }
    A[bacwd+1] = pick                    //pick is larger
  }
}


//its 0 to 5% slower than insert3, 30 to 40% faster than insert0
//half the code length of insert0
function insertsort0(A){ 
  
  var ej=A.length, ek=Math.floor(ej*0.375)
  
  for(var bacway=0,dueway=1 ;dueway<ej; bacway=dueway++){
    var pick = A[dueway] 
    if( dueway<ek && pick > A[ej-dueway] )
    { pick=A[ej-dueway];A[ej-dueway]=A[dueway] 
      if( pick > A[ek+dueway] ) 
      { A[dueway]=pick  //dueway is  free/overwritten by pick
        pick=A[ek+dueway]
        A[ek+dueway]=A[dueway]
      }
    }
    while( bacway>=0 && A[bacway] > pick){ //if pick is smaller
      A[bacway+1] = A[bacway--]              //move move them up
    }
    A[bacway+1] = pick        //put pick down its larger
  }
}


function insertsort5(Ai,st,ov){ 
  
  st=st||0
  //~ if(ov===undefined){ ov=Ai.length }
  ov=ov||Ai.length
  var hf=st+Math.floor((ov-st)*0.375)
  
  for(var bacwd=st,duewd=st+1 ;duewd<ov; bacwd=duewd++){
    var pick = Ai[duewd] //if pick is small it will move back
    if( duewd<hf && pick > Ai[ov-duewd] )
    { pick=Ai[ov-duewd];Ai[ov-duewd]=Ai[duewd] }
    while( bacwd>=st && Ai[bacwd] > pick){ //if pick is smaller
      Ai[bacwd+1] = Ai[bacwd--]              //move move them up
    }
    Ai[bacwd+1] = pick        //put pick down its larger
  }
}
