"""Download authoritative education and median income and firm-age-zero BDS births.
All data source URLs are from US Census and USDA ERS public portals.
"""
import requests,io,pandas as pd,numpy as np,json,re
from pathlib import Path
OUT=Path("research/business-formation/out");OUT.mkdir(parents=True,exist_ok=True)
sources={
 "USDA_education":"https://ers.usda.gov/media/5492/educational-attainment-for-adults-age-25-and-older-for-the-united-states-states-and-counties-1970-2023.xlsx?v=98890",
 "USDA_income":"https://ers.usda.gov/media/5494/unemployment-and-median-household-income-for-the-united-states-states-and-counties-2000-23.xlsx?v=61378",
 "BDS_firmage":"https://www2.census.gov/programs-surveys/bds/tables/time-series/2023/bds2023_st_cty_fac.csv",
}
for name,url in sources.items():
 try:
  r=requests.get(url,timeout=180,headers={"User-Agent":"Academic research of housing, education and local employer startups"})
  print("GET",name,r.status_code,len(r.content),r.url,flush=True);r.raise_for_status()
  if name.startswith("USDA"):
   xls=pd.ExcelFile(io.BytesIO(r.content))
   print("SHEETS",name,xls.sheet_names,flush=True)
   for sheet in xls.sheet_names:
    d=pd.read_excel(xls,sheet_name=sheet,nrows=6,header=None)
    print("SAMPLE",name,sheet,d.to_json(orient="values")[:5000],flush=True)
   (OUT/(name+".xlsx")).write_bytes(r.content)
  else:
   d=pd.read_csv(io.BytesIO(r.content),low_memory=False,dtype={"st":str,"cty":str,"fagecoarse":str},
     usecols=["year","st","cty","fagecoarse","firms","estabs","emp","estabs_entry","job_creation_births"])
   d["year"]=pd.to_numeric(d.year,errors="coerce")
   print("AGE_CODES",d.fagecoarse.value_counts().head(20).to_json(),flush=True)
   d=d[d.year.between(2008,2023)&d.fagecoarse.str.match(r"^a\)\s*0$",na=False)].copy()
   d["county"]=d.st.str.zfill(2)+d.cty.str.zfill(3)
   d=d[d.county.str[-3:]!="999"]
   for c in ["firms","estabs","emp","estabs_entry","job_creation_births"]:
    d[c]=pd.to_numeric(d[c],errors="coerce")
   d.to_csv(OUT/"bds_firm_age0_county_year.csv.gz",index=False,compression="gzip")
   print("FIRM_AGE0",len(d),"counties",d.county.nunique(),
         "years",d.year.unique().tolist(),"nondisclosed",int(d.firms.isna().sum()),flush=True)
 except Exception as e:
  print("SOURCE_FAIL",name,type(e).__name__,str(e)[:400],flush=True)
