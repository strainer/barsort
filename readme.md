Broadsortjs
===========
Pre release...

A bucket sort function that creates an index which ranks keys
ascending in order into equal sized 'buckets'. 

```
eg. MoY separates into 4 buckets,

 months_of_year  : [ 1,2,3,4,5,6,7,8,9,10,11,12 ]   
 bucket_of_month : [ 0,0,0,1,1,1,2,2,2, 3, 3, 3 ]

or if mixed up,
 mnth : [ 1,10,12,4,7,2,5,6,11,9,3,8 ]
 buck : [ 0, 3, 3,1,2,0,1,1, 3,2,0,2 ]
```

This bucket sort is super fast and is stable for many 'organic' distributions.
However extreme dynamic range can cause it to fail to order properly.

The function is designed for a particular use where such failure (common to bucket
sort function) is not a problem. To make this library general purpose
it will be a future goal to make it accomodate extreme dynamic ranges. 

Another function converts a 'bucket index' into a 'bucket-ordering index'
```
mnth : [ 1,10,12,4,7,2,5,6,11,9,3,8 ]
buck : [ 0, 3, 3,1,2,0,1,1, 3,2,0,2 ]
bkord: [ 0, 9,10,3,6,1,4,5,11,7,2,8 ]
```
Which is like a full ordering index, except the order given inside buckets
is unsorted.

This can be quickly rearranged by a simple insertion sort to produce a fully ordered
index.

This function combines these:
`sorted_index = Broadsort.sortindex(Array)`

It runs around twice as fast Array.sort(), except for extreme input ranges
when it is about 75% Array.sort() speed.

When full sorting is not required, `Broadsort.barindex({opts...})` is
much more efficient that standard sorting.

Usage
-----
```javascript 


Broadsort.barindex({
  barnum: bars
 ,scores: Ai
 //~ ,st:,ov:
 ,keysbar:barix
 ,barfreq:barfrq
 ,savscore:1
 ,resolution:reso
})


```	

Version History
---------------
* 0.0.0 - ......  