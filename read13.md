Barsort.js - a number sorting project gone haywire

This javascript module sorts numbers around twice as quick as the famously fast [Timsort](https://en.wikipedia.org/wiki/Timsort) It is a stable sort and it produces primarily a sorting index. 

Barsort performs great and is finally passing its tests, but there is one remaining problem with it --much of its [source code](https://github.com/strainer/barsort/blob/173ae3fe7c81ecf14d5dd525a320c8bc5d941b1b/barsort.js) is completely haywire. The expansive challenge of optimising a general purpose sort has combined here with my self-indulgent code style, impatience and some personal frailties, to produce possibily my most unpresentable work yet :

### Barsort algorithm basics - a "counting sort"

The input numbers are first tallied into bins as though calculating a histogram (by dividing by a suitable factor and casting to integer to get a bin number). Like this:
```
  for(var i=0; i<e; i++) 
  { kysbin[i]=(binperval*(kysval[i]-minv))>>0  } 
```
These "counting bins" are subsequently indexed by a fewer number of "placement bins". Originally the algorithm was developed to sort data roughly into histogram bars ( without sorting *within* the bars). The "counting bins" were subdivisions of the bars to reduce spillage between the bars. So, the cumulative sum of the populations of the placement bins is calculated so that for each placement bin an anchor position in the sorting index (output) is known (for values of bins range).

Like this:
```
  for(var bin=0; bin<nbin; bin++){
    
    barofbin[bin]=fillbar            //fillbar is the bar to fill currently
    barsfill[fillbar]+=cntofbin[bin] //here it is being allocated a bins tally 

    while(barsfill[fillbar]>=fcap){   //when bar is full... 
      barsfill[fillbar+1]+=barsfill[fillbar]-fcap
      barsfill[fillbar]=fcap
      fillbar++                //...fill next bar
      nxtcap+=kysperbar-fcap   //nxtcap and kysperbar are floats
      fcap=nxtcap >>>0         //fcap is integer (it differs for each bar)
    }
  } 
```

Finally some 'curious' multi-indirected lookup and updating is done for each input to use the base placement info to assign inputs their position in the sorting index.

Here is that final 'curious' code: 
```
  var bapos=new Array(nbar); bapos[0]=0 //( before_anchor_pos )
  for(var i=0;i<nbar-1;i++){ bapos[i+1]=bapos[i]+barsfill[i] }

  for(var i=st; i<ov; i++){
    var binofel=kysbin[i] 
    
    //(change barofbin if barsfill is empty)
    while( barsfill[barofbin[binofel]]===0 ){ 
      barofbin[binofel]++ 
    }
    barsfill[barofbin[binofel]]--          
    sortix[ bapos[barofbin[binofel]]++ ]=i //sort index gets ordered by bar
  }
  // (this is not the unpresentable part...)
```

The counting sort is used to get elements quite close to where thay should be but they need to be fine-sorted afterward. The classic "insertion sort" is perfect for fine sorting as long it never has to move any elements too far. In early versions barsort relied on just insertsort to tidy up, but to improve performance on problem cases it was necessary to deal with far misplaced elements. For this I tested both mergesort and combsort and mergesort won out. The resulting hybrid sort was rather tricky to create and optimise, and amounts to a decent stable sorting routine by itself, its just not as good on its own as the champion "Timsort".

### Comparison with Timsort

Timsort is also known as "Pythons sort" and "probably THE fastest in-memory sort available" It is based on a combination of insertsort and mergesort which must be somewhat more refined than Barsort's components, although I have not groked Timsorts implementation well enough to emulate any of it.

It is notable that Timsort can sort strings and other data while Barsort will only sort numbers. Timsort sorts inplace and Barsort primarily sorts an index, but these latter differences only effect their relative performace on test cases which required very little actual sorting.

What motivated the development of Barsort is that it is basically about [twice as fast](test_sort.log) as the Javascript port of [Timsort](https://github.com/mziccard/node-timsort) on common organic numeric distributions such as gaussian and equal random distribution. This does make Barsort potentially one of the fastest general purpose numeric sorts ever cobbled together, despite large parts of its source code having been abandoned in a possibily unredeemable state. 
