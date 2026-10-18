from PIL import Image
im=Image.open('work/detail-1.png');w,h=im.size
for name,rect in [('lower',(.14,.48,.75,.84)),('upper',(.4,.05,.86,.5)),('legend',(.66,.69,.99,.99))]:im.crop(tuple(int(v*(w if i%2==0 else h)) for i,v in enumerate(rect))).save('work/'+name+'.png')
