"""Inspect public PSEO flow aggregation layout in 4 representative states."""
import pandas as pd,io,requests
for st in ["vt","md","co","tx"]:
 u=f"https://lehd.ces.census.gov/data/pseo/latest_release/{st}/pseof_{st}.csv.gz"
 r=requests.get(u,timeout=120);r.raise_for_status()
 try:
  data=pd.read_csv(io.BytesIO(r.content),compression="gzip",nrows=400,
    dtype=str,low_memory=False)
  print("PSEO_FIELDS",st,data.columns.tolist(),flush=True)
  fields=[c for c in ["institution","inst_level","cipcode","cip_level","degree_level",
         "grad_cohort","grad_cohort_years","industry","ind_level","geography","geo_level",
         "agg_level_pseo","inst_state","y1_grads_emp","y1_grads_emp_instate",
         "y5_grads_emp","y5_grads_emp_instate"] if c in data.columns]
  print("ROWS",st,data[fields].head(10).to_json(orient="records")[:5000],flush=True)
  for c in fields[:14]:
   if c in data:print("UNIQUE",st,c,data[c].value_counts(dropna=False).head(8).to_dict(),flush=True)
 except Exception as e:print("ERR",st,repr(e),flush=True)
