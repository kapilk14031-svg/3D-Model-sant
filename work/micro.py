from PIL import Image
im=Image.open('work/detail-1.png'); w,h=im.size
for name,r in [('micro-center',(.45,.53,.59,.71)),('micro-north',(.46,.12,.57,.315)),('micro-p1',(.16,.63,.26,.82)),('micro-east',(.58,.45,.73,.66))]:
 im.crop((int(r[0]*w),int(r[1]*h),int(r[2]*w),int(r[3]*h))).resize((int((r[2]-r[0])*w*2),int((r[3]-r[1])*h*2))).save('work/'+name+'.png')
