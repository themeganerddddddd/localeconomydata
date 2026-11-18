"""Census PSEO actual same-state graduate employment retention, 38 partner states.
State-level pooled participating institutions only; not county home residence.
Denominator is employed graduates observed in administrative LEHD records.
"""
import io,requests,concurrent.futures as cf,json,time
import pandas as pd,numpy as np
from pathlib import Path
OUT=Path("research/graduate-retention/out");OUT.mkdir(parents=True,exist_ok=True)
STATES="al ct dc co az hi ga id il in ia la me md mn mi ma mo mt nj nm oh ny nc ok or ri pa sc tn sd tx vt ut va wv wi wy".split()
FIPS={"al":"01","ct":"09","dc":"11","co":"08","az":"04","hi":"15","ga":"13","id":"16","il":"17",
"in":"18","ia":"19","la":"22","me":"23","md":"24","mn":"27","mi":"26","ma":"25","mo":"29",
"mt":"30","nj":"34","nm":"35","oh":"39","ny":"36","nc":"37","ok":"40","or":"41","ri":"44",
"pa":"42","sc":"45","tn":"47","sd":"46","tx":"48","vt":"50","ut":"49","va":"51","wv":"54",
"wi":"55","wy":"56"}
ERRORS=[]
COLS=["institution","inst_level","degree_level","cip_level","cipcode","grad_cohort","grad_cohort_years",
      "geo_level","geography","ind_level","industry","y1_grads_emp","y1_grads_emp_instate",
      "y5_grads_emp","y5_grads_emp_instate","status_y1_grads_emp","status_y1_grads_emp_instate"]
def state_download(st):
 url=f"https://lehd.ces.census.gov/data/pseo/latest_release/{st}/pseof_{st}.csv.gz"
 for attempt in range(3):
  try:
   r=requests.get(url,timeout=130,headers={"User-Agent":"Scientific economic development analysis; public government data"})
   r.raise_for_status();break
  except Exception as e:
   if attempt==2:
    print("STATE_ERROR",st,repr(e),flush=True);return None
   time.sleep(4)
 kept=[];total=0
 try:
  for chunk in pd.read_csv(io.BytesIO(r.content),compression="gzip",dtype=str,low_memory=False,
                           usecols=COLS,chunksize=90000):
   total+=len(chunk)
   # Avoid duplicate hierarchy: state-level state aggregate, national geography,
   # all NAICS, 2-digit CIP or aggregate, specific graduation cohorts.
   mask=(chunk.inst_level=="S")&(chunk.institution==FIPS[st])&(chunk.geo_level=="N")&\
        (chunk.geography=="00")&(chunk.ind_level=="A")&(chunk.industry=="00")&\
        (chunk.grad_cohort!="0000")&chunk.degree_level.isin(["03","05","07","17","18"])&\
        chunk.cip_level.isin(["A","2"])
   x=chunk.loc[mask].copy()
   if not x.empty:kept.append(x)
  if not kept:raise RuntimeError("No aggregate cohort rows")
  d=pd.concat(kept,ignore_index=True).drop_duplicates()
  for c in ["y1_grads_emp","y1_grads_emp_instate","y5_grads_emp","y5_grads_emp_instate"]:
   d[c]=pd.to_numeric(d[c],errors="coerce")
  d["state"]=st
  d["fips"]=FIPS[st]
  print("STATE_PSEO",st,"raw",total,"cohort",len(d),
       "years",sorted(d.grad_cohort.unique().tolist())[:18],
       "BA1_valid",int(d[(d.degree_level=="05")&(d.cipcode=="00")].y1_grads_emp.notna().sum()),
       flush=True)
  return d
 except Exception as e:
  print("PARSE_ERROR",st,repr(e),flush=True);ERRORS.append({"state":st,"error":repr(e)});return None
with cf.ThreadPoolExecutor(max_workers=8) as pool:res=list(pool.map(state_download,STATES))
valid=[x for x in res if x is not None]
if len(valid)<25:raise RuntimeError(f"Only {len(valid)} of {len(STATES)} participating states parsed")
data=pd.concat(valid,ignore_index=True).drop_duplicates()
data.to_csv(OUT/"pseo_state_aggregate_cohorts.csv.gz",index=False,compression="gzip")
a=data[data.cip_level.eq("A") & data.cipcode.eq("00")].copy()
for horizon in [1,5]:
 emp=a[f"y{horizon}_grads_emp"]
 inst=a[f"y{horizon}_grads_emp_instate"]
 a[f"retention_y{horizon}"]=np.where((emp>=30)&(inst>=0)&(inst<=emp),inst/emp,np.nan)
a.to_csv(OUT/"pseo_actual_state_retention_by_cohort.csv",index=False)
r=a[a.degree_level.eq("05")].groupby("state").agg(cohorts=("grad_cohort","nunique"),
  observed_y1=("retention_y1","count"),observed_y5=("retention_y5","count"),
  weighted_employed_y1=("y1_grads_emp","sum"),weighted_instate_y1=("y1_grads_emp_instate","sum")).reset_index()
r["share_instate_y1"]=r.weighted_instate_y1/r.weighted_employed_y1
r.to_csv(OUT/"pseo_state_ba_retention_summary.csv",index=False)
(OUT/"pseo_source_errors.json").write_text(json.dumps(ERRORS,indent=2))
print("PSEO_ALL",json.dumps({"states_with_data":len(valid),"states":sorted([x.state.iloc[0] for x in valid]),
 "aggregate_rows":len(data),"BA_total_state_cohorts":len(a[a.degree_level=="05"]),
 "BA_y1_retention_nonmissing":int(a[a.degree_level=="05"].retention_y1.notna().sum()),
 "BA_y5_retention_nonmissing":int(a[a.degree_level=="05"].retention_y5.notna().sum()),
 "error_count":len(ERRORS)}),flush=True)
