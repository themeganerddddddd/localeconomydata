"""Download and audit *true* business formation outcomes: Census BDS and BFS.
Only public Census output; no secrets. Do not confuse business EIN applications
with employer startups or expansions at existing firms.
"""
import requests,pandas as pd,io,json
from pathlib import Path
O=Path("research/business-formation/out");O.mkdir(parents=True,exist_ok=True)
SRC={
"BDS_county":"https://www2.census.gov/programs-surveys/bds/tables/time-series/2023/bds2023_st_cty.csv",
"BDS_county_age":"https://www2.census.gov/programs-surveys/bds/tables/time-series/2023/bds2023_st_cty_fac.csv",
"BFS_county_apps":"https://www.census.gov/econ/bfs/xlsx/bfs_county_apps_annual.xlsx",
}
for name,url in SRC.items():
 try:
  r=requests.get(url,timeout=180,headers={"User-Agent":"Regional economic development research; data.census.gov official bulk downloads"})
  print("FETCH",name,r.status_code,len(r.content),r.url,flush=True)
  r.raise_for_status()
  if name.endswith("apps"):
   d=pd.read_excel(io.BytesIO(r.content),nrows=12,header=None)
   print("BFS_PREVIEW",d.head(12).to_json(orient="values")[:6000],flush=True)
   x=pd.ExcelFile(io.BytesIO(r.content));print("BFS_SHEETS",x.sheet_names,flush=True)
   for s in x.sheet_names[:5]:
    z=pd.read_excel(x,sheet_name=s,nrows=8)
    print("BFS_HEADERS",s,z.columns.tolist(),"ROWS",z.head(3).to_json(orient="records")[:1300],flush=True)
   p=O/"bfs_county_apps_annual.xlsx"
  else:
   d=pd.read_csv(io.BytesIO(r.content),nrows=12,low_memory=False,encoding="utf-8-sig")
   print("BDS_COLUMNS",name,d.columns.tolist(),flush=True)
   print("BDS_HEAD",name,d.head(3).to_json(orient="records")[:4200],flush=True)
   p=O/(name+".csv.gz")
  if name!="BDS_county_age":
   if name=="BDS_county":pd.read_csv(io.BytesIO(r.content),low_memory=False,encoding="utf-8-sig").to_csv(p,index=False,compression="gzip")
   else:p.write_bytes(r.content)
  else:
   print("BDS_AGE_METADATA_ONLY",name,"bytes",len(r.content),flush=True)
 except Exception as e:print("SOURCE_ERROR",name,repr(e),flush=True)
