import glob
import os


while True:
    glider = input("Glider name: ")
    must_contain = input("Must contain: ").split(" ")

    existing_txt_files = glob.glob(f"src/gliders_scores/*.txt")
    to_remove = set()
    for file in existing_txt_files:
        if file.split("/")[-1][0] == "_":
            continue

        skip = True
        for c in must_contain:
            if c in file:
                skip = False
                break
        if skip:
            continue

        with open(f"{file}", "r") as f:
            content = f.read()
        length = len(content.split(","))

        print(file, "(", length, ")")
        to_remove.add(file)

    confirm = input("Confirm? (y/n)")

    if confirm == "n":
        continue

    for file in to_remove:
        with open(f"{file}", "r") as f:
            content = f.read()
        length = len(content.split(","))

        with open(f"src/gliders_scores/{glider}.txt", "a") as f:
            f.write(content)
        os.remove(file)
