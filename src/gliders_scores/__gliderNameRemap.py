import glob
import os


while True:
    glider = input("Glider name: ")
    must_contain = input("Must contain: ").split(" ")

    existing_txt_files = glob.glob(f"src/gliders_scores/*.txt")
    for file in existing_txt_files:
        if file.split("/")[-1][0] == "_":
            continue

        skip = False
        for c in must_contain:
            if c not in file:
                skip = True
                break
        if skip:
            continue

        with open(f"{file}", "r") as f:
            content = f.read()
        length = len(content.split(","))

        choice = input(f"{file} ({length})")

        if choice == "":
            with open(f"src/gliders_scores/{glider}.txt", "a") as f:
                f.write(content)
            os.remove(file)
        elif choice == "d":
            os.remove(file)
