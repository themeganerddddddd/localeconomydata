"""Check open county-level housing price, rental price, BEA income/population sources."""
import requests,io,zipfile,pandas as pd
S=requests.Session();S.headers.update({"User-Agent":"Mozilla/5.0 public-sector economic development analysis"})
sources={
"ZILLOW_COUNTY_ZHVI":"https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv",
"ZILLOW_COUNTY_ZORI":"https://files.zillowstatic.com/research/public_csvs/zori/County_zori_uc_sfrcondomfr_sm_month.csv",
"BEA_CAINC1":"https://apps.bea.gov/regional/zip/CAINC1.zip",
"CENSUS_BPS":"https://www2.census.gov/econ/bps/County/co2022a.txt",
"CBSA_2023":"https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx",
"CENSUS_ACS_QUERY_MINI":"https://api.census.gov/data/2022/acs/acs5?get=NAME,B25064_001E&for=county:031&in=state:24",
}
for name,url in sources.items():
 try:
  r=S.get(url,timeout=80,stream=True,allow_redirects=True)
  print("SRC",name,r.status_code,r.url,r.headers.get("Content-Length"),r.headers.get("Content-Type"),flush=True)
  if name in ("ZILLOW_COUNTY_ZHVI","ZILLOW_COUNTY_ZORI") and r.status_code==200:
   line=""
   for b in r.iter_lines():
    if b:
     line=b.decode("utf8",errors="replace")
     if not line.startswith("RegionID"):print("HEAD",name,line[:500],flush=True)
     else:print("COLUMNS",name,line[:800],flush=True)
     break
  elif name=="BEA_CAINC1" and r.status_code==200:
   payload=r.content;z=zipfile.ZipFile(io.BytesIO(payload));fname=next(x for x in z.namelist() if "ALL_AREAS" in x and ".csv" in x)
   d=pd.read_csv(z.open(fname),encoding="latin-1",nrows=7)
   print("BEA_CONTENT",name,len(payload),fname,d.columns.tolist(),d.head(5).to_json(orient="records")[:2000],flush=True)
  elif name=="CBSA_2023" and r.status_code==200:
   d=pd.read_excel(io.BytesIO(r.content),nrows=10);print("CBSA_FIELDS",d.columns.tolist(),d.head(8).to_json(orient="records")[:1800],flush=True)
  elif name=="CENSUS_BPS" and r.status_code==200:
   b=r.raw.read(1200);print("BPS_HEAD",b.decode("latin1")[:1100],flush=True)
  elif name=="CENSUS_ACS_QUERY_MINI":
   print("ACS_BODY",r.raw.read(220).decode("latin1"),flush=True)
  r.close()
 except Exception as e:print("FAIL",name,type(e).__name__,str(e)[:350],flush=True)
