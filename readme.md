Barsort
=======

This is the fastest numeric, stable sort function on npm. Its limitation is it works on numeric values only, unlike generic sort() which can use a comparison function such as alphanumeric or multi-element compare. 

Barsort utilises a specialised numeric ordering function called 'barassign()' which was made for a special requirement to quickly assign fixed sized bars/buckets to elements which share similar magnitudes. It's algorithm is similar to 'counting sort' with close to O(n) time complexety. Further to its original role (creating groups of particles with similar K.E. in strainer/fancy), it is combined here with tweaked insert and merge sorts and edge case processing to create a very fast numeric sort.

Testing across a large range of possible input distributions and sizes shows barsort is many times faster than nodes native sort and faster in most cases than a profficient implementation of Pythons optimised 'Timsort' - which is the next fastest sorting module on npm. 

Usage
-----

```javascript 

//node install
npm install --save barsort

Barsort=require('./barsort.js')
 
//return a sorted index to array ([opt. params])
index_arr = Barsort.sortindex( array [,index_arr][,"descend"] )  
 
//return a sorted clone of array
sorted_arr = Barsort.sort( array [,"descend"] )      

//return 'bars' of array
bars_array = Barsort.barassign( arr, { [options] } ) 
 
Barsort.barindex({ //options....
  barnum: (int) //number_of_bars_to_allocate
 ,scores: input_array_numeric_scores 
 ,keysbar: output_array_barofinput
 /* //optional
 ,st:,ov: //section of input to index
 ,barppl: output_population_of_bars
 ,burnscore:0 //true to overwrite input 
 ,resolution: bar_oversample_factor
 ,descend: descending order
 ,secure: slower, no misordering
 ,order:
 */
})
  
```	


### Performance & stability

Barsort is particularly fast especially for very large arrays and is stable for many 'organic' distributions. Extreme dynamic range in input values present a difficulty which can cause it to fail to order properly into bars. It was made for a particular use [(see spotmap)](https://github.com/strainer/fancy/wiki/spotmap) where that is not a problem. 

The `fullindex` method which combines barsort, insertsort and other process to create a very fast general numeric sort, monitors its own progress and can bail out to javascripts standard sort() if it gets stuck on toxic input. In testing lately, even the most extreme test samples are not causing it to stall and bail out.

### Summary of speedtests:

Pre-sorted input, Lengths: |     100   |    10,000   | 1,000,000
 :-------------- | :-------: | :---------: | :----------
Barsort sort     |    100 %  |    100 %    |    100 %
Native sort      |      5 %  |      2 %    |      2 %
Timsort sort     |    100 %  |    100 %    |    100 %

Gaussian distribution |     100   |    10,000   | 1,000,000
 :-------------- | :-------: | :---------: | :----------
Barsort sort     |    100 %  |    100 %    | 100 %
Native sort      |      2 %  |      2 %    |   2 %
Timsort sort     |    100 %  |     65 %    |  65 %

Tough distribution |     100   |    10,000   | 1,000,000   
:-------------- | :-------: | :---------: | :----------
Barsort sort    |     100 % |    100 %    |    100 %
Native sort     |      10 % |     10 %    |     10 %
Timsort sort    |     100 % |     65 %    |     65 %


These summarise very generally benchmark results in [`drafts/test_sort.log`](drafts/test_sort.log)
   
Barsort is 2 to 3 times quicker than Timsort in many cases and significantly slower in very few.
[Timsort](https://github.com/mziccard/node-timsort) is a popular multipurpose in-place sort. 










```
eg. Separating into 4 bars,

 months_of_year : [ 1,2,3,4,5,6,7,8,9,10,11,12 ]   
 bar_of_month   : [ 0,0,0,1,1,1,2,2,2, 3, 3, 3 ]

or if mixed up,
 mnth : [ 1,10,12,4,7,2,5,6,11,9,3,8 ]
 bars : [ 0, 3, 3,1,2,0,1,1, 3,2,0,2 ]
```

Another function can convert a 'bar index' into a 'bar-ordering index'
```
months  : [ 1,10,12,4,7,2,5,6,11,9,3,8 ]
bars    : [ 0, 3, 3,1,2,0,1,1, 3,2,0,2 ]
bar_ord : [ 0, 9,10,3,6,1,4,5,11,7,2,8 ]
```
Which is like a full ordering index, except the order given inside bars
is unsorted. When full sorting is not required, `barsort.barindex({opts...})` is
much faster than a standard sort.

This 'bar-ordered' index can be quickly rearranged by a simple insertion sort to produce a fully ordered index. This function combines these, with edge case handling resulting in a very fast and stable numeric sort:

`sorted_index = Barsort.fullindex(Array)`








Version History
---------------
* 0.5.0 - pre release, in use and testing ...
* 0.6.0 - repo fixed, pre release in use and testing ...
* 0.9.0 - much developed and testing ...