import glob
import os


existing_txt_files = glob.glob(f"src/gliders_scores/*.txt")

for file in existing_txt_files:
    with open(f"{file}", "r") as f:
        content = f.read()
    length = len(content.split(","))

    if length > 500:
        print(file, "(", length, ")")
