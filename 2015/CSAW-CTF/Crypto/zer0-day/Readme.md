#Airport

**Category:** Crypto
**Points:** 50
**Description:** NA

eps1.9_zer0-day_b7604a922c8feef666a957933751a074.avi

##Write-up##

The eps1.9_zer0-day_b7604a922c8feef666a957933751a074.avi file is actually ascii text

>```
root@ctf:~/Downloads/CTF# base64 -d eps1.9_zer0-day_b7604a922c8feef666a957933751a074.avi 
Evil Corp, we have delivered on our promise as expected. base64: invalid input
>```

This looks to be base64 encoded but it doesn't decode cleanly:



That's because of the newline \n characters.  You can remove them with sed

>```
root@ctf:~/Downloads/CTF# sed -i 's/\\n//g' eps1.9_zer0-day_b7604a922c8feef666a957933751a074.avi 
root@ctf:~/Downloads/CTF# base64 -d eps1.9_zer0-day_b7604a922c8feef666a957933751a074.avi 
Evil Corp, we have delivered on our promise as expected. The people of the world who have been enslaved by you have been freed. Your financial data has been destroyed. Any attempts to salvage it will be utterly futile. Face it: you have been owned. We at fsociety will smile as we watch you and your dark souls die. That means any money you owe these pigs has been forgiven by us, your friends at fsociety. The market's opening bell this morning will be the final death knell of Evil Corp. We hope as a new society rises from the ashes that you will forge a better world. A world that values the free people, a world where greed is not encouraged, a world that belongs to us again, a world changed forever. And while you do that, remember to repeat these words: "flag{We are fsociety, we are finally free, we are finally awake!}"
>```

