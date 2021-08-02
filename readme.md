Barsort
=======

A speed optimised general purpose and stable numeric sort, specialised to work on numeric input only (integers and reals) and return a clone or sort index.

Barsort utilises a specialised algorithm similar to 'counting sort' originaly made to place array elements into groups of equal size with similar magnitudes. It is combined here with insert and merge sorts, and with edge case processing to create a fast numeric sort.

Testing across a good range of possible input distributions and sizes shows barsort is many times faster than node 2016's native sort and competitive with a proficient javascript implementation of Pythons optimised 'Timsort'. 

Alas, the source code is a beastly private exertion beyond redemption. 

Usage
-----

```javascript 
  
//return a sorted clone of array
sorted_arr = Barsort.sort( array [,"descend"] )      

//return a sorted index to array ([optional params])
index_arr = Barsort.sortorder( array [,index_arr][,"descend"] )  
  
```	

### Summary of speedtests:

The following tables are for generating a sort index of arrays. Timsort is considerably faster doing light sorting in place.

Pre-sorted input, Lengths: |     100   |    10,000   | 1,000,000
 :-------------- | :-------: | :---------: | :----------
Barsort sort     |    100 %  |    100 %    |    100 %
Native sort      |      5 %  |      2 %    |      2 %
Timsort sort     |    100 %  |    100 %    |    100 %

Gaussian distribution |     100   |    10,000   | 1,000,000
 :-------------- | :-------: | :---------: | :----------
Barsort sort     |    100 %  |    100 %    | 100 %
Native sort      |      2 %  |      2 %    |   2 %
Timsort sort     |    100 %  |     60 %    |  60 %

Tough distribution |     100   |    10,000   | 1,000,000   
:-------------- | :-------: | :---------: | :----------
Barsort sort    |     100 % |    100 %    |    100 %
Native sort     |      10 % |     10 %    |     10 %
Timsort sort    |     100 % |     65 %    |     65 %


### See also

[Timsort](https://github.com/mziccard/node-timsort) is a popular multipurpose in-place sort. 

[LSD Radix Sort](https://duvanenko.tech.blog/2017/06/15/faster-sorting-in-javascript/) is 3x Barsort speed but is limited to unsigned integers and can not arrange an index.


### Barsort algorithm basics - a "counting sort"

The input numbers are first tallied into bins as though calculating a histogram (by dividing by a suitable factor and casting to integer to get a bin number). Like this:
```
  for(var i=0; i<e; i++) 
  { kysbin[i]=(binperval*(kysval[i]-minv))>>0  } 
```
These "counting bins" are subsequently indexed by a fewer number of "placement bins". The core algorithm was developed to sort data roughly into histogram bars ( without sorting *within* the bars). The "counting bins" were subdivisions of the bars to reduce spillage between the bars. So, the cumulative sum of the populations of the placement bins is calculated so that for each placement bin an anchor position in the sorting index (output) is known (for values of bins range).

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

Some multi-indirected lookup and updating is done for each input to use the base placement info to assign inputs their position in the sorting index. Here is that final 'curious' code: 
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

The counting sort is used to get elements quite close to where thay should be but they need to be fine-sorted afterward. The classic "insertion sort" is perfect for fine sorting as long it never has to move any elements too far. It can fall back on mergesort to cope with rare problem cases.

Version History
---------------
* 0.5.0 - pre release, in use and testing ...
* 0.6.0 - repo fixed, pre release in use and testing ...
* 0.9.0 - much developed and testing ...
* 0.13.0 - ...much more developed and tested.