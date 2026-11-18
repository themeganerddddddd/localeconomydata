"""Probe official NCES IPEDS / Census ACS / BLS QCEW / BEA data before analysis."""
import requests,io,zipfile,pandas as pd,json
from pathlib import Path
out=Path("research/graduate-retention/out");out.mkdir(parents=True,exist_ok=True)
ses=requests.Session(); ses.headers.update({"User-Agent":"Academic regional development economic research"})
def probe(name,url):
 try:
  r=ses.get(url,timeout=100); print("SOURCE",name,r.status_code,len(r.content),r.url, r.text[:120] if len(r.content)<1000 else "",flush=True)
  if r.ok and r.content.startswith(b"PK"):
   z=zipfile.ZipFile(io.BytesIO(r.content))
   print("ZIP",name,z.namelist()[:6],[(x.filename,x.file_size) for x in z.infolist()[:4]],flush=True)
   file=next(x for x in z.namelist() if x.lower().endswith(".csv"))
   d=pd.read_csv(z.open(file),nrows=6,low_memory=False,encoding="latin1")
   print("COLUMNS",name,d.columns.tolist(),flush=True)
   print("ROWS",name,d.head(3).to_json(orient="records")[:3500],flush=True)
  elif r.ok and name.startswith("ACS"):
   arr=r.json()
   print("ACS_HEAD",name,arr[:3],flush=True)
  elif r.ok and name.startswith("BLS"):
   d=pd.read_csv(io.BytesIO(r.content),nrows=6,dtype=str)
   print("QCEW_FIELDS",name,d.columns.tolist(),flush=True)
   print("QCEW_HEAD",name,d.head(3).to_json(orient="records")[:1400],flush=True)
 except Exception as e:print("ERROR",name,repr(e),flush=True)
for y in [2013,2018,2023]:
 for prefix in ["HD","C"]:
  code=(f"C{y}_A" if prefix=="C" else f"HD{y}")
  probe(code,f"https://nces.ed.gov/ipeds/datacenter/data/{code}.zip")
for y in [2013,2018,2022,2023]:
 probe("ACS"+str(y),f"https://api.census.gov/data/{y}/acs/acs5?get=NAME,B01003_001E,B19013_001E,B25064_001E,B25070_001E,B25070_007E,B25070_008E,B25070_009E,B25070_010E,B25070_011E,B25002_001E,B25002_003E,B15003_022E&for=county:*")
for kind in ["10","54","62","31_33","51"]:
 probe("BLS"+kind,"https://data.bls.gov/cew/data/api/2023/a/industry/"+kind+".csv")
