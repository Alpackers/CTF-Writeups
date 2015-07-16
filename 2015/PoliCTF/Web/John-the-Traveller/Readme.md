#John the Traveller

**Category:** Web
**Points:** 100
**Description:**

> Holidays are here! But John still hasn't decided where to spend them and time is running out: flights are overbooked and prices are rising every second.  Fortunately, John just discovered a website where he can book last second flight to all the European capital; however, there's no time to waste, so he just grabs his suitcase and thanks to his new smartphone he looks the city of his choice up while rushing to the airport.  There he goes! Flight is booked so... hauskaa lomaa!

> traveller.polictf.it

##Write-up
> The first clue came at the end of the description.  Google translate tells us that hauskaa lomaa is Finnish for happy vacation.  A quick lookup of European capitals shows Helsinki as the capital of Finland.
>
> Heading to the site we are greeted with the following page:
>
>![Image of traveller]
(./Traveller.tiff)
>
> After searching for Helsinki we get a list of possible flights that change each time we search.  We did notice that the currency for Helsinki was in ```px```, whereas the rest of the options seemed to be ```EUR```.  That should have stood out, but we missed it at first.  After poking around the site we noticed that if you zoomed in on the image of Venice that there appeared to be a broken up QR code in it.  We originally attempted to use Gimp to pull the blocks out, but none of us were that experienced with it and it was too sloppy to piece back together.  We ended up finding [ImageSplitter.net](imagesplitter.net) which turned out to be perfect.
>
>![Image of venice]
(./Venice.tiff)
>
> We went through the image methodically cropping out 100 x 100 blocks of QR code.
>
>![Image of block]
(./block.png)
>
> After getting what we thought was all 36 blocks, we started the painfull process of putting the puzzle back together.  We had a few duplicated blocks and ended up missing one completely, but got the final QR code back.
>
>![Image of QR code]
(./QR.tiff)
>
> It took a few iterations to get the blocks placed correctly, but when we did we were able to scan the QR code even with the missing block and get our flag.
>
>![Image of flag]
(./flag.tiff)
>
> It turns out that a much much easier way to do this would have been to use the Chrome dev tools to set the screen size to a specified pixel height and width (i.e. Helsinki flight currency px).  Getting the parameters lined up with the flight costs renders our QR code in all of it's glory with much less pain.  Lesson learned.
>
>![Image of Chrome dev tools]
(./px.tiff)
