Barsort
=======

Barsort has a roughly O(n) time algorithm similar to 'counting sort' or 'histogram sort'. 
It creates an index which orders numbers into equally populated 'bars' or ranges. 
This 'bar index' can be used directly or to prepare an index to sort fully and (very quickly).

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


Usage
-----
```javascript 

 //produce sorted index of input
 //using browsers native sort() :
 
 sindex=barsort.stndindex( inputarray ) 
 
 //produce sorted index of input
 //using barsort and insertsort:
 
 sindex=barsort.fullindex( inputarray ) 
                                       
 //produce a bar index (partial sort)
 //of the input array 'scores'
 //which is either the key data to index
 //or an array (pre-prepared) containing the 
 //key data scores:
 
Barsort.barindex({
  barnum: number_of_bars_to_allocate
 ,scores: input_array_numeric_scores 
 ,keysbar: output_array_barofinput
 /* //optional
 ,st:,ov: //section of input to index
 ,barppl: output_population_of_bars
 ,burnscore:0 //true to overwrite input 
 ,resolution: bar_oversample_factor
 ,descend: descending order
 ,secure: slower, no misordering
 */
})
  
 //produce a bar sorted index from
 //previously generated bar index 
 //and bar population arrays:
 
barsortix=Barsort.barstoix(keysbar,barpopl)

```	

### Performance & stability

Barsort is particularly fast especially for very large arrays and is stable for many 'organic' distributions. Extreme dynamic range in input values present a difficulty which can cause it to fail to order properly into bars. It was made for a particular use [(see spotmap)](github.com/strainer/fancy/wiki/spotmap) where that is not a problem. 

The `fullindex` method which combines barsort, insertsort and other process to create a very fast general numeric sort, monitors its own progress and can bail out to javascripts standard sort() in the event of poisoned input. With more developement it should be able to handle the possibility without reverting to native Array.sort 

### Summary of speedtests:

Easy Distribution - Lengths  |     100   |    10,000   | 1,000,000
 :-------------- | :-------: | :---------: | :----------
Standard sort    |    100 %  |    100 %    |    100 %
Timsort sort     |    300 %  |    600 %    |   1200 %
Barsort sort     |    270 %  |    550 %    |   1000 %

 Normal distribution|     100   |    10,000   | 1,000,000
 :-------------- | :-------: | :---------: | :----------
Standard sort    |    100 %  |    100 %    | 100 %
Timsort sort     |     60 %  |     35 %    |  20 %
Barsort sort     |    250 %  |    500 %    | 800 %

Tough distribution |     100   |    10,000   | 1,000,000   
:-------------- | :-------: | :---------: | :----------
Standard sort   |     100 % |    100 %    |    100 %
Timsort sort    |      50 % |     40 %    |     50 %
Barsort sort    |     120 % |    220 %    |   1000 %

(* Speeds in percent, 200% is twice as fast )


Version History
---------------
* 0.5.0 - pre release, in use and testing ...
* 0.6.0 - repo fixed, pre release in use and testing ...
* 0.8.0 - much developed and testing ...