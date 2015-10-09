#Flash

**Category:** Forensics 
**Points:** 100 
**Description:** 

We were able to grab an image of a hard drive. Find out what's on it.

##Write-up
Based on the information provided it appears that we will be dealing with an [image](https://en.wikipedia.org/wiki/Disk_image) of a flash hard drive so I am expecting that I will be using forensic software to analyze the file.

My first step was to download the image file and examine it with the [SANS Investigative Forensic Toolkit] (http://digital-forensics.sans.org/community/downloads). The SANS Investigative Forensic Toolkit (SIFT)  is a virtual workstation created for incident response and digital forensics use and made it 

available to the whole community as a public service. 
![CTF Image](./Images/CTF1.jpg)]

The first step is to start the forensic application Autopsy installed on the SIFT.
![CTF Image](./Images/CTF2.jpg)]

Next we want to open a  browser on the SIFT with the following URL http://localhost:9999/autopsy with will take us to the Autopsy main page.
![CTF Image](./Images/CTF3.jpg)]
 
Let's click New Case and populate the fields to create a new Autopsy case. Click New Case again to complete this step.
![CTF Image](./Images/CTF4.jpg)]

If this is the first time you have used Autopsy on this system your screen will look like this. Simply leave the name to 'Hidden' and click Add Host
![CTF Image](./Images/CTF5.jpg)]

If you have run Autopsy on this system before simply click Add Host.
![CTF Image](./Images/CTF6.jpg)]

Populate the information and click Add Host again to complete this step.
![CTF Image](./Images/CTF7.jpg)]

Click Add Image
![CTF Image](./Images/CTF8.jpg)]

Click Add Image File
![CTF Image](./Images/CTF9.jpg)]

Enter the full location of the flash image file in the location field and click Next
![CTF Image](./Images/CTF10.jpg)]

Leave the settings as they appear - Disk Image, Volume System Type (disk image only): dos. Click Ok 
![CTF Image](./Images/CTF11.jpg)]

Here we don't need to make any changes, just click Add
![CTF Image](./Images/CTF12.jpg)]

Just click Ok
![CTF Image](./Images/CTF13.jpg)]

On this screen we are going to click Analyze.
![CTF Image](./Images/CTF14.jpg)]

We want to start with a keyword search so we click on the Keyword Search button
![CTF Image](./Images/CTF15.jpg)] 

We leave the default options and enter our search term of 'flag' and click search
![CTF Image](./Images/CTF16.jpg)]

We can see that there were quite a number of search results returned (397 hits for the term 'flag'). Let's click on Keyword search again and see if we can narrow our results buy changing our search parameters.
![CTF Image](./Images/CTF17.jpg)]

Let's enter the search term 'flag{', hit Keyword Search, and compare the results to the previous search.
![CTF Image](./Images/CTF18.jpg)]

Now we can see that our results are much smaller. We can see that this time we only have one hit listed.
![CTF Image](./Images/CTF19.jpg)]

If we click on the link 'Ascii' we can clearly see the flag flag{b3l0w_th3_r4dar]
![CTF Image](./Images/CTF20.jpg)]

The flag recovered to solve this CTF is ```flag{b3l0w_th3_r4dar}```
