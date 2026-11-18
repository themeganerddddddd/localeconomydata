"""Nationwide IPEDS-Zillow-BEA-QCEW county and metro historical study panel.
All files from public official government datasets except Zillow research public CSV.
No credentials. No actual graduate retention is observed; conditions are proxies.
"""
import os,io,json,zipfile,time,re,concurrent.futures as cf
from pathlib import Path
import numpy as np,pandas as pd,requests
OUT=Path("research/graduate-retention/out");OUT.mkdir(parents=True,exist_ok=True)
HEAD={"User-Agent":"Public academic economic development research (open government data, no automated redistribution)"}
ISSUES=[]; METADATA={}
YEARS=list(range(2008,2024))
def get(url,attempts=3,timeout=130):
 for i in range(attempts):
  try:
   r=requests.get(url,headers=HEAD,timeout=timeout)
   if r.status_code==200 and len(r.content)>80 and "missing_key" not in r.url:return r.content
   print("FETCH_STATUS",r.status_code,len(r.content),url[:160],flush=True)
   if r.status_code in (400,401,403,404):break
  except Exception as e:print("FETCH_ERROR",repr(e)[:130],url[:100],flush=True)
  time.sleep(2+i*3)
 raise RuntimeError("Fetch failed "+url)
def read_zip_csv(data,prefix=None,usecols=None):
 z=zipfile.ZipFile(io.BytesIO(data))
 members=[x for x in z.namelist() if x.lower().endswith(".csv") and ("_rv" not in x.lower())]
 if not members:raise RuntimeError("CSV not found in archive")
 fname=members[0]
 return pd.read_csv(z.open(fname),usecols=usecols,encoding="utf-8-sig",
   encoding_errors="replace",low_memory=False,dtype={ "UNITID":str, "COUNTYCD":str, "CIPCODE":str})
def ipeds_year(y):
 try:
  hd=read_zip_csv(get(f"https://nces.ed.gov/ipeds/datacenter/data/HD{y}.zip"),
    usecols=lambda c:c.lstrip("\ufeff") in ["UNITID","COUNTYCD","DEGGRANT","CBSA","INSTNM","SECTOR"])
  hd.columns=hd.columns.str.replace("\ufeff","",regex=False)
  if "UNITID" not in hd.columns:raise RuntimeError("No UNITID in HD")
  hd.UNITID=hd.UNITID.astype(str).str.strip()
  hd["county"]=hd.COUNTYCD.astype(str).str.extract(r"(\d+)")[0].str.zfill(5)
  hd=hd[hd.county.str.fullmatch(r"\d{5}",na=False)&(hd.county.str[-3:]!="000")]
  if "DEGGRANT" in hd:
   hd=hd[pd.to_numeric(hd.DEGGRANT,errors="coerce").eq(1)]
  hd=hd.drop_duplicates("UNITID")
  d=read_zip_csv(get(f"https://nces.ed.gov/ipeds/datacenter/data/C{y}_A.zip"),
    usecols=lambda c:c.lstrip("\ufeff") in ["UNITID","CIPCODE","MAJORNUM","AWLEVEL","CTOTALT"])
  d.columns=d.columns.str.replace("\ufeff","",regex=False)
  d.UNITID=d.UNITID.astype(str).str.strip()
  d["cip_float"]=pd.to_numeric(d.CIPCODE,errors="coerce")
  d["level"]=pd.to_numeric(d.AWLEVEL,errors="coerce")
  d["completions"]=pd.to_numeric(d.CTOTALT,errors="coerce")
  d["major"]=pd.to_numeric(d.MAJORNUM,errors="coerce")
  # Only 6-digit CIP program rows; drop 2-digit summaries (e.g. 11.0000)
  # and nationwide/institutional total (99.0000), avoiding double count.
  d=d[d.cip_float.notna() & ((d.cip_float%1)>1e-6) &
      (d.cip_float<60)&d.major.eq(1)&d.level.isin([3,5,7,17,18])&
      d.completions.between(0,2000000)].copy()
  d["cip2"]=np.floor(d.cip_float).astype("int16")
  d["baplus"]=d.level.isin([5,7,17,18])
  d["associate"]=d.level.eq(3)
  d["stem"]=d.cip2.isin([11,14,15,26,27,40,41])
  d["health"]=d.cip2.eq(51)
  d["business"]=d.cip2.eq(52)
  d["education"]=d.cip2.eq(13)
  d=d.merge(hd[["UNITID","county"]],on="UNITID",how="inner",validate="many_to_one")
  cols={
   "ba_all":d.baplus,
   "ba_stem":d.baplus&d.stem,
   "ba_health":d.baplus&d.health,
   "ba_business":d.baplus&d.business,
   "ba_education":d.baplus&d.education,
   "aa_all":d.associate,
   "aa_health":d.associate&d.health,
  }
  parts=[]
  for k,mask in cols.items():
   sub=d.loc[mask].groupby("county").completions.sum().rename(k)
   parts.append(sub)
  a=pd.concat(parts,axis=1).fillna(0).reset_index()
  a["year"]=y
  print("IPEDS_YEAR",y,"records",len(d),"institutions",d.UNITID.nunique(),
   "counties",len(a),"ba_degrees",int(d.loc[d.baplus,"completions"].sum()),
   "stem",int(d.loc[d.baplus & d.stem,"completions"].sum()),flush=True)
  return a,{"year":y,"raw":len(d),"institutions":int(d.UNITID.nunique()),
    "degree_count":int(d.loc[d.baplus,"completions"].sum()),"counties":len(a)}
 except Exception as e:
  ISSUES.append({"source":"IPEDS","year":y,"error":str(e)})
  print("IPEDS_ERROR",y,repr(e),flush=True);return None,None
def ipeds():
 with cf.ThreadPoolExecutor(max_workers=4) as pool:r=list(pool.map(ipeds_year,YEARS))
 okay=[x[0] for x in r if x[0] is not None]
 if len(okay)<11:raise RuntimeError(f"Only {len(okay)} IPEDS years, not enough for national panel")
 a=pd.concat(okay,ignore_index=True)
 a.to_csv(OUT/"ipeds_county_year_degrees.csv.gz",index=False,compression="gzip")
 METADATA["ipeds_years"]=[x[1] for x in r if x[1]]
 return a
def qcew_task(item):
 y,code=item
 try:
  content=get(f"https://data.bls.gov/cew/data/api/{y}/a/industry/{code}.csv",attempts=2,timeout=100)
  d=pd.read_csv(io.BytesIO(content),usecols=["area_fips","own_code","industry_code","size_code",
    "annual_avg_emplvl","annual_avg_estabs","avg_annual_pay","disclosure_code"],dtype={
     "area_fips":str,"own_code":str,"industry_code":str,"size_code":str},low_memory=False)
  d=d[d.own_code.eq("5")&d.size_code.eq("0")&
     d.area_fips.str.fullmatch(r"\d{5}",na=False)&
     d.area_fips.str[-3:].ne("000")].copy()
  d["emp"]=pd.to_numeric(d.annual_avg_emplvl,errors="coerce")
  d["est"]=pd.to_numeric(d.annual_avg_estabs,errors="coerce")
  d["pay"]=pd.to_numeric(d.avg_annual_pay,errors="coerce")
  d.loc[d.disclosure_code.fillna("").ne(""),"emp"]=np.nan
  d.loc[d.emp<=0,"emp"]=np.nan
  d["industry"]=code;d["year"]=y
  a=d[["area_fips","industry","year","emp","est","pay"]]
  print("QCEW_YEAR",y,code,len(a),"emp_n",a.emp.notna().sum(),flush=True)
  return a
 except Exception as e:
  ISSUES.append({"source":"QCEW","year":y,"industry":code,"error":str(e)})
  print("QCEW_ERROR",y,code,repr(e)[:140],flush=True);return None
def qcew():
 codes=["10","54","51","52","62","31_33"]
 jobs=[(y,code) for y in range(2009,2025) for code in codes]
 with cf.ThreadPoolExecutor(max_workers=8) as pool:r=list(pool.map(qcew_task,jobs))
 good=[x for x in r if x is not None and len(x)>0]
 if len(good)<42:raise RuntimeError("Too few QCEW industry-year slices")
 d=pd.concat(good,ignore_index=True)
 d=d.drop_duplicates(["area_fips","year","industry"],keep="first")
 w=d.pivot(index=["area_fips","year"],columns="industry",values=["emp","est","pay"])
 w.columns=[f"{cat}_{code.replace('_','')}" for cat,code in w.columns]
 w=w.rename_axis(index={"area_fips":"county"}).reset_index()
 w.to_csv(OUT/"qcew_county_year.csv.gz",index=False,compression="gzip")
 METADATA["qcew_years"]=sorted(set(d.year.unique().tolist()))
 METADATA["qcew_slices"]=[{"year":int(y),"industry":code} for y,code in d[["year","industry"]].drop_duplicates().itertuples(index=False,name=None)]
 print("QCEW_SCOPE",len(w),"county",w.county.nunique(),"years",METADATA["qcew_years"],flush=True)
 return w
def bea_table(zipname,lines,cols):
 data=get(f"https://apps.bea.gov/regional/zip/{zipname}.zip")
 z=zipfile.ZipFile(io.BytesIO(data))
 f=next(zname for zname in z.namelist() if "ALL_AREAS" in zname and zname.lower().endswith(".csv"))
 d=pd.read_csv(z.open(f),dtype=str,encoding="latin1",low_memory=False)
 d.columns=d.columns.str.strip()
 d["county"]=d.GeoFIPS.astype(str).str.replace('"',"",regex=False).str.strip().str.zfill(5)
 d=d[d.county.str.fullmatch(r"\d{5}")&d.county.str[-3:].ne("000")&
     pd.to_numeric(d.LineCode,errors="coerce").isin(lines)]
 vals=[str(y) for y in range(2008,2025)]
 d=d.melt(id_vars=["county","GeoName","LineCode"],value_vars=vals,var_name="year",value_name="v")
 d["year"]=d.year.astype(int);d["v"]=pd.to_numeric(d.v.str.replace(",","",regex=False),errors="coerce")
 d["metric"]=d.LineCode.astype(str).map(cols)
 w=d.pivot_table(index=["county","year"],columns="metric",values="v",aggfunc="first").reset_index()
 w.columns.name=None
 print("BEA",zipname,len(w),"counties",w.county.nunique(),"years",w.year.min(),w.year.max(),flush=True)
 return w
def bea():
 a=bea_table("CAINC1",[2,3],{"2":"population","3":"personal_income_pc"})
 b=bea_table("CAGDP1",[1],{"1":"real_gdp_thousand"})
 a=a.merge(b,on=["county","year"],how="outer",validate="one_to_one")
 return a
def zillow_dataset(kind,url,name):
 data=get(url,timeout=180)
 d=pd.read_csv(io.BytesIO(data),low_memory=False,
   dtype={"StateCodeFIPS":str,"MunicipalCodeFIPS":str})
 d["county"]=d.StateCodeFIPS.astype(str).str.zfill(2)+d.MunicipalCodeFIPS.astype(str).str.zfill(3)
 groups={}
 for y in range(2008,2025):
  fields=[x for x in d.columns if re.fullmatch(fr"{y}-\d{{2}}-\d{{2}}",str(x))]
  if not fields:continue
  val=d[fields].apply(pd.to_numeric,errors="coerce")
  d[f"{name}_{y}"]=val.mean(axis=1).where(val.notna().sum(axis=1)>=min(4,len(fields)))
  groups[y]=len(fields)
 long=d.melt(id_vars=["county"],value_vars=[f"{name}_{y}" for y in groups],
    var_name="year",value_name=name)
 long["year"]=long.year.str[-4:].astype(int)
 long=long.drop_duplicates(["county","year"])
 print("ZILLOW",kind,"counties",d.county.nunique(),"non_missing",int(long[name].notna().sum()),"n_years",len(groups),flush=True)
 METADATA[kind]={"counties":int(d.county.nunique()),"rows":int(long[name].notna().sum()),"monthly_groups":groups}
 return long
def zillow():
 h=zillow_dataset("zhvi","https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv","home_value")
 r=zillow_dataset("zori","https://files.zillowstatic.com/research/public_csvs/zori/County_zori_uc_sfrcondomfr_sm_month.csv","monthly_rent")
 return h.merge(r,on=["county","year"],how="outer",validate="one_to_one")
def cbsa():
 try:
  raw=get("https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx")
  first=pd.read_excel(io.BytesIO(raw),header=None,nrows=15,dtype=str)
  idx=None
  for i,rv in first.iterrows():
   row="|".join(rv.fillna("").astype(str).tolist()).lower()
   if "cbsa code" in row and "fips state code" in row and "fips county code" in row:
    idx=int(i);break
  if idx is None:raise RuntimeError("Cannot locate CBSA XLSX headings: "+str(first.head(10).to_numpy().tolist())[:600])
  d=pd.read_excel(io.BytesIO(raw),header=idx,dtype=str)
  d.columns=d.columns.astype(str).str.strip()
  print("CBSA_COLUMNS",d.columns.tolist(),flush=True)
  req=["CBSA Code","FIPS State Code","FIPS County Code"]
  if not all(x in d for x in req):raise RuntimeError("Missing "+str(set(req)-set(d.columns)))
  d["county"]=d["FIPS State Code"].str.zfill(2)+d["FIPS County Code"].str.zfill(3)
  d["cbsa"]=d["CBSA Code"].str.zfill(5)
  d=d[d.county.str.fullmatch(r"\d{5}")&d.cbsa.str.fullmatch(r"\d{5}")]
  if "Metropolitan/Micropolitan Statistical Area" in d:
   d=d[d["Metropolitan/Micropolitan Statistical Area"].fillna("").str.contains("Metropolitan",case=False)]
  d=d.drop_duplicates("county")
  d[["county","cbsa"]].to_csv(OUT/"metro_crosswalk_2023.csv",index=False)
  print("CBSA_SCOPE","counties",d.county.nunique(),"metros",d.cbsa.nunique(),flush=True)
  return d[["county","cbsa"]]
 except Exception as e:
  ISSUES.append({"source":"CBSA","error":str(e)})
  print("CBSA_ERROR",repr(e),flush=True)
  return pd.DataFrame(columns=["county","cbsa"])
def build_county(a,ip,q,h):
 p=a.merge(ip,on=["county","year"],how="left",validate="one_to_one")
 p=p.merge(q,on=["county","year"],how="left",validate="one_to_one")
 p=p.merge(h,on=["county","year"],how="left",validate="one_to_one")
 degreecols=["ba_all","ba_stem","ba_health","ba_business","ba_education","aa_all","aa_health"]
 available=set(ip.year.unique())
 for col in degreecols:
  p[col]=np.where(p.year.isin(available),p[col].fillna(0),np.nan)
 p=p.sort_values(["county","year"]).copy()
 # Require real positive populations and complete annual series; future outcomes created later.
 p=p[p.population.between(1000,2e8)].copy()
 for col in degreecols:
  p[f"{col}_3yr"]=p.groupby("county")[col].transform(lambda s:s.rolling(3,min_periods=3).mean())
  p[f"{col}_per10k"]=10000*p[f"{col}_3yr"]/p.population
  p[f"log_{col}_per10k"]=np.log1p(p[f"{col}_per10k"].clip(lower=0))
 if "emp_10" in p:
  p["job_tech_emp"]=p[[c for c in ["emp_54","emp_51","emp_3133"] if c in p]].sum(axis=1,min_count=3)
  p["job_skilled_emp"]=p[[c for c in ["emp_54","emp_51","emp_52","emp_62","emp_3133"] if c in p]].sum(axis=1,min_count=5)
  p["tech_job_share"]=p.job_tech_emp/p.emp_10
  p["skilled_job_share"]=p.job_skilled_emp/p.emp_10
  p["health_job_share"]=p.emp_62/p.emp_10
  p["private_jobs_per100"]=p.emp_10/p.population*100
  p["est_per1000"]=p.est_10/p.population*1000
  p["log_wage"]=np.log(p.pay_10.where(p.pay_10>1000))
  p["housing_price_to_wage"]=p.home_value/p.pay_10
  p["rent_to_wage"]=12*p.monthly_rent/p.pay_10
  p["personal_income_to_wage"]=p.personal_income_pc/p.pay_10
 else:raise RuntimeError("No total private QCEW employment")
 p["gdp_percapita"]=1000*p.real_gdp_thousand/p.population
 p["log_gdp_pc"]=np.log(p.gdp_percapita.where(p.gdp_percapita>1000))
 p["log_population"]=np.log(p.population)
 p["state"]=p.county.str[:2]
 p["log_home_price_wage"]=np.log(p.housing_price_to_wage.where(p.housing_price_to_wage.between(.2,60)))
 p["log_rent_wage"]=np.log(p.rent_to_wage.where(p.rent_to_wage.between(.005,2)))
 p["home_price_growth3"]=100*(np.log(p.home_value)-np.log(p.groupby("county").home_value.shift(3)))/3
 # No outcome-label look-ahead; future changes are computed later.
 for col in ["real_gdp_thousand","population","gdp_percapita","emp_10","est_10","pay_10",
             "emp_54","emp_51","emp_52","emp_62","tech_job_share"]:
  if col in p:
   for h in [1,3,5]:
    z=p.groupby("county")[col].shift(h)
    p[f"prior_{col}_growth{h}"]=100*(np.log(p[col].where(p[col]>0))-np.log(z.where(z>0)))/h
 for col in ["gdp_percapita","emp_10","est_10","pay_10","emp_54","emp_62","population"]:
  for h in [3,5]:
   future=p.groupby("county")[col].shift(-h)
   p[f"future_{col}_{h}"]=future
   p[f"out_{col}_{h}"]=100*(np.log(future.where(future>0))-np.log(p[col].where(p[col]>0)))/h
 p.to_csv(OUT/"county_research_panel.csv.gz",index=False,compression="gzip")
 print("COUNTY_PANEL",len(p),"counties",p.county.nunique(),"years",p.year.min(),p.year.max(),
  "grad_nonmiss",int(p.ba_stem_3yr.notna().sum()),"housing",int(p.home_value.notna().sum()),
  "qcew",int(p.emp_10.notna().sum()),"jshare",int(p.tech_job_share.notna().sum()),flush=True)
 return p
def build_metro(p,cross):
 if cross.empty:return
 d=p.merge(cross,on="county",how="inner")
 sumcols=["population","real_gdp_thousand","emp_10","est_10","pay_10","emp_54","emp_51","emp_52","emp_62","emp_3133","ba_all_3yr","ba_stem_3yr","ba_health_3yr","ba_business_3yr","aa_all_3yr","aa_health_3yr"]
 sumcols=[x for x in sumcols if x in d.columns and x!="pay_10"]
 d["total_payroll"]=d.emp_10*d.pay_10
 d["weighted_home"]=d.population*d.home_value
 d["weighted_rent"]=d.population*d.monthly_rent
 d["home_pop"]=d.population.where(d.home_value.notna())
 d["rent_pop"]=d.population.where(d.monthly_rent.notna())
 d["weighted_pinc"]=d.population*d.personal_income_pc
 grp=d.groupby(["cbsa","year"],observed=True)
 m=grp[sumcols+["total_payroll","weighted_home","weighted_rent","home_pop","rent_pop","weighted_pinc"]].sum(min_count=1).reset_index()
 m["pay_10"]=m.total_payroll/m.emp_10
 m["home_value"]=m.weighted_home/m.home_pop
 m["monthly_rent"]=m.weighted_rent/m.rent_pop
 m["personal_income_pc"]=m.weighted_pinc/m.population
 m["county"]="CBSA-"+m.cbsa
 m["state"]=m.cbsa.str[:2] # Not state; state clustering not appropriate for multistate CBSA
 m["log_population"]=np.log(m.population)
 m["gdp_percapita"]=1000*m.real_gdp_thousand/m.population
 m["log_gdp_pc"]=np.log(m.gdp_percapita.where(m.gdp_percapita>1000))
 for col in ["ba_all","ba_stem","ba_health","ba_business","aa_all","aa_health"]:
  if f"{col}_3yr" in m:
   m[f"{col}_per10k"]=m[f"{col}_3yr"]*10000/m.population
   m[f"log_{col}_per10k"]=np.log1p(m[f"{col}_per10k"].clip(lower=0))
 m["tech_job_share"]=(m.emp_54+m.emp_51+m.emp_3133)/m.emp_10
 m["skilled_job_share"]=(m.emp_54+m.emp_51+m.emp_52+m.emp_62+m.emp_3133)/m.emp_10
 m["health_job_share"]=m.emp_62/m.emp_10
 m["private_jobs_per100"]=100*m.emp_10/m.population
 m["est_per1000"]=1000*m.est_10/m.population
 m["log_wage"]=np.log(m.pay_10.where(m.pay_10>1000))
 m["housing_price_to_wage"]=m.home_value/m.pay_10
 m["rent_to_wage"]=12*m.monthly_rent/m.pay_10
 m["log_home_price_wage"]=np.log(m.housing_price_to_wage.where(m.housing_price_to_wage.between(.2,60)))
 m["log_rent_wage"]=np.log(m.rent_to_wage.where(m.rent_to_wage.between(.005,2)))
 m=m.sort_values(["cbsa","year"])
 for col in ["gdp_percapita","emp_10","est_10","pay_10"]:
  for h in [1,3,5]:
   past=m.groupby("cbsa")[col].shift(h)
   m[f"prior_{col}_growth{h}"]=100*(np.log(m[col].where(m[col]>0))-np.log(past.where(past>0)))/h
  for h in [3,5]:
   future=m.groupby("cbsa")[col].shift(-h)
   m[f"out_{col}_{h}"]=100*(np.log(future.where(future>0))-np.log(m[col].where(m[col]>0)))/h
 m.to_csv(OUT/"metro_research_panel.csv.gz",index=False,compression="gzip")
 print("METRO_PANEL",len(m),"metros",m.cbsa.nunique(),"grad_nonmiss",int(m.ba_stem_3yr.notna().sum()),flush=True)
def main():
 start=time.time()
 with cf.ThreadPoolExecutor(max_workers=3) as pool:
  f1=pool.submit(ipeds);f2=pool.submit(qcew);f3=pool.submit(bea)
  ip=f1.result();q=f2.result();a=f3.result()
 h=zillow()
 cross=cbsa()
 p=build_county(a,ip,q,h)
 build_metro(p,cross)
 METADATA["final"]={"elapsed_seconds":round(time.time()-start,1),"county_rows":int(len(p)),
 "counties":int(p.county.nunique()),"QCEW_private_obs":int(p.emp_10.notna().sum()),
 "degree_observations":int(p.ba_all_3yr.notna().sum()),"Zillow_county_obs":int(p.home_value.notna().sum()),
 "metro_crosswalk_counties":int(len(cross))}
 METADATA["source_issues"]=ISSUES
 (OUT/"source_manifest.json").write_text(json.dumps(METADATA,indent=2,default=str))
 print("ALL_DONE",json.dumps(METADATA["final"]),flush=True)
if __name__=="__main__": main()
