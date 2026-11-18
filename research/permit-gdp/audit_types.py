"""Audit commercial structural permit fields, ArcGIS endpoints and availability."""
import requests,json,concurrent.futures
s=requests.Session();s.headers.update({"User-Agent":"Open public economic data research"})
C={
"Austin":("data.austintexas.gov","3syk-w9eu","permit_class_mapped","issue_date"),
"Seattle":("data.seattle.gov","76t5-zqzr","permitclassmapped","issueddate"),
"Cincinnati":("data.cincinnati-oh.gov","uhjb-xac9","permitclass","issueddate"),
"Honolulu":("data.honolulu.gov","4vab-c87q","commercialresidential","issuedate"),
"BatonRouge":("data.brla.gov","7fq7-8j7r","permittype","issueddate"),
"SanFrancisco":("data.sfgov.org","i98e-djp9","permit_type_definition","issued_date"),
"NYC":("data.cityofnewyork.us","w9ak-ipjd","job_type","first_permit_date"),
"LosAngeles":("data.lacity.org","dyxf-7hc4","permit_sub_type","issue_date")
}
def run(args):
 city,(host,id,field,date)=args
 try:
  u=f"https://{host}/resource/{id}.json"; cond=f"{date} >= '2021-01-01T00:00:00' and {date} < '2022-01-01T00:00:00'"
  q=s.get(u,params={"$select":f"{field},count(*) as n","$where":cond,"$group":field,"$order":"n desc","$limit":20},timeout=45)
  print("CATEGORIES",city,q.status_code,q.text[:2700],flush=True)
 except Exception as e:print("CATEGORIES_FAIL",city,str(e),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as x:list(x.map(run,C.items()))
for name,url in [
("DenverCommercial","https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_DEV_COMMERCIALCONSTPERMIT_P/FeatureServer?f=json"),
("DenverResidential","https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/arcgis/rest/services/ODC_DEV_RESIDENTIALCONSTPERMIT_P/FeatureServer/316?f=json"),
("Raleigh","https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Building_Permits/FeatureServer/0?f=json")]:
 try:
  r=s.get(url,timeout=50);j=r.json()
  print("ARCGIS",name,r.status_code,"layers",j.get("layers"),"count",j.get("maxRecordCount"),
        "fields",[(f.get("name"),f.get("alias")) for f in j.get("fields",[]) if any(w in f.get("name","").lower() for w in ["date","permit","class","work","type","use","received","issued","cost"])][:75],flush=True)
 except Exception as e:print("ARCGIS_FAIL",name,str(e),flush=True)
