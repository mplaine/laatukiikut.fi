
# coding: utf-8

# # Suomen Parhaat Boulderit 2018: Create Boulders Template
# March 17, 2018

# <br>
# Load the datafile `survey_-_cleaned.csv`, which contains the form responses to the **Suomen Parhaat Boulderit 2018** survey. 

# In[1]:

import pandas as pd
import numpy as np


# Load cleaned dataset
spb2018_df = pd.read_csv("data/survey_-_cleaned.csv")

# Drop duplicates (exclude the Timestamp column from comparisons)
spb2018_df = spb2018_df.drop_duplicates(subset=spb2018_df.columns.values.tolist()[1:])
spb2018_df.head()


# <br>
# Create boulders template file `boulders_-_template.csv`.

# In[2]:

def create_boulders_template():
    boulder_name_columns = [spb2018_df["Boulderin nimi"], spb2018_df["Boulderin nimi.1"], spb2018_df["Boulderin nimi.2"]]
    unique_boulder_names_s = pd.concat(boulder_name_columns, ignore_index=True).dropna().drop_duplicates().sort_values().reset_index(drop=True)
    unique_boulder_names_s.to_csv("data/boulders_-_template.csv", index=False)
    
create_boulders_template()

