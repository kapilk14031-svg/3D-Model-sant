with open('work/r3f-build/src/venue.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('const sourceImage=')
idx2 = text.find("';", idx1)
print(f'Length: {idx2 + 2 - idx1}')
print('Tail:', text[idx2-20:idx2+2])
