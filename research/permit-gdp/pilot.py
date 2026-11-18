"""Source feasibility audit for multi-city permit processing timelines versus county real GDP.
All data from open municipal Socrata portals and BEA county GDP; no credentials used.
"""
import json, requests, io, zipfile
from pathlib import Path
OUT=Path("research/permit-gdp/out");OUT.mkdir(parents=True,exist_ok=True)
sources={
"Chicago":{"host":"data.cityofchicago.org","id":"ydr8-5enu","fips":"17031"},
"Seattle":{"host":"data.seattle.gov","id":"76t5-zqzr","fips":"53033"},
"San Francisco":{"host":"data.sfgov.org","id":"i98e-djp9","fips":"06075"},
"Austin":{"host":"data.austintexas.gov","id":"3syk-w9eu","fips":"48453"}
}
session=requests.Session();session.headers.update({"User-Agent":"Open academic research reproducibility / public data integration"})
out={}
for city,s in sources.items():
    try:
        url=f"https://{s['host']}/api/views/{s['id']}.json"
        r=session.get(url,timeout=90)
        r.raise_for_status()
        obj=r.json()
        columns=[{"field":x.get("fieldName"),"name":x.get("name"),"type":x.get("dataTypeName")} for x in obj.get("columns",[]) if not x.get("fieldName","").startswith(":")]
        out[city]={"url":url,"rows":obj.get("totalRows"),"columns":columns,"fips":s["fips"]}
        print("PORTAL",city,"rows",obj.get("totalRows"),"fields",len(columns),flush=True)
        print("DATE_AND_PERMIT_FIELDS",city,[x for x in columns if any(z in (x["field"] or "").lower() for z in ("date","time","permit","work","class","use","issue","appl","value","status","cost","review"))][:45],flush=True)
    except Exception as ex:
        print("PORTAL_FAIL",city,repr(ex),flush=True)
        out[city]={"error":repr(ex),"fips":s["fips"]}
try:
    url="https://apps.bea.gov/regional/zip/CAGDP1.zip"
    r=session.get(url,timeout=150); print("BEA_FETCH",r.status_code,len(r.content),r.url,flush=True);r.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        print("BEA_FILES",z.namelist()[:20],flush=True)
        name=next(n for n in z.namelist() if n.lower().endswith(".csv"))
        with z.open(name) as f:
            for i,line in zip(range(7),f):
                print("BEA_LINE",i,line.decode("utf-8-sig",errors="replace")[:800],flush=True)
    out["bea"]={"url":url,"zip_bytes":len(r.content),"files":z.namelist()[:20]}
except Exception as ex:
    print("BEA_FAIL",repr(ex),flush=True);out["bea"]={"error":repr(ex)}
(OUT/"source_audit.json").write_text(json.dumps(out,indent=2))
