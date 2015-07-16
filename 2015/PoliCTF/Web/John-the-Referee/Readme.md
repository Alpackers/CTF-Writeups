#John the Referee

**Category:** Web
**Points:** 150
**Description:**

> John is one of the most famous referee and security experts in the world.  He loves encryption and his referee uniforms.  You can find them on his online store.  Unfortuneately his best uniform is not on sale for anyone.  I know that it is available only on invitation.  I want that uniform!

> referee.polictf.it

##Write-up
> Full disclosure, we only got this challenge after that CTF had ended, but our approach was slightly different in the end and I decided to write it up anyway.
>
> Starting out we were greeted with the main page in which we can see an array of uniforms.
>
>![Image of main]
(./main.JPG)
>
> There were really only two different areas to look at.>
> 1) You could click on a uniform and you were brought to something similiar to the following (depending on what uniform you chose).
>```
> http://referee.polictf.it/uniform/3
>```
> 2) You could search or a uniform where you were brought to a page with a hash like value in the path.  Single quotes and other characters we also escaped when submitted.
>
![Image of normal]
(./normal.JPG)
>
> Looking at the first option first, we used burp intruder to loop through uniform values looking for anything that didn't show up on the main page.  What we found was that only 1-8 and 10 had uniforms.  Obviously #9 stuck out and seemed to be the goal.  We then turned to the static images where we were able to see the 9th uniform.
>
![Image of 9]
(./9.jpg)
>
> Now that we have confirmed that this was our target we needed to find a way to get to that uniform.
>
> Going back to option two, we messed around with the search page and were able to figure out that you could manipulate the first character in the search box by changing the begining of the hash like value in the path.  Again, being honest, this is where we stopped.  Having said that, you can use that information to edit the escape character for SQLi payloads.
>
> Starting with ```' or 1=1#``` in an attempt to return all uniforms we see that we had a valid query in that data returned, but it looks like we are only getting the first uniform.
>
![Image of or logic]
(./or_logic.JPG)
>
> We then tried to get a ```UNION SELECT``` SQLi to work and were able to determine that only one column was being selected, however, we never were able to get the full statement to execute.  With that being said, we can just continue with the ```' or 1=1#``` query, but select which row we want to actually be displayed using ```' or 1=1 limit 1 offset 9#```.  This is basically saying select everything from the database but only return the 9th record. This returns the uniform seen at ```http://referee.polictf.it/uniform/10```, so we must be off by one. Changing the query yields:
>
![Image of flag]
(./flag.JPG)
