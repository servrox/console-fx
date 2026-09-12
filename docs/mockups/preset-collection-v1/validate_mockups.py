#!/usr/bin/env python3
"""Read-only structural, semantic and integrity checks for design references.

Python 3.10+, standard library only. This does not test ConsoleFX or DevTools.
"""
from pathlib import Path
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
EXPECTED = {'buildReceipt','requestTrace','serviceReady','commandCard','releaseBulletin',
            'blueprint','contourMap','letterpress','signalHalftone','orbital'}
ALLOWED = {'svg','title','desc','defs','g','rect','circle','ellipse','line','path','text','pattern'}

def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)

def check_svg(name: str, dimensions: tuple[int,int], expected_text=None) -> tuple[int,int]:
    raw = (ROOT/name).read_bytes()
    require(b'<!DOCTYPE' not in raw.upper() and b'<!ENTITY' not in raw.upper(), name+': entities forbidden')
    tree = ET.fromstring(raw)
    require((int(tree.attrib['width']),int(tree.attrib['height'])) == dimensions, name+': dimensions')
    require(tree.attrib.get('viewBox') == f'0 0 {dimensions[0]} {dimensions[1]}', name+': viewBox')
    ids = [e.attrib['id'] for e in tree.iter() if 'id' in e.attrib]
    require(len(ids) == len(set(ids)), name+': duplicate IDs')
    text = {}
    for e in tree.iter():
        require(e.tag.rsplit('}',1)[-1] in ALLOWED, name+': forbidden element')
        for key,value in e.attrib.items():
            local = key.rsplit('}',1)[-1]
            require(not local.lower().startswith('on'), name+': event attribute')
            if local in {'href','src'}:
                require(value.startswith('#') and value[1:] in ids, name+': external reference')
            for ref in re.findall(r'url\(([^)]*)\)',value):
                ref=ref.strip(' \"\'')
                require(ref.startswith('#') and ref[1:] in ids,name+': unresolved URL')
        if e.tag.rsplit('}',1)[-1]=='text' and e.attrib.get('aria-hidden')!='true':
            value=''.join(e.itertext())
            slot=e.attrib.get('data-slot')
            if expected_text is not None:
                require(slot is not None and slot not in text,name+': missing/duplicate slot')
                text[slot]=value
                require(0<=float(e.attrib['x'])<=720 and 0<float(e.attrib['y'])<240,name+': text anchor outside artboard')
    if expected_text is not None:
        require(list(text.items())==list(expected_text.items()),name+': semantic text/order differs')
    count=sum(1 for _ in tree.iter())
    if dimensions==(720,240):
        require(count<=1000,name+': element budget')
        require(len(raw)<=32768,name+': raw reference unexpectedly large')
    return count,len(raw)

def main() -> None:
    data=json.loads((ROOT/'fixtures.json').read_text())
    entries=data['presets']
    require(len(entries)==10 and {f['id'] for f in entries}==EXPECTED,'Exactly ten unique presets required')
    hashes=json.loads((ROOT/'sha256.json').read_text())
    require(set(hashes)=={f['svg'] for f in entries},'Incomplete fingerprint manifest')
    for name,digest in hashes.items():
        require(hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest,name+': hash mismatch; review baseline changes')
    counts=[]
    for f in entries:
        require(f['profile']==f['id']+'/v1',f['id']+': profile identity')
        require((f['width'],f['height'])==(720,240),f['id']+': fixture dimensions')
        require(f['svg']==f['id']+'.svg',f['id']+': reference filename')
        counts.append(check_svg(f['svg'],(720,240),f['text']))
    print(f'PASS: 10 individual references; text/order, dimensions, IDs, internal URLs and SHA-256.')
    print(f'Individual maxima: {max(v[0] for v in counts)} XML elements, {max(v[1] for v in counts)} SVG bytes.')
    print('Design-source checks only; no runtime or DevTools qualification.')
if __name__=='__main__':
    main()
