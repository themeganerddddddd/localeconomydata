"""Paired applicant/city review time audit on same Seattle commercial building permits."""
import io,json,time,requests,numpy as np,pandas as pd
from pathlib import Path
OUT=Path("research/permit-gdp/out");OUT.mkdir(parents=True,exist_ok=True)
url="https://data.seattle.gov/resource/76t5-zqzr.json"
where="issueddate >= '2018-01-01T00:00:00' AND issueddate < '2024-01-01T00:00:00' AND permitclassmapped='Non-Residential' AND permittypemapped='Building'"
fields="permitnum,issueddate,applieddate,daysplanreviewcity,daysoutcorrections,numberreviewcycles,totaldaysplanreview,daysinitialplanreview,daysissuepermitcity"
parts=[]
for j in range(8):
 r=requests.get(url,params={"$select":fields,"$where":where,"$order":"issueddate ASC,permitnum ASC","$limit":5000,"$offset":j*5000},timeout=90)
 r.raise_for_status()
 v=r.json(); print("PAGE",j,"n",len(v),flush=True)
 if not v:break
 parts.extend(v)
 if len(v)<5000:break
d=pd.DataFrame(parts).drop_duplicates("permitnum")
d["year"]=pd.to_datetime(d.issueddate,errors="coerce").dt.year
d["elapsed_days"]=(pd.to_datetime(d.issueddate,errors="coerce")-pd.to_datetime(d.applieddate,errors="coerce")).dt.days
for c in ("daysplanreviewcity","daysoutcorrections","numberreviewcycles","totaldaysplanreview","daysinitialplanreview","daysissuepermitcity"):
 d[c]=pd.to_numeric(d.get(c),errors="coerce")
 d[c]=d[c].where(d[c].between(0,3650))
d=d[d.elapsed_days.between(0,3650)]
res=[]
for year,g in d.groupby("year"):
 paired=g.dropna(subset=["daysplanreviewcity","daysoutcorrections"])
 both_nonzero=paired[paired.daysplanreviewcity.add(paired.daysoutcorrections)>0]
 res.append({"year":int(year),"all_issued_commercial_building":len(g),
 "both_time_fields_available":len(paired),"paired_share_of_issued":len(paired)/len(g) if len(g) else 0,
 "paired_mean_city_review":paired.daysplanreviewcity.mean(),
 "paired_median_city_review":paired.daysplanreviewcity.median(),
 "paired_mean_applicant_corrections":paired.daysoutcorrections.mean(),
 "paired_median_applicant_corrections":paired.daysoutcorrections.median(),
 "paired_mean_review_cycles":paired.numberreviewcycles.mean(),
 "paired_mean_total_elapsed_days":paired.elapsed_days.mean(),
 "mean_city_share_in_tracked_review":(both_nonzero.daysplanreviewcity/(both_nonzero.daysplanreviewcity+both_nonzero.daysoutcorrections)).mean(),
 "days_city_fraction_of_tracked_time":paired.daysplanreviewcity.sum()/(paired.daysplanreviewcity.sum()+paired.daysoutcorrections.sum()) if len(paired) else None,
 "paired_cov_nonzero":int(len(both_nonzero))
 })
out=pd.DataFrame(res);out.to_csv(OUT/"seattle_paired_city_applicant_days.csv",index=False)
print("PAIRED_SEATTLE",out.to_json(orient="records"),flush=True)
print("SEATTLE_N",len(d),flush=True)
