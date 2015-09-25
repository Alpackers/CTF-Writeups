#notesy

**Category:** Crypto
**Points:** 100
**Description:** 

http://54.152.6.70/

The flag is not in the flag{} format.

HINT: If you have the ability to encrypt and decrypt, what do you think the flag is?

HINT: https://www.youtube.com/watch?v=68BjP5f0ccE


##Write-up##

The link is for a website that has a single text box saying: "Give me like a note dude."  If you start typing a red box appears below saying "Your note isn't long enough so it's not security"

![notesy blank]
(./Images/notesy.blank.png)

![notesy 4 characters]
(./Images/notesy.4chars.png)

After typing at least 5 characters text shows up below the text box.  A single character shows up for every character entered, so after entering 5 characters, 5 show up below.  Adding a 6th makes an additional charcter show up.  After doing some testing I decided position didn't matter and it was another single substitution cipher.

![notesy 5 characters]
(./Images/notesy.5chars.png)

I typed the entire alphabet in to get the key.  I thought the flag would be giving some encoded text than translated to something.  I tried encoding "flags" and "Your note isn't long enough so it's not security" but neither completed the challenge.  The hints weren't there at the time, but its pretty obvious based on them you should put the whole key in.  I put the key in and completed the challenge.

![notesy key]
(./Images/notesy.key.png)
