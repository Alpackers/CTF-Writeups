#Lawn Care Simulator

**Category:** Web
**Points:** 200
**Description:**

http://54.165.252.74:8089/

##Write-up
Hitting the site, we are welcomed with the following site:

![Image of site]
(./Images/intro.png)

After getting nowhere with the standard web attacks I started to mess with the grass feature which grew the grass little by little and giving "achievements" every so often for wasting your time.

![Image of achievement]
(./Images/achievement.png)

Just for fun I modified the grass to grow quickly by calling the ```grow()``` function muliple times per click.

![Image of grass]
(./Images/grass.png)

Ok, back to the challenge. Messing with the username/password fields I noticed that there was some client-side validation to ensure that values weren't empty upon submission.

![Image of username]
(./Images/username.png)

Using burp I tried a few different tests with null values like ```null:null```, ```test:null```, and finally ```admin:null```.  The latter produced:

![Image of empty]
(./Images/empty.png)

![Image of flag]
(./Images/flag.png)
