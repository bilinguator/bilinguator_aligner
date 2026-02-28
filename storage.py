import os
import json
import hashlib
from pathlib import Path


SCRIPT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PROJECTS_JSON =  os.path.normpath(f'{SCRIPT_DIRECTORY}/storage/projects.json')


def read_projects():
    with open(PROJECTS_JSON, 'r') as file:
        return json.load(file)


def delete_all_projects():
    with open(PROJECTS_JSON, 'w') as file:
        file.write('{}')


def delete_project_from_json(path1, path2):
    hash = project_hash(path1, path2)
    projects = read_projects()
    
    if hash in projects:
        del projects[hash]
        write_projects(projects)


def write_projects(projects):
    with open(PROJECTS_JSON, 'w') as file:
        json.dump(projects, file, indent=4)


def project_hash(path1, path2):
    p1 = os.path.normcase(os.path.normpath(path1))
    p2 = os.path.normcase(os.path.normpath(path2))

    combined = f"{p1}||{p2}"

    digest = hashlib.sha256(combined.encode('utf-8')).hexdigest()

    return digest[:8]


def add_project_directory(path1, path2):
    hash = project_hash(path1, path2)

    project_dir = f'{STORAGE_DIRECTORY}/{hash}'
    if not os.path.isdir(project_dir):
        os.mkdir(project_dir)


def add_project_to_json(path1, path2, return_projects=False):
    hash = project_hash(path1, path2)

    projects = read_projects()
    if hash not in projects:
        projects[hash] = {
            'path1': path1,
            'path2': path2,
        }

        write_projects(projects)

    if return_projects:
        return projects


def set_attribute(path1, path2, attribute, value):
    projects = add_project_to_json(path1, path2, return_projects=True)
    hash = project_hash(path1, path2)
    projects[hash][attribute] = value

    write_projects(projects)


def unset_attribute(path1, path2, attribute):
    projects = read_projects()
    hash = project_hash(path1, path2)

    if hash not in projects or attribute not in projects[hash]:
        return
        
    del projects[hash][attribute]
    write_projects(projects)


def projects_with_attribute(attribute):
    projects = read_projects()
    return [projects[hash] for hash in projects if attribute in projects[hash]]


def get_attribute_value(path1, path2, attribute):
    hash = project_hash(path1, path2)
    try:
        attribute_value = read_projects()[hash][attribute]
        return attribute_value
    except KeyError:
        return