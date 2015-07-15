#Crack Me If You Can

**Category:** Reversing
**Points:** 100
**Description:**

> John bets nobody can find the passphrase to login! 
> GPG key: viphHowrirOmbugTudIbavMeuhacyet

##Write-up

>```bash
>$ unzip crack-me-if-you-can.apk classes.dex
> Archive: crack-me-if-you-can.apk
>  inflating: classes.dex
>$ ~/dex2jar-0.0.9.15/dex2jar.sh classes.dex
> this cmd is deprecated, use the d2j-dex2jar if possible
> dex2jar version: translator-0.0.9.15
> dex2jar classes.dex -> classes_dex2jar.jar
> Done.
>$ java -jar ~/luyten-0.4.3/luyten-0.4.3.jar classes_dex2jar.jar
>```

>```python
>def ca(text):
>	return text.replace("aa","ca")
>def cb(text):
>	return text.replace("aat","his")
>def cc(text):
>	return text.replace("buga","Goo")
>def cd(text):
>	return text.replace("spdgj","yb%e")
>def ba(text):
>	return text.replace("c","a")
>def bb(text):
>	return text.replace("%","")
>def bc(text):
>	return text.replace("[","")
>def bd(text):
>	return text.replace("]","")
>def be(text):
>	return text.replace("\\{","")
>def bf(text):
>	return text.replace("\\}","")
>def bg(text):
>	return text.replace("c","f")
>def bh(text):
>	return text.replace("R","f")
>def bi(text):
>	return text.replace("=","_")
>
>flag="[[c%l][c{g}[%{%Mc%spdgj=]T%aat%=O%bRu%sc]c%ti[o%n=Wcs%=No[t=T][hct%=buga[d=As%=W]e=T%ho[u%[%g]h%t[%}%"
>print ca(ba(bb(bc(bd(bg(bh(be(bf(bi(cc(cb(cd(flag)))))))))))))
>```
