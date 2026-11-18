"""Probe source schemas for county-industry emergent cluster research."""
from io import BytesIO
import io, zipfile, pandas as pd, requests, time, traceback
session=requests.Session()
session.headers.update({"User-Agent":"Academic research replication (contact: public-data-research@example.com)"})
def fetch(url):
    t=time.monotonic()
    r=session.get(url,timeout=120); print("FETCH",url, r.status_code,len(r.content),"elapsed",round(time.monotonic()-t,1),flush=True)
    r.raise_for_status(); return r.content
for year in (2016,2017,2018,2022,2023):
    try:
        u=f"https://www2.census.gov/programs-surveys/cbp/datasets/{year}/cbp{year%100:02d}co.zip"
        body=fetch(u)
        with zipfile.ZipFile(BytesIO(body)) as z:
            print("CBP files",year,z.namelist(),flush=True)
            with z.open(z.namelist()[0]) as f:
                d=pd.read_csv(f,nrows=7,encoding_errors='replace',dtype=str)
            print("CBP headers",year,list(d.columns))
            print(d.iloc[:3].to_string(index=False),flush=True)
    except Exception as e: print("CBP ERR",year,repr(e),flush=True)
u="https://ncses.nsf.gov/pubs/nsb20241/assets/data/swbinv-1.xlsx"
try:
    body=fetch(u)
    x=pd.ExcelFile(BytesIO(body))
    print("PATENT_SHEETS",x.sheet_names,flush=True)
    for s in x.sheet_names[:12]:
        d=pd.read_excel(x,sheet_name=s,nrows=9,header=None)
        print("PATENT SHEET",s,"PREVIEW",d.shape,flush=True)
        print(d.iloc[:9,:12].to_string(index=False,header=False),flush=True)
except Exception as e: print("PATENT ERR",repr(e),flush=True);traceback.print_exc()
