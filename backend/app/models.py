from pydantic import BaseModel


class County(BaseModel):
    fips: str
    county_name: str
    state_name: str
    state_abbr: str
    population: int | None = None
    lat: float | None = None
    lon: float | None = None
