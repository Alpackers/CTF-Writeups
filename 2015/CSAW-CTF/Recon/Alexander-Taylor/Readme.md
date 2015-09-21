#Alexander Taylor

**Category:** Recon
**Points:** 100
**Description:**

http://fuzyll.com/csaw2015/start

##Write-up
We get our first clue from hitting the link in the description.

![Image of 1]
(./Images/1.tiff)

We are left with an unkown numbers of steps, but at least we have somewhere to start.  Off to google.  Using both the his name and domain name for searches on linkedin we find the following.

![Image of linkedin]
(./Images/linkedin.tiff)

Another quick google for USF's hacking club leads us to:

![Image of wscs]
(./Images/wcsc.tiff)

Trying the acronym leads us to step 2.

![Image of 2]
(./Images/2.tiff)

Here we are given a base64 encoded message.  Decoding gives us our next clue.

![Image of decode]
(./Images/decode.tiff)

Back to google we go.  Using ```fuzyll``` and ```Super Smash Brothers``` we find a hit on ```smashboards.com```.

![Image of forum]
(./Images/yoshi_forum.tiff)

The profile name is ```fuzyll``` and with all of the postings regarding ```yoshi``` I believe we have our character.

![Image of 3]
(./Images/3.tiff)

This one took a touch longer than the others, but any forensic activity on the image will reveal our next clue.

![Image of text]
(./Images/yoshi_text.tiff)

This one took the longest by far.  A quick look back at his LinkedIn profile reveals that he has placed in the DEFCON finals for DEFCON 19, 20, 21, and 22.  I started my search on DEFCON 17 and 18 figuring he didn't make it to the finals on his first attempt.  A lot of searching led me here:

![Image of enigma]
(./Images/enigma.tiff)

After many other tries, we finally hit ```enigma``` which in turn gives us:

![Image of 4]
(./Images/4.tiff)

This was another easy step.  We can use the developer tools to quickly run the javascript with the given string.

![Image of js]
(./Images/js.tiff)

Doing so gives us the final path and in turn, the flag.

![Image of 5]
(./Images/5.tiff)

