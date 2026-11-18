"""Live source audit for larger permitting x local growth panel."""
import requests,json,concurrent.futures,io,pandas as pd
from pathlib import Path
OUT=Path("research/permit-gdp/out");OUT.mkdir(parents=True,exist_ok=True)
sources={
"Chicago":("data.cityofchicago.org","ydr8-5enu"),
"Seattle":("data.seattle.gov","76t5-zqzr"),
"SanFrancisco":("data.sfgov.org","i98e-djp9"),
"Austin":("data.austintexas.gov","3syk-w9eu"),
"Mesa":("citydata.mesaaz.gov","dzpk-hxfb"),
"Cincinnati":("data.cincinnati-oh.gov","uhjb-xac9"),
"Honolulu":("data.honolulu.gov","4vab-c87q"),
"LosAngelesOld":("data.lacity.org","dyxf-7hc4"),
"LosAngelesNew":("data.lacity.org","pi9x-tg5x"),
"NYC":("data.cityofnewyork.us","w9ak-ipjd"),
"BatonRouge":("data.brla.gov","7fq7-8j7r"),
}
session=requests.Session(); session.headers.update({"User-Agent":"University economic-development open-data research, metadata only"})
def get_source(info):
    city,(host,id)=info; d={"city":city,"host":host,"id":id}
    try:
        r=session.get(f"https://{host}/api/views/{id}.json",timeout=60);r.raise_for_status();obj=r.json()
        cols=[{"field":z.get("fieldName"),"type":z.get("dataTypeName")} for z in obj["columns"] if not z.get("fieldName","").startswith(":")]
        d.update({"columns":cols,"rows_reported":obj.get("totalRows"),"source_url":f"https://{host}/api/views/{id}.json"})
        print("SCHEMA",city,"columns",len(cols),[c["field"] for c in cols if any(w in (c["field"] or "").lower() for w in ["date","file","issu","appl","plan","review","permit","class","work","type","use","city","cost"])][:75],flush=True)
        url=f"https://{host}/resource/{id}.json"
        q=session.get(url,params={"$limit":2},timeout=60);print("SAMPLES",city,q.status_code,q.text[:1300],flush=True)
    except Exception as e:d["error"]=str(e);print("SCHEMA_FAIL",city,str(e),flush=True)
    return d
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    results=list(pool.map(get_source,sources.items()))
(OUT/"expansion_source_schema.json").write_text(json.dumps(results,indent=2))
for year in [2017,2020,2023,2024]:
    for county in ["17031","48453","53033"]:
        url=f"https://data.bls.gov/cew/data/api/{year}/a/area/{county}.csv"
        try:
            r=session.get(url,timeout=50);d=pd.read_csv(io.BytesIO(r.content),nrows=3) if r.status_code==200 else None
            print("QCEW",year,county,r.status_code,len(r.content),d.columns.tolist() if d is not None else r.text[:150], d.iloc[:2].to_dict("records") if d is not None else "",flush=True)
        except Exception as e:print("QCEW_FAIL",year,county,str(e),flush=True)
