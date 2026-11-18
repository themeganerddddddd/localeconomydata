"""Replicate U.S. age-zero *employer firm* formation forecasts (not branch openings).
Requires the public-source research ZIP's business_births/births_housing_education_county_panel.csv.gz.
Set BIRTH_DATA_DIR if the input directory is not ./business_births.
Revised-source retrospective predictions, no causal inference.
"""
from pathlib import Path
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder,StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error

P=Path(os.environ.get("BIRTH_DATA_DIR","business_births"))
raw=pd.read_csv(P/"births_housing_education_county_panel.csv.gz",dtype={"county":str,"state":str})
d=raw[raw.population>=20000].copy().sort_values(["county","year"])
d["firm_count_rate"]=(100*d.newfirms_birth/d.bds_firms).where(lambda x:x.between(0,100))
g=d.groupby("county")
for h in [1,3]:
 windows=[]
 for j in range(1,h+1):
  years=g.year.shift(-j)
  rates=g.firm_count_rate.shift(-j)
  windows.append(rates.where(years.eq(d.year+j)).to_numpy())
 data=np.column_stack(windows)
 d[f"future{h}_firm_count_rate"]=np.where(np.isfinite(data).all(axis=1),data.mean(axis=1),np.nan)
d=d[d.year.between(2012,2022)].copy()
d["educ"]=np.where(d.year<=2012,d.ba2000,d.ba2012)/100
d["afford"]=d.housing_afford
d["educ_afford"]=d.educ*d.afford
d["grad_afford"]=d.grad_rate*d.afford
BASE=["log_population","log_income","prior3_population_growth",
 "prior3_personal_income_pc_growth","prior3_cbp_emp_total_growth",
 "prior3_cbp_est_total_growth","jobs_per1000","businesses_per1000",
 "prior3_birth_rate","prior3_newfirm_birth_rate","prior3_exit_rate","prior3_bfs_app_rate"]
EDU=["educ","grad_rate"]
HOUSING=["afford","home_price_growth3"]
JOBS=["tech_sector_jobs_share","health_sector_jobs_share","professional_jobs_share"]
GROUPS={
 "Economic baseline":BASE,
 "Plus housing":BASE+HOUSING,
 "Plus education":BASE+EDU,
 "Education + housing":BASE+EDU+HOUSING,
 "Education x affordability":BASE+EDU+HOUSING+["educ_afford","grad_afford"],
 "Plus jobs mix":BASE+JOBS,
 "All candidate groups":BASE+EDU+HOUSING+JOBS+["educ_afford","grad_afford"],
}
columns=list(dict.fromkeys(sum(GROUPS.values(),[])))
rows=[];errors=[]
for horizon,origins in [(3,range(2017,2021)),(1,range(2017,2023))]:
 label=f"future{horizon}_firm_count_rate"
 data=d.replace([np.inf,-np.inf],np.nan).dropna(subset=columns+[label]).copy()
 for origin in origins:
  train=data[data.year<=origin-horizon-1];test=data[data.year==origin]
  if len(train)<1500 or len(test)<300:
   print("SKIP",horizon,origin,len(train),len(test),flush=True)
   continue
  for name,features in GROUPS.items():
   pre=ColumnTransformer([("numeric",StandardScaler(),features),
     ("state",OneHotEncoder(handle_unknown="ignore"),["state"])],sparse_threshold=0.0)
   model=Pipeline([("pre",pre),("ridge",Ridge(alpha=50.0))])
   model.fit(train[features+["state"]],train[label])
   prediction=model.predict(test[features+["state"]])
   mae=mean_absolute_error(test[label],prediction)
   rows.append({"horizon":horizon,"origin":origin,"model":name,
     "n":len(test),"mae_pp":mae})
   if name in ["Economic baseline","Plus housing","Plus education"]:
    errors.append(pd.DataFrame({"county":test.county.values,"state":test.state.values,
     "origin":origin,"horizon":horizon,"model":name,"truth":test[label].values,
     "prediction":prediction,"absolute_error":np.abs(test[label].values-prediction)}))
  print("ORIGIN",horizon,origin,"test",len(test),flush=True)
r=pd.DataFrame(rows)
r.to_csv(P/"direct_firm_forecast_origin_metrics.csv",index=False)
a=r.assign(error_total=lambda x:x.n*x.mae_pp).groupby(["horizon","model"],as_index=False).agg(
 n=("n","sum"),total_error=("error_total","sum"))
a["mae_pp"]=a.total_error/a.n
b=a[a.model.eq("Economic baseline")][["horizon","mae_pp"]].rename(columns={"mae_pp":"baseline_mae"})
a=a.merge(b,on="horizon",how="left");a["improvement_pct"]=100*(a.baseline_mae-a.mae_pp)/a.baseline_mae
a.to_csv(P/"direct_firm_forecast_summary.csv",index=False)
if errors:
 pd.concat(errors,ignore_index=True).to_csv(P/"direct_firm_forecast_predictions.csv.gz",index=False,compression="gzip")
print(a.sort_values(["horizon","improvement_pct"],ascending=[False,False]).to_string(index=False))
