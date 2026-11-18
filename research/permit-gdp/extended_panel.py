"""Cross-jurisdiction permitting, county real GDP, and BLS QCEW panel.
Descriptive and predictive analysis only; not a causal estimate.
Data sources: original official Socrata/ArcGIS jurisdictions, BLS QCEW, BEA.
"""
import concurrent.futures as cf, io, json, time, zipfile
from pathlib import Path
import numpy as np, pandas as pd, requests
OUT=Path("research/permit-gdp/out");OUT.mkdir(parents=True,exist_ok=True)
HEAD={"User-Agent":"Public noncommercial economic-development research"}
START,END=2012,2023
SC={
"Austin":("data.austintexas.gov","3syk-w9eu","48453","issue_date","applieddate","permit_number",
  "permittype='BP' AND permit_class_mapped='Commercial'",["permittype","permit_class_mapped","work_class"]),
"Seattle":("data.seattle.gov","76t5-zqzr","53033","issueddate","applieddate","permitnum",
  "permitclassmapped='Non-Residential' AND permittypemapped='Building'",
  ["permitclassmapped","permittypemapped","permittypedesc","daysplanreviewcity","daysoutcorrections","totaldaysplanreview","numberreviewcycles"]),
"San Francisco":("data.sfgov.org","i98e-djp9","06075","issued_date","filed_date","permit_number",
  "permit_type_definition in ('additions alterations or repairs','new construction','new construction wood frame')",
  ["permit_type_definition","proposed_use","approved_date"]),
"Los Angeles pre-2020":("data.lacity.org","dyxf-7hc4","06037","issue_date","submitted_date","permit_nbr",
  "permit_group='Building' AND permit_sub_type='Commercial'",["permit_type","permit_sub_type","business_unit"]),
"Los Angeles 2020+":("data.lacity.org","pi9x-tg5x","06037","issue_date","submitted_date","permit_nbr",
  "permit_group='Building' AND permit_sub_type='Commercial'",["permit_type","permit_sub_type","business_unit"]),
"Cincinnati":("data.cincinnati-oh.gov","uhjb-xac9","39061","issueddate","applieddate","permitnum",
  "permitclass='OBC' AND permittype='CBPCBCP'",["permitclass","permittype","workclass"]),
"Honolulu":("data.honolulu.gov","4vab-c87q","15003","issuedate","createddate","buildingpermitno",
  "commercialresidential='Commercial' AND (newbuilding='Y' OR addition='Y' OR alteration='Y')",
  ["commercialresidential","newbuilding","addition","alteration"]),
"East Baton Rouge":("data.brla.gov","7fq7-8j7r","22033","issueddate","creationdate","permitid",
  "permittype in ('New Building Permit (C)','Existing Bldg - Remodel Only (C)','Existing Bldg - Addition Only (C)')",["permittype","designation"]),
"NYC boroughs":("data.cityofnewyork.us","w9ak-ipjd",None,"first_permit_date","filing_date","job_filing_number",
  "job_type in ('New Building','Alteration','Alteration CO') AND first_permit_date IS NOT NULL",
  ["borough","building_type","job_type","filing_review_type"])
}
BORO={"Manhattan":"36061","Bronx":"36005","Brooklyn":"36047","Queens":"36081","Staten Island":"36085"}
GIS={
"Denver":("https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_DEV_COMMERCIALCONSTPERMIT_P/FeatureServer/317","08031","DATE_ISSUED","DATE_RECEIVED","PERMIT_NUM",["CLASS"]),
"Raleigh":("https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Building_Permits/FeatureServer/0","37183","issueddate","applieddate","permitnum",["permitclassmapped","permittype","workclass"])
}
ISSUES=[]
def grab(url,params=None,timeout=100):
 for attempt in range(3):
  try:
   r=requests.get(url,params=params,headers=HEAD,timeout=timeout)
   if r.ok:return r
   print("HTTP_PROBLEM",r.status_code,r.url[:160],r.text[:120],flush=True)
   if r.status_code in (400,401,403,404):break
  except Exception as e:print("REQUEST_PROBLEM",type(e).__name__,str(e)[:140],flush=True)
  time.sleep(2+attempt*3)
 raise RuntimeError(f"GET failed: {url}, {str(params)[:100]}")
def soc(item):
 name,(host,id,fips,issued,applied,permit,where,extra)=item
 cols=list(dict.fromkeys([permit,issued,applied,*extra]))
 url=f"https://{host}/resource/{id}.json"
 cond=f"{issued} >= '{START}-01-01T00:00:00' AND {issued} < '{END+1}-01-01T00:00:00' AND {applied} IS NOT NULL AND {where}"
 chunks=[];offset=0
 try:
  for i in range(40):
   q={"$select":",".join(cols),"$where":cond,"$limit":20000,"$offset":offset,
      "$order":f"{issued} ASC,{permit} ASC"}
   values=grab(url,q,timeout=120).json()
   if not isinstance(values,list):raise ValueError(str(values)[:200])
   if not values:break
   chunks.append(pd.DataFrame(values));offset+=len(values)
   if len(values)<20000:break
  if not chunks:print("SOURCE_EMPTY",name,flush=True);return pd.DataFrame()
  d=pd.concat(chunks,ignore_index=True).drop_duplicates(permit)
  d["city"]="Los Angeles" if name.startswith("Los Angeles") else name
  d["county_fips"]=fips;d["permit_id"]=d[permit].astype(str)
  d["issue_date"]=pd.to_datetime(d[issued],errors="coerce")
  d["apply_date"]=pd.to_datetime(d[applied],errors="coerce")
  d["source"]=host+"/"+id
  if name=="NYC boroughs":
   d=d[d[permit].str.endswith("-I1",na=False)]
   d=d[~d.building_type.fillna("").str.contains("1 Family|2 Family",case=False,regex=True)]
   d["county_fips"]=d.borough.map(BORO)
  elif name=="San Francisco":
   d=d[~d.proposed_use.fillna("").str.contains("family|apartment|condomin|residential|dwelling|adu",case=False,regex=True)]
  print("SOURCE_OK",name,len(d),"pages",len(chunks),flush=True)
  return d
 except Exception as e:
  ISSUES.append({"source":name,"error":str(e)})
  print("SOURCE_FAIL",name,repr(e),flush=True);return pd.DataFrame()
def arc(item):
 name,(url,fips,issued,applied,permit,extras)=item
 try:
  meta=grab(url,{"f":"json"}).json()
  avail=set(v["name"] for v in meta.get("fields",[]))
  cols=[x for x in [permit,issued,applied,*extras] if x in avail]
  if issued not in cols or applied not in cols:raise RuntimeError("Missing dates")
  where=f"{issued} >= DATE '{START}-01-01' AND {issued} < DATE '{END+1}-01-01'"
  obj=grab(url+"/query",{"f":"json","where":where,"returnCountOnly":"true"}).json()
  if "error" in obj:
   where=f"{issued} IS NOT NULL"
   obj=grab(url+"/query",{"f":"json","where":where,"returnCountOnly":"true"}).json()
  total=int(obj["count"]);print("GIS_TOTAL",name,total,flush=True)
  chunks=[];offset=0
  for i in range(min(260,(total+1999)//2000+1)):
   p={"f":"json","where":where,"outFields":",".join(cols),"returnGeometry":"false","resultOffset":offset,
      "resultRecordCount":2000,"orderByFields":meta.get("objectIdField","OBJECTID")}
   response=grab(url+"/query",p,timeout=120).json()
   if "error" in response:raise RuntimeError(str(response["error"])[:200])
   values=[r["attributes"] for r in response.get("features",[])]
   if not values:break
   chunks.append(pd.DataFrame(values));offset+=len(values)
   if len(values)<2000:break
  if not chunks:return pd.DataFrame()
  d=pd.concat(chunks,ignore_index=True).drop_duplicates(permit)
  d["city"]=name;d["county_fips"]=fips;d["permit_id"]=d[permit].astype(str)
  d["issue_date"]=pd.to_datetime(pd.to_numeric(d[issued],errors="coerce"),unit="ms",errors="coerce")
  d["apply_date"]=pd.to_datetime(pd.to_numeric(d[applied],errors="coerce"),unit="ms",errors="coerce")
  d["source"]=url
  if name=="Raleigh":
   d=d[d.permitclassmapped.fillna("").str.contains("Non-Residential|Commercial",case=False,regex=True)]
  print("GIS_OK",name,len(d),"pages",len(chunks),flush=True)
  return d
 except Exception as e:
  ISSUES.append({"source":name,"error":str(e)})
  print("GIS_FAIL",name,repr(e),flush=True);return pd.DataFrame()
def permit_panel():
 jobs=[(soc,k) for k in SC.items()]+[(arc,k) for k in GIS.items()]
 with cf.ThreadPoolExecutor(max_workers=6) as pool:
  fut=[pool.submit(f,j) for f,j in jobs]
  chunks=[q.result() for q in fut]
 d=pd.concat([x for x in chunks if not x.empty],ignore_index=True,sort=False)
 d["year"]=d.issue_date.dt.year
 d=d[d.year.between(START,END)].copy()
 d["days"]=(d.issue_date-d.apply_date).dt.total_seconds()/86400
 d["valid"]=d.days.between(0,3650)
 qa=d.groupby(["city","county_fips","year"],as_index=False).agg(
  n_raw=("permit_id","size"),valid_count=("valid","sum"))
 qa["valid_share"]=qa.valid_count/qa.n_raw
 d=d[d.valid].drop_duplicates(["city","permit_id"]).copy()
 # Include the geography and source definition for auditability.
 def summary(g):
  r={"n":len(g),"median_days":g.days.median(),"p75_days":g.days.quantile(.75),
     "p90_days":g.days.quantile(.9),"p95_days":g.days.quantile(.95),
     "over90_share":(g.days>90).mean(),"over180_share":(g.days>180).mean(),
     "same_day_share":(g.days<1).mean()}
  if g.name[0]=="Seattle":
   for c,label in [("daysplanreviewcity","gov_review"),("daysoutcorrections","applicant_corrections"),("numberreviewcycles","review_cycles")]:
    val=pd.to_numeric(g[c],errors="coerce").where(lambda x:x.between(0,3650))
    r["n_"+label]=int(val.notna().sum())
    r["median_"+label]=val.median()
    r["mean_"+label]=val.mean()
  return pd.Series(r)
 x=d.groupby(["city","county_fips","year"],dropna=False).apply(summary,include_groups=False).reset_index()
 if "level_3" in x.columns:
  x=x.pivot(index=["city","county_fips","year"],columns="level_3",values=0).reset_index()
  x.columns.name=None
 x=x.merge(qa,on=["city","county_fips","year"],how="left")
 x.to_csv(OUT/"permit_geography_year.csv",index=False)
 qa.to_csv(OUT/"permit_quality.csv",index=False)
 print("PERMITS_COMPLETE",len(d),len(x),x.groupby("city").agg(years=("year","nunique"),n=("n","sum")).to_dict("index"),flush=True)
 return x
def qcew(counties):
 def get_slice(tup):
  y,ind=tup
  u=f"https://data.bls.gov/cew/data/api/{y}/a/industry/{ind}.csv"
  try:
   r=grab(u,timeout=90)
   d=pd.read_csv(io.BytesIO(r.content),low_memory=False,
      dtype={"area_fips":str,"industry_code":str,"own_code":str,"size_code":str})
   d=d[d.area_fips.isin(counties)&d.own_code.eq("5")&d.industry_code.eq(ind)&d.size_code.eq("0")].copy()
   d["year"]=y;d["industry"]=ind
   return d[["area_fips","year","industry","annual_avg_emplvl","annual_avg_estabs"]]
  except Exception as e:
   ISSUES.append({"source":"BLS_QCEW_"+str(y)+"_"+ind,"error":str(e)})
   print("QCEW_SLICE_FAIL",y,ind,str(e)[:150],flush=True)
   return pd.DataFrame()
 tasks=[(y,ind) for y in range(2011,2025) for ind in ["10","23"]]
 with cf.ThreadPoolExecutor(max_workers=5) as pool:
  result=list(pool.map(get_slice,tasks))
 nonempty=[x for x in result if not x.empty]
 if not nonempty:raise RuntimeError("QCEW download returned no county records")
 d=pd.concat(nonempty,ignore_index=True).drop_duplicates(["area_fips","year","industry"])
 for col in ("annual_avg_emplvl","annual_avg_estabs"):
  d[col]=pd.to_numeric(d[col],errors="coerce")
 wide=d.pivot(index=["area_fips","year"],columns="industry",values=["annual_avg_emplvl","annual_avg_estabs"])
 wide.columns=[("private_emp_" if k=="annual_avg_emplvl" else "private_est_")+("all" if v=="10" else "construction") for k,v in wide.columns]
 wide=wide.reset_index().rename(columns={"area_fips":"county_fips"})
 wide.to_csv(OUT/"bls_qcew_county_year.csv",index=False)
 print("QCEW_COMPLETE",len(wide),"counties",wide.county_fips.nunique(),flush=True)
 return wide
def bea(counties):
 z=zipfile.ZipFile(io.BytesIO(grab("https://apps.bea.gov/regional/zip/CAGDP1.zip").content))
 f=next(a for a in z.namelist() if "ALL_AREAS" in a and a.endswith(".csv"))
 d=pd.read_csv(z.open(f),dtype=str,encoding="latin-1",low_memory=False)
 d.columns=d.columns.str.strip()
 d["GeoFIPS"]=d.GeoFIPS.astype(str).str.strip().str.strip('"').str.zfill(5)
 d=d[d.GeoFIPS.isin(counties)&d.LineCode.eq("1")]
 d=d.melt(id_vars=["GeoFIPS","GeoName"],value_vars=[str(y) for y in range(2011,2025)],
          var_name="year",value_name="real_gdp")
 d["year"]=d.year.astype(int)
 d["real_gdp"]=pd.to_numeric(d.real_gdp.str.replace(",","",regex=False),errors="coerce")
 d=d.rename(columns={"GeoFIPS":"county_fips"})
 d.to_csv(OUT/"bea_county_real_gdp.csv",index=False)
 print("BEA_COMPLETE",len(d),"counties",d.county_fips.nunique(),flush=True)
 return d
def main():
 p=permit_panel()
 counties=set(p.county_fips.dropna().unique().tolist())
 q=qcew(counties);b=bea(counties)
 x=p.merge(q,on=["county_fips","year"],how="left").merge(b,on=["county_fips","year"],how="left")
 outcome=["real_gdp","private_emp_all","private_est_all","private_emp_construction","private_est_construction"]
 for key in outcome:
  ref=b[["county_fips","year",key]] if key=="real_gdp" else q[["county_fips","year",key]]
  for h in [1,2,3]:
   d=ref.copy();d["year"]-=h;d=d.rename(columns={key:"future_"+key+"_"+str(h)})
   x=x.merge(d,on=["county_fips","year"],how="left")
   x[f"growth_{key}_{h}yr"]=100*(np.log(x["future_"+key+"_"+str(h)].clip(lower=1))-np.log(x[key].clip(lower=1)))/h
 x.to_csv(OUT/"matched_city_county_growth_panel.csv",index=False)
 (OUT/"source_errors.json").write_text(json.dumps(ISSUES,indent=2))
 print("FINAL_SUMMARY",json.dumps({"cities":p.city.nunique(),"county_geographies":len(counties),
  "permit_rows":int(p.n.sum()),"annual_rows":len(x),"qcew_rows":int(x.private_emp_all.notna().sum()),
  "gdp_rows":int(x.real_gdp.notna().sum()),"source_errors":ISSUES},default=str)[:20000],flush=True)
if __name__=="__main__":main()
