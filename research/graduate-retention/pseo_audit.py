"""PSEO public files 2026 availability by state, no API key, metadata only."""
import requests,concurrent.futures as cf,io,json
from pathlib import Path
OUT=Path("research/graduate-retention/out");OUT.mkdir(parents=True,exist_ok=True)
STATES="al ak az ar ca co ct de dc fl ga hi id il in ia ks ky la me md ma mi mn ms mo mt ne nv nh nj nm ny nc nd oh ok or pa ri sc sd tn tx ut vt va wa wv wi wy".split()
def test(st):
 u=f"https://lehd.ces.census.gov/data/pseo/latest_release/{st}/pseof_{st}.csv.gz"
 try:
  r=requests.head(u,timeout=30,allow_redirects=True,headers={"User-Agent":"University economic development research"})
  d={"state":st,"status":r.status_code,"bytes":r.headers.get("Content-Length"),"url":r.url}
  if r.status_code==200 and (not d["bytes"] or int(d["bytes"])<200):
   rr=requests.get(u,headers={"Range":"bytes=0-100"},timeout=25)
   d["range_status"]=rr.status_code;d["range_bytes"]=len(rr.content)
  print("PSEO",json.dumps(d),flush=True);return d
 except Exception as e:
  print("PSEO_ERR",st,str(e)[:150],flush=True)
  return {"state":st,"error":str(e)}
with cf.ThreadPoolExecutor(max_workers=10) as pool:
 items=list(pool.map(test,STATES))
(OUT/"pseo_state_availability.json").write_text(json.dumps(items,indent=2))
print("PSEO_AVAILABLE",len([x for x in items if x.get("status")==200]),flush=True)
