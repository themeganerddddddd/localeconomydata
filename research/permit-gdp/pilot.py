"""Exploratory descriptive analysis of issued-plan permit times vs BEA county GDP.
Four heterogeneous cities, 2012-2023 issued-permit cohorts.
NOT a causal effect and NOT a nationally representative panel.
Uses only public city permit data and BEA's real county GDP data.
"""
import io,json,zipfile,time
import numpy as np,pandas as pd,requests
from pathlib import Path
from scipy.stats import spearmanr
OUT=Path("research/permit-gdp/out"); OUT.mkdir(parents=True,exist_ok=True)
sess=requests.Session();sess.headers.update({"User-Agent":"Public economic development research (noncommercial data analysis)"})
DATA={
"Chicago":("data.cityofchicago.org","ydr8-5enu","17031",
           "issue_date","application_start_date","permit_type","permit_",
           "permit_type in ('PERMIT - NEW CONSTRUCTION','PERMIT - RENOVATION/ALTERATION')"),
"Seattle":("data.seattle.gov","76t5-zqzr","53033",
           "issueddate","applieddate","permittypemapped","permitnum",
           "permittypemapped = 'Building'"),
"San Francisco":("data.sfgov.org","i98e-djp9","06075",
           "issued_date","filed_date","permit_type_definition","permit_number",
           "permit_type_definition in ('additions alterations or repairs','new construction','new construction wood frame')"),
"Austin":("data.austintexas.gov","3syk-w9eu","48453",
          "issue_date","applieddate","permittype","permit_number",
          "permit_class_mapped = 'Commercial'")
}
def query(url,params,retries=3):
    for z in range(retries):
        try:
            r=sess.get(url,params=params,timeout=100)
            if r.status_code==200:return r.json()
            print("RETRY",r.status_code,r.url[:180],r.text[:200],flush=True)
            if r.status_code in [400,401,403]:break
        except Exception as e:print("RETRY_ERROR",str(e)[:200],flush=True)
        time.sleep(2+z*2)
    raise RuntimeError(f"Cannot download {url}")
def permits():
    recs=[]; details=[];errors=[]
    for city,(host,id,county,issue,apply,typ,permit,filter_expr) in DATA.items():
        url=f"https://{host}/resource/{id}.json"
        if city=="Austin":
            # Discover whether commercial building activity can be separated from trades.
            try:
                res=query(url,{"$select":"permittype, count(*) as n",
                    "$where":"issue_date between '2022-01-01T00:00:00' and '2022-12-31T23:59:59' and permit_class_mapped = 'Commercial'",
                    "$group":"permittype","$order":"n desc","$limit":40})
                print("AUSTIN_COMMERCIAL_TYPES",json.dumps(res)[:4000],flush=True)
            except Exception as e:print("AUSTIN_TYPES_ERROR",repr(e),flush=True)
        for yr in range(2012,2024):
            where=f"{issue} >= '{yr}-01-01T00:00:00' and {issue} < '{yr+1}-01-01T00:00:00' and {apply} is not null and {filter_expr}"
            fields=[permit,issue,apply,typ]
            if city=="Seattle":fields+=["daysplanreviewcity","estprojectcost"]
            if city=="Austin":fields+=["permit_class_mapped","work_class"]
            if city=="Chicago":fields+=["review_type","reported_cost"]
            if city=="San Francisco":fields+=["proposed_use","estimated_cost"]
            rows=[]
            for page in range(12):
                try:
                    chunk=query(url,{"$select":",".join(fields),"$where":where,
                          "$limit":30000,"$offset":page*30000,"$order":f"{issue} ASC, {permit} ASC"})
                except Exception as e:
                    print("PERMITS_FAIL",city,yr,repr(e)[:220],flush=True)
                    errors.append({"city":city,"year":yr,"error":repr(e)})
                    break
                rows.extend(chunk)
                if len(chunk)<30000:break
            if not rows:continue
            d=pd.DataFrame(rows)
            d[issue]=pd.to_datetime(d[issue],errors="coerce")
            d[apply]=pd.to_datetime(d[apply],errors="coerce")
            d=d.drop_duplicates(permit)
            d["days"]=(d[issue]-d[apply]).dt.total_seconds()/86400
            count_before=len(d)
            d=d[d.days.between(0,3650,inclusive="both")].copy()
            if city=="Austin":
                # Building permit subclasses only; other commercial trades aren't comparable.
                d=d[d.permittype.astype(str).str.contains("BP|BUILD",case=False,regex=True)].copy()
            d["year"]=yr
            for key,g in d.groupby(typ,dropna=False):
                if len(g)>=5:
                    details.append({"city":city,"year":yr,"type":str(key),"n":len(g),
                       "median_days":round(g.days.median(),2)})
            if len(d)<10:continue
            out={"city":city,"county_fips":county,"year":yr,"n":len(d),"raw_records":count_before,
                 "median_days":round(float(d.days.median()),2),
                 "p75_days":round(float(d.days.quantile(.75)),2),
                 "p90_days":round(float(d.days.quantile(.90)),2),
                 "mean_days":round(float(d.days.mean()),2),
                 "over90_days":round(float((d.days>90).mean()),5)}
            if city=="Seattle":
                val=pd.to_numeric(d["daysplanreviewcity"],errors="coerce") if "daysplanreviewcity" in d.columns else pd.Series(dtype=float)
                out["median_city_review_days"]=round(float(val.median()),2) if val.notna().sum()>5 else None
            recs.append(out)
            print("PANEL",json.dumps(out),flush=True)
    return pd.DataFrame(recs),pd.DataFrame(details),errors
def gdp():
    url="https://apps.bea.gov/regional/zip/CAGDP1.zip"
    r=sess.get(url,timeout=120);r.raise_for_status()
    z=zipfile.ZipFile(io.BytesIO(r.content))
    name=next(n for n in z.namelist() if "ALL_AREAS" in n and n.endswith(".csv"))
    raw=pd.read_csv(z.open(name),dtype=str,encoding="latin-1",low_memory=False)
    raw.columns=raw.columns.str.strip()
    raw["GeoFIPS"]=raw.GeoFIPS.astype(str).str.strip().str.strip('"').str.zfill(5)
    raw=raw[(raw["GeoFIPS"].isin([x[2] for x in DATA.values()]))&(raw.LineCode.eq("1"))]
    raw=raw.melt(id_vars=["GeoFIPS","GeoName"],value_vars=[str(y) for y in range(2001,2025)],
          var_name="year",value_name="real_gdp_thousands_2017")
    raw["year"]=raw.year.astype(int)
    raw["real_gdp_thousands_2017"]=pd.to_numeric(raw.real_gdp_thousands_2017.str.replace(",",""),errors="coerce")
    raw=raw.rename(columns={"GeoFIPS":"county_fips"}).sort_values(["county_fips","year"])
    raw["real_gdp_growth"]=raw.groupby("county_fips").real_gdp_thousands_2017.pct_change()*100
    print("GDP_ROWS",len(raw),"counties",raw.county_fips.unique().tolist(),flush=True)
    return raw
panel,types,errors=permits()
gdp_data=gdp()
if not panel.empty:
    wide=panel.merge(gdp_data[["county_fips","year","real_gdp_thousands_2017","real_gdp_growth"]],
                      on=["county_fips","year"],how="left")
    for h in [1,2,3]:
        future=gdp_data[["county_fips","year","real_gdp_thousands_2017"]].copy()
        future.year-=h
        future=future.rename(columns={"real_gdp_thousands_2017":f"future_gdp_{h}"})
        wide=wide.merge(future,on=["county_fips","year"],how="left")
        wide[f"future_growth_{h}yr"]=100*((wide[f"future_gdp_{h}"]/wide.real_gdp_thousands_2017)**(1/h)-1)
    wide.to_csv(OUT/"permit_county_gdp_pilot.csv",index=False)
    res=[]
    for h in [1,2,3]:
        v=wide[["median_days",f"future_growth_{h}yr"]].dropna()
        if len(v)>=8:
            rho,p=spearmanr(v.median_days,v[f"future_growth_{h}yr"])
            res.append({"horizon":h,"n_city_years":len(v),"spearman_rho":round(float(rho),4),
                        "naive_p_value":round(float(p),5)})
    (OUT/"associations.json").write_text(json.dumps(res,indent=2))
    print("NAIVE_POOLED_ASSOCIATIONS",res,flush=True)
    # Print warnings instead of endorsing naive pooled correlations.
    print("CAUTION: not causal; city issued-permit data matched to larger counties; type heterogeneity and censoring remain.",flush=True)
types.to_csv(OUT/"permit_type_counts.csv",index=False)
(OUT/"data_quality_issues.json").write_text(json.dumps(errors,indent=2))
print("STUDY_COMPLETE",{"panel_rows":len(panel),"years_by_city":panel.groupby("city").year.agg(["min","max","count"]).to_dict("index") if not panel.empty else {},
    "failed_queries":len(errors)},flush=True)
