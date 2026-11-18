"""National Census County Business Patterns jobs and establishments by relevant sector.
Annual 2008-2023, to extend opportunity measures before BLS QCEW API 2014.
Private nonfarm employer establishments; county employment subject to suppression.
"""
import io,zipfile,json,concurrent.futures as cf,time,requests,pandas as pd,numpy as np
from pathlib import Path
OUT=Path("research/graduate-retention/out");OUT.mkdir(parents=True,exist_ok=True)
def year_cbp(y):
 try:
  u=f"https://www2.census.gov/programs-surveys/cbp/datasets/{y}/cbp{y%100:02d}co.zip"
  r=requests.get(u,timeout=120,headers={"User-Agent":"Research for economic development analysis"})
  r.raise_for_status()
  z=zipfile.ZipFile(io.BytesIO(r.content))
  name=next(n for n in z.namelist() if n.lower().endswith(".txt") or n.lower().endswith(".csv"))
  d=pd.read_csv(z.open(name),dtype={"fipstate":str,"fipscty":str,"naics":str},encoding="latin1",
   usecols=lambda c:c.lower() in ("fipstate","fipscty","naics","emp","est","e1","n1_4"),low_memory=False)
  d.columns=d.columns.str.lower()
  d["county"]=d.fipstate.astype(str).str.zfill(2)+d.fipscty.astype(str).str.zfill(3)
  d=d[d.county.str.fullmatch(r"\d{5}")&d.county.str[-3:].ne("000")]
  d["emp"]=pd.to_numeric(d.emp,errors="coerce")
  d["est"]=pd.to_numeric(d.est,errors="coerce")
  d["naics"]=d.naics.str.strip()
  # Official county summary codes before 2017 '------', in modern years 00 or '------'.
  allsec=d[d.naics.isin(["------","00","000000"])][["county","emp","est"]].copy()
  allsec=allsec.drop_duplicates("county").rename(columns={"emp":"cbp_emp_total","est":"cbp_est_total"})
  sector=d[d.naics.str.fullmatch(r"\d{2}[-/\\]{4}|31-33-",na=False)].copy()
  sector["sect"]=sector.naics.str[:2]
  sector.loc[sector.naics.str.startswith("31-33"),"sect"]="31"
  sectors=sector[sector.sect.isin(["31","51","52","54","62"])].copy()
  sectors=sectors.sort_values("naics").drop_duplicates(["county","sect"])
  pivot=sectors.pivot(index="county",columns="sect",values=["emp","est"])
  pivot.columns=[f"cbp_{cat}_{sect}" for cat,sect in pivot.columns]
  pivot=pivot.reset_index()
  w=allsec.merge(pivot,on="county",how="outer",validate="one_to_one")
  w["year"]=y
  print("CBP_YEAR",y,"raw",len(d),"counties",w.county.nunique(),
     "totals",int(allsec.cbp_emp_total.notna().sum()),
     "sectors",int(sectors.emp.notna().sum()),"n_codes",sector.naics.unique()[:20].tolist(),
     flush=True)
  return w
 except Exception as e:
  print("CBP_FAIL",y,repr(e),flush=True)
  return None
with cf.ThreadPoolExecutor(max_workers=6) as pool:
 result=list(pool.map(year_cbp,range(2008,2024)))
parts=[x for x in result if x is not None]
if len(parts)<12:raise RuntimeError(f"Only {len(parts)} CBP years")
d=pd.concat(parts,ignore_index=True)
d.to_csv(OUT/"cbp_county_2008_2023.csv.gz",index=False,compression="gzip")
print("CBP_ALL",len(d),"counties",d.county.nunique(),"years",sorted(d.year.unique().tolist()),flush=True)
