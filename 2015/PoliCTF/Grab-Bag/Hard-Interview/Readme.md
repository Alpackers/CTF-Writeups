#Hard Interview

**Category:** Grab Bag
**Points:** 50
**Description:**

> interview.polictf.it:80

##Write-up

>The first thing we did was netcat to the above address:port and got the following screen:
>
![Image of Hard Interview hint]
(./hint.tiff)

>The description for the challenge is basically a quote from the movie Sworfish and we are logged in with fish@sword.  The official hint is that the host is a "not so easily reachable IP" and the user is "THE username", both of which are slightly vague.

>After try a few different combinations of usernames and hosts I decided to go lookup the movie clips surrounding the scene that had been quoted.  The first item that struck me was the following:
>
![Image of Hard Interview hint]
(./IP.tiff)

>The "not so easily reachable IP" of 312.5.125.233 fit the bill and when submitted the system stopped complaining about the host.

>Having found the host sytem, I stayed in the same area of the movie and looked for any possible usernames that would have been submitted.  It didn't take long (and probably shouldn't have taken the movie) to land on the following:
>
![Image of Hard Interview hint]
(./user.tiff)

>Using ssh from the options and submitting the above values reveals the flag.
>
>```
>fish@sword:~$ ssh admin@312.5.125.233
> flag{H4ll3_B3rry's_t0pl3ss_sc3n3_w4s_4ls0_n0t4bl3}
>fish@sword:~$
>```

