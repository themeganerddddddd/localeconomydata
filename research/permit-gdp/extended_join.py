"""Recover completed 10-city permit-level aggregates, append BEA GDP and BLS QCEW.
The predecessor GitHub Actions artifact is immutable; source and record IDs
remain documented in extended_panel.py. Avoid repeating municipal API pulls.
"""
import json
from pathlib import Path
import numpy as np,pandas as pd
from extended_panel import OUT,ISSUES,qcew,bea
raw=pd.read_csv(OUT/"permit_geography_year.csv",dtype={"county_fips":str})
quality=pd.read_csv(OUT/"permit_quality.csv",dtype={"county_fips":str})
if "level_3" in raw:
 raw=raw.pivot_table(index=["city","county_fips","year"],columns="level_3",
       values="0",aggfunc="first").reset_index()
 raw.columns.name=None
raw=raw.drop(columns=["n_raw","valid_count","valid_share"],errors="ignore")
p=raw.merge(quality,on=["city","county_fips","year"],how="left",validate="one_to_one")
assert p.n.sum()>100000
assert p.city.nunique()>=8
assert p.county_fips.nunique()>=9
p.to_csv(OUT/"permit_city_county_year_final.csv",index=False)
print("PERMITS_FINAL",len(p),int(p.n.sum()),p.city.nunique(),p.county_fips.nunique(),
      p.groupby("city").agg(n=("n","sum"),years=("year","nunique")).to_dict("index"),flush=True)
counties=set(p.county_fips.dropna().unique())
q=qcew(counties);b=bea(counties)
x=p.merge(q,on=["county_fips","year"],how="left").merge(b,on=["county_fips","year"],how="left")
for key in ["real_gdp","private_emp_all","private_est_all","private_emp_construction","private_est_construction"]:
 ref=b[["county_fips","year",key]] if key=="real_gdp" else q[["county_fips","year",key]]
 for h in [1,2,3]:
  d=ref.copy();d["year"]-=h;d=d.rename(columns={key:f"future_{key}_{h}"})
  x=x.merge(d,on=["county_fips","year"],how="left")
  x[f"growth_{key}_{h}yr"]=100*(np.log(x[f"future_{key}_{h}"].clip(lower=1))-np.log(x[key].clip(lower=1)))/h
x.to_csv(OUT/"matched_city_county_growth_panel.csv",index=False)
(OUT/"source_errors.json").write_text(json.dumps(ISSUES,indent=2))
print("PANEL_COMPLETE",json.dumps({"rows":len(x),"cities":p.city.nunique(),
 "counties":p.county_fips.nunique(),"gdp_matched":int(x.real_gdp.notna().sum()),
 "employment_matched":int(x.private_emp_all.notna().sum()),
 "establishments_matched":int(x.private_est_all.notna().sum()),
 "construction_matched":int(x.private_emp_construction.notna().sum()),
 "failures":ISSUES}),flush=True)
