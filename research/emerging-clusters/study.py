"""Real-data U.S. county x NAICS-3 industry cluster emergence forecast backtest.
Public Census CBP 2006-2023 + NSF NCSES county/technology patents (grants 1998-2022).
All validation is out-of-time; labels used for fitting end before the prediction origin.
"""
import io, json, os, re, time, warnings, zipfile
from pathlib import Path
import numpy as np
import pandas as pd
import requests
from sklearn.metrics import average_precision_score, roc_auc_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from lightgbm import LGBMClassifier
warnings.filterwarnings("ignore", category=FutureWarning)
OUT=Path("research/emerging-clusters/out"); OUT.mkdir(parents=True,exist_ok=True)
STATE=dict(zip(
"AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(),
"01 02 04 05 06 08 09 10 11 12 13 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 44 45 46 47 48 49 50 51 53 54 55 56".split()))
SESS=requests.Session()
SESS.headers.update({"User-Agent":"Public academic economic development analysis; nonprofit research replication"})

def fetch(url):
    for i in range(4):
        try:
            r=SESS.get(url,timeout=150)
            if r.status_code == 200: return r.content
            print("HTTP_RETRY",r.status_code,url,flush=True)
        except Exception as e: print("FETCH_RETRY",url,str(e)[:110],flush=True)
        time.sleep(2+i*3)
    raise RuntimeError("Download unavailable: "+url)

def get_cbp():
    parts=[]; meta={}
    for year in range(2006,2024):
        url=f"https://www2.census.gov/programs-surveys/cbp/datasets/{year}/cbp{year%100:02d}co.zip"
        try:
            body=fetch(url)
            with zipfile.ZipFile(io.BytesIO(body)) as z:
                name=next(n for n in z.namelist() if n.lower().endswith((".txt",".csv")))
                df=pd.read_csv(z.open(name),dtype={"fipstate":str,"fipscty":str,"naics":str},
                    usecols=lambda col: col.lower() in {"fipstate","fipscty","naics","emp","est"},
                    low_memory=False,encoding="latin-1")
            df.columns=df.columns.str.lower()
            df["county"]=df["fipstate"].str.zfill(2)+df["fipscty"].str.zfill(3)
            df["year"]=year
            df["emp"]=pd.to_numeric(df["emp"],errors="coerce")
            df["est"]=pd.to_numeric(df["est"],errors="coerce")
            code=df["naics"].astype(str).str.strip()
            total=df[code.eq("------")][["county","year","emp"]].rename(columns={"emp":"county_emp"})
            total=total.drop_duplicates(["county","year"])
            d=df[code.str.fullmatch(r"\d{3}[/\\-]{3}|\d{3}",na=False)].copy()
            d["industry"]=code.loc[d.index].str[:3]
            d=d[["county","year","industry","emp","est"]]
            d=d.dropna(subset=["emp","est"])
            d=d[(d["emp"]>=0)&(d["est"]>=0)]
            parts.append((d,total))
            meta[year]={"rows":len(d),"counties":int(d.county.nunique()),"industries":int(d.industry.nunique()),"zip_mb":round(len(body)/1e6,1)}
            print("CBP",year,"rows",len(d),"counties",d.county.nunique(),"industries",d.industry.nunique(),flush=True)
        except Exception as e:
            print("CBP_SKIPPED",year,str(e)[:180],flush=True)
    if len(parts)<12: raise RuntimeError("Fewer than 12 CBP years downloaded")
    industry=pd.concat([p[0] for p in parts],ignore_index=True)
    totals=pd.concat([p[1] for p in parts],ignore_index=True)
    del parts
    # Comparison requires relatively stable three-digit industry definitions across NAICS revisions.
    exclude={"452","454","511","517","518","519","999"}
    industry=industry[~industry.industry.isin(exclude)].copy()
    industry=industry.drop_duplicates(["county","year","industry"])
    cy=totals.groupby(["county","year"],as_index=False).county_emp.sum()
    ny=cy.groupby("year",as_index=False).county_emp.sum().rename(columns={"county_emp":"us_emp"})
    ni=industry.groupby(["year","industry"],as_index=False).emp.sum().rename(columns={"emp":"us_ind_emp"})
    industry=industry.merge(cy,on=["county","year"],how="inner").merge(ny,on="year",how="left").merge(ni,on=["year","industry"],how="left")
    industry["lq"]=(industry["emp"]/industry["county_emp"])/(industry["us_ind_emp"]/industry["us_emp"])
    industry["us_ind_share"]=industry["us_ind_emp"]/industry["us_emp"]
    industry["state"]=industry.county.str[:2]
    diversity=industry.assign(active=industry.emp.ge(100).astype(np.int8)).groupby(["county","year"],as_index=False).active.sum().rename(columns={"active":"industry_diversity"})
    industry=industry.merge(diversity,on=["county","year"],how="left")
    industry=industry.replace([np.inf,-np.inf],np.nan)
    return industry,meta

def get_patents():
    url="https://ncses.nsf.gov/pubs/nsb20241/assets/data/swbinv-1.xlsx"
    book=pd.ExcelFile(io.BytesIO(fetch(url)))
    sheets=[s for s in book.sheet_names if re.match(r"Table SWBINV1-\d+$",s) and int(s.split("-")[-1])>=2]
    p=None;titles={}
    for n,sheet in enumerate(sheets):
        v=pd.read_excel(book,sheet_name=sheet,header=3)
        code=v.columns[0]
        v=v[v[code].astype(str).str.fullmatch(r"us-[a-z]{2}-\d{3}")].copy()
        v["county"]=v[code].astype(str).map(lambda z: STATE.get(z[3:5].upper(),"00")+z[-3:])
        years=[c for c in v.columns if str(c).replace(".0","").isdigit() and 2002<=int(float(c))<=2020]
        v=v.melt(id_vars="county",value_vars=years,var_name="year",value_name="patents")
        v["year"]=v["year"].astype(int)
        column="patent_total" if n==0 else f"patent_tech_{n:02d}"
        v[column]=pd.to_numeric(v["patents"],errors="coerce").fillna(0).clip(lower=0)
        v=v[["county","year",column]].drop_duplicates(["county","year"])
        if p is None:p=v
        else:p=p.merge(v,on=["county","year"],how="outer",sort=False)
        titles[column]=sheet
        if n%9==0:print("PATENT_SHEETS_PARSED",n+1,"of",len(sheets),flush=True)
    p=p.sort_values(["county","year"]).reset_index(drop=True)
    for col in list(titles):
        p[col]=p[col].fillna(0).astype("float32")
        p[col+"_3yr"]=p.groupby("county",sort=False)[col].transform(lambda s:s.rolling(3,min_periods=3).sum()).astype("float32")
    p["patent_prev_3yr"]=p.groupby("county",sort=False)["patent_total_3yr"].shift(3)
    print("PATENT_DATA",p.shape,"counties",p.county.nunique(),"years",p.year.min(),p.year.max(),flush=True)
    return p, titles

def add_lags(frame,h):
    base=frame.copy()
    for lag in [1,2]:
        x=frame[["county","year","industry","emp","est","county_emp","us_ind_emp"]].copy()
        x["year"]+=lag
        x=x.rename(columns={v:f"{v}_lag{lag}" for v in ["emp","est","county_emp","us_ind_emp"]})
        base=base.merge(x,on=["county","year","industry"],how="left",sort=False)
    y=frame[["county","year","industry","emp","est","lq"]].copy()
    y["year"]-=h
    y=y.rename(columns={"emp":"future_emp","est":"future_est","lq":"future_lq"})
    base=base.merge(y,on=["county","year","industry"],how="left",sort=False)
    base=base[base["year"].between(2008,2023-h)].copy()
    # Operational outcome: new specialization from below LQ 1.1,
    # plus material job growth, establishments, and a substantial future LQ.
    base=base[
      base.emp.ge(50)&base.est.ge(3)&base.lq.between(.35,1.10,inclusive="left")&
      base.emp_lag1.ge(0)&base.emp_lag2.ge(0)&base.county_emp_lag2.gt(0)&
      base.future_emp.notna()&base.future_est.notna()&base.future_lq.notna()&
      base.county_emp.gt(0)
    ].copy()
    base["event"]=(
      base.future_lq.ge(1.25)&base.future_emp.ge(200)&
      (base.future_emp-base.emp).ge(100)&
      base.future_emp.ge(base.emp*1.20)&
      (base.future_est-base.est).ge(2)
    ).astype("int8")
    base["log_emp"]=np.log1p(base.emp)
    base["log_est"]=np.log1p(base.est)
    base["log_county_emp"]=np.log1p(base.county_emp)
    base["log_us_ind_emp"]=np.log1p(base.us_ind_emp)
    base["emp_growth1"]=np.log1p(base.emp)-np.log1p(base.emp_lag1)
    base["emp_growth2"]=np.log1p(base.emp)-np.log1p(base.emp_lag2)
    base["est_growth2"]=np.log1p(base.est)-np.log1p(base.est_lag2)
    base["county_growth2"]=np.log1p(base.county_emp)-np.log1p(base.county_emp_lag2)
    base["us_ind_growth2"]=np.log1p(base.us_ind_emp)-np.log1p(base.us_ind_emp_lag2)
    base["year_num"]=base.year
    return base

def metrics(y,p):
    y=np.asarray(y,dtype="int8");p=np.asarray(p)
    n=len(y); k=max(1,int(n*.05))
    idx=np.argpartition(p,-k)[-k:]
    pr=float(np.mean(y[idx]));br=float(np.mean(y))
    return {"n":n,"events":int(y.sum()),"prevalence":round(br,5),
      "ap":round(float(average_precision_score(y,p)),5),
      "roc_auc":round(float(roc_auc_score(y,p)),5) if y.min()!=y.max() else None,
      "precision_top5":round(pr,5),"lift_top5":round(pr/br,3) if br else None,
      "recall_top5":round(float(y[idx].sum()/max(1,y.sum())),5)}

CAT=["industry","state"]
BASE=["lq","log_emp","log_est","log_county_emp","log_us_ind_emp",
      "emp_growth1","emp_growth2","est_growth2","county_growth2",
      "us_ind_growth2","us_ind_share","industry_diversity","year_num"]
def fitted_scores(train,test,features,algo):
    train=train.copy();test=test.copy()
    for c in features:
        if c not in CAT:
            train[c]=pd.to_numeric(train[c],errors="coerce").replace([np.inf,-np.inf],np.nan).fillna(0).astype("float32")
            test[c]=pd.to_numeric(test[c],errors="coerce").replace([np.inf,-np.inf],np.nan).fillna(0).astype("float32")
    if algo=="gbdt":
        for c in CAT:
            vals=pd.Index(pd.concat([train[c],test[c]]).astype(str).unique()).sort_values()
            train[c]=pd.Categorical(train[c],categories=vals)
            test[c]=pd.Categorical(test[c],categories=vals)
        model=LGBMClassifier(n_estimators=170,max_depth=5,num_leaves=23,learning_rate=.055,
                             min_child_samples=140,reg_lambda=5,random_state=2026,n_jobs=2,verbosity=-1)
        model.fit(train[features],train.event,categorical_feature=CAT)
        imp=dict(zip(features,model.feature_importances_.tolist()))
        return model.predict_proba(test[features])[:,1],imp
    numeric=[c for c in features if c not in CAT]
    prep=ColumnTransformer([
        ("num",StandardScaler(),numeric),
        ("cat",OneHotEncoder(handle_unknown="ignore"),CAT)],
        sparse_threshold=.8)
    x=prep.fit_transform(train[features])
    xt=prep.transform(test[features])
    model=LogisticRegression(solver="liblinear",C=.2,max_iter=100,tol=.002,random_state=2026)
    model.fit(x,train.event)
    return model.predict_proba(xt)[:,1],{}

def run():
    start=time.monotonic()
    cbp,cbpmeta=get_cbp()
    pats,pat_titles=get_patents()
    pat_feats=[c+"_3yr" for c in pat_titles]
    summary={"data":{"cbp":cbpmeta,"patent_features":len(pat_feats),"industries":int(cbp.industry.nunique()),
                     "counties":int(cbp.county.nunique()),"source_patent_books":pat_titles},
             "runs":[]}
    allpred=[]
    for h,origins in [(3,[2018,2019,2020]),(5,[2016,2017,2018])]:
        frame=add_lags(cbp,h)
        frame=frame.merge(pats[["county","year",*pat_feats,"patent_prev_3yr"]],on=["county","year"],how="left",sort=False)
        norm=frame.county_emp.clip(lower=100)
        frame["patents_rate_3yr"]=np.log1p(10000*frame["patent_total_3yr"].fillna(0)/norm)
        frame["patents_acceleration"]=np.log1p(frame.patent_total_3yr.fillna(0))-np.log1p(frame.patent_prev_3yr.fillna(0))
        for c in pat_feats[1:]:
            frame[c]=np.log1p(10000*frame[c].fillna(0)/norm).astype("float32")
        frame=frame.drop(columns=["patent_total_3yr","patent_prev_3yr"])
        pat_features=["patents_rate_3yr","patents_acceleration",*pat_feats[1:]]
        features_all=BASE+CAT+pat_features
        for origin in origins:
            # At forecast origin 'origin', only use training labels ending by 'origin-1'.
            tr=frame[(frame.year>=2008)&(frame.year<=origin-h-1)].copy()
            te=frame[frame.year.eq(origin)].copy()
            if tr.empty or te.empty or tr.event.sum()<30 or te.event.sum()<8:
                print("INSUFFICIENT_EVENTS",h,origin,len(tr),len(te),int(tr.event.sum()),int(te.event.sum()),flush=True)
                continue
            print("ORIGIN",h,origin,"train",len(tr),"train_events",int(tr.event.sum()),
                  "test",len(te),"test_events",int(te.event.sum()),flush=True)
            preds=te[["county","industry","year","event","lq","emp","est","future_lq","future_emp"]].copy()
            preds["horizon"]=h
            row={"horizon":h,"origin":origin,"train_n":len(tr),"test_n":len(te),
                 "train_events":int(tr.event.sum()),"test_events":int(te.event.sum()),"models":{}}
            # Four cells: incremental information, added model flexibility, and their interaction.
            for data_label,cols in [("traditional",BASE+CAT),("innovation",features_all)]:
                for method in ["logit","gbdt"]:
                    key=data_label+"_"+method
                    tick=time.monotonic()
                    score,imp=fitted_scores(tr,te,cols,method)
                    preds[key]=np.asarray(score,dtype="float32")
                    row["models"][key]=metrics(te.event,score)
                    if imp:row["models"][key]["feature_importance"]=sorted(imp.items(),key=lambda x:-x[1])[:15]
                    print("MODEL",h,origin,key,json.dumps(row["models"][key]),"seconds",round(time.monotonic()-tick,1),flush=True)
            summary["runs"].append(row)
            allpred.append(preds)
        print("HORIZON_COMPLETED",h,"elapsed_min",round((time.monotonic()-start)/60,2),flush=True)
    if not allpred: raise RuntimeError("No evaluated model runs")
    preds=pd.concat(allpred,ignore_index=True)
    preds.to_csv(OUT/"out_of_time_predictions.csv.gz",index=False,compression="gzip")
    # Compare models over strictly prospective origin years, preserving per-year scoring.
    for h,g in preds.groupby("horizon"):
        agg={"horizon":int(h),"n":len(g),"events":int(g.event.sum()),"outcome_rate":round(g.event.mean(),6),
             "origins":sorted(map(int,g.year.unique().tolist()))}
        for key in ["traditional_logit","innovation_logit","traditional_gbdt","innovation_gbdt"]:
            # Evaluate mean of by-origin metrics to avoid cross-origin probability shifts.
            origin_metrics=[metrics(x.event,x[key]) for _,x in g.groupby("year")]
            agg[key]={metric:round(float(np.mean([m[metric] for m in origin_metrics])),5)
                for metric in ["ap","roc_auc","precision_top5","lift_top5","recall_top5"]}
        summary.setdefault("aggregates",[]).append(agg)
    with open(OUT/"summary.json","w") as f:json.dump(summary,f,indent=2,default=str)
    print("STUDY_SUMMARY",json.dumps(summary["aggregates"],indent=2),flush=True)
    print("SOURCE_SCOPE",json.dumps({"years":list(cbpmeta),"counties":cbp.county.nunique(),
        "industries":cbp.industry.nunique(),"patent_tech_fields":len(pat_feats)-1,
        "elapsed_min":round((time.monotonic()-start)/60,2)}),flush=True)
    print("SUCCESS outputs",*[str(p) for p in OUT.iterdir()],flush=True)
if __name__=="__main__":run()
