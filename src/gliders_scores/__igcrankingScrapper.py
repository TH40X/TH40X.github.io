import glob
import os
import requests
from bs4 import BeautifulSoup
from time import time
from concurrent.futures import ThreadPoolExecutor

PLANEURS = dict()

skipped = 0
valid = 0


def scrape_comp(comp_id):
    global skipped, valid

    print(f"Scraping competition {comp_id}/4948...", end=" ")
    url = f"https://rankingdata.fai.org/SGP_CompPage.php?compid={comp_id}"

    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    planeurs = []
    scores = []

    for tr in soup.find_all("tr"):
        tds = tr.find_all("td")
        if len(tds) > 4:
            nobr = tds[4].find("nobr")
            score = tds[1].text.strip()
            if nobr and score:
                name = nobr.text.strip()
                if name:
                    planeurs.append(name)
                    scores.append(score)

    if len(planeurs) < 3:
        skipped += 1
        print("Skipped")
        return

    planeur_score_tuples = list(zip(planeurs, [int(s) for s in scores]))

    planeur_score_tuples.sort(key=lambda x: x[1], reverse=True)

    max_score = planeur_score_tuples[0][1]
    min_score = planeur_score_tuples[-1][1]
    range_score = max_score - min_score

    normalized_planeur_score = set()
    for planeur, score in planeur_score_tuples:
        normalized_score = (score - min_score) / range_score if range_score else 0
        normalized_planeur_score.add((planeur, round(normalized_score, 2)))

    for perf in normalized_planeur_score:
        if perf[0] in PLANEURS:
            PLANEURS[perf[0]].add(perf[1])
        else:
            PLANEURS[perf[0]] = set([perf[1]])

    valid += 1
    print("Done")


t0 = time()

with ThreadPoolExecutor(max_workers=30) as executor:
    executor.map(scrape_comp, range(1, 5000))

print("")
print(f"Skipped {skipped} competitions")
print(f"Valid {valid} competitions")
print("")

t1 = time()
print(f"Time elapsed: {int(t1 - t0)} s")
print("")

existing_txt_files = glob.glob(f"src/gliders_scores/*.txt")
print(len(existing_txt_files), "files to delete")
for f in existing_txt_files:
    os.remove(f)

for planeur, scores in PLANEURS.items():
    file_name = (
        planeur.replace(" ", "")
        .replace("/", "")
        .replace("-", "")
        .replace("_", "")
        .lower()
    )
    with open(f"src/gliders_scores/{file_name}.txt", "a") as f:
        f.write(",".join(map(str, scores)))
        f.write(",")

existing_txt_files = glob.glob(f"src/gliders_scores/*.txt")
print(len(existing_txt_files), "files created")
