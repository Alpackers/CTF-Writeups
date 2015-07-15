#Crack Me If You Can

**Category:** Reversing
**Points:** 100
**Description:**

> TODO

##Write-up

>TODO
>
![Image of Hard Interview hint]
(./hint.tiff)

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
