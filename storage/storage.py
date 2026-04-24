import os
from datetime import datetime
import json
import hashlib
from pathlib import Path


SCRIPT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PROJECTS_JSON =  os.path.normpath(f'{SCRIPT_DIRECTORY}/projects.json')


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


def get_project_attributes(path1, path2, projects = None):
    hash = project_hash(path1, path2)

    if not projects:
        projects = read_projects()

    if hash in projects:
        attributes = projects[hash]
        attributes = {key: value for key, value in attributes.items()
                      if key not in ['path1', 'path2']}
    else:
        attributes = {}
    
    print(attributes)
    return attributes


def write_projects(projects):
    with open(PROJECTS_JSON, 'w') as file:
        json.dump(projects, file, indent=4)


def project_hash(path1, path2):
    path1 = Path(path1).as_posix()
    path2 = Path(path2).as_posix()

    combined = f'{path1}||{path2}'

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


def set_attribute(path1, path2, attribute, value, set_date=True):
    projects = add_project_to_json(path1, path2, return_projects=True)
    hash = project_hash(path1, path2)
    projects[hash][attribute] = value

    if set_date:
        projects[hash][attribute+'_date'] = datetime.now().strftime("%d.%m.%Y")

    write_projects(projects)


def unset_attribute(path1, path2, attribute, unset_langs=True, unset_date=True):
    projects = read_projects()
    hash = project_hash(path1, path2)

    if hash not in projects or attribute not in projects[hash]:
        return

    del projects[hash][attribute]
    
    if unset_langs:
        for index in ['1', '2']:
            date_attribute = 'lang' + index
            if date_attribute in projects[hash]:
                del projects[hash][date_attribute]
    
    if unset_date:
        date_attribute = attribute+'_date'

        if date_attribute in projects[hash]:
            del projects[hash][date_attribute]

    other_attributes = get_project_attributes(path1, path2, projects)
    if not other_attributes:
        del projects[hash]

    write_projects(projects)


def projects_with_attribute(attribute):
    projects = read_projects()
    selected_projects = [projects[hash] for hash in projects if attribute in projects[hash]]
    
    return sorted(
        selected_projects,
        key=lambda x: -datetime.strptime(x[attribute+'_date'], '%d.%m.%Y').timestamp()
        if x.get('bookmark_date')
        else datetime.now().timestamp(),
    )


def get_attribute_value(path1, path2, attribute):
    hash = project_hash(path1, path2)
    try:
        attribute_value = read_projects()[hash][attribute]
        return attribute_value
    except KeyError:
        return


def remove_alignments():
    for item in os.listdir(SCRIPT_DIRECTORY):
        item_folder = f'{SCRIPT_DIRECTORY}/{item}'
        if os.path.isdir(item_folder):
            for item_file in os.listdir(item_folder):
                if item_file in ['alignment.db', 'alignment_0.png']:
                    os.remove(f'{item_folder}/{item_file}')


def remove_empty_folders():
    for item in os.listdir(SCRIPT_DIRECTORY):
        item_folder = f'{SCRIPT_DIRECTORY}/{item}'
        if os.path.isdir(item_folder) and not os.listdir(item_folder):
            os.rmdir(item_folder)


def garbage_collection():
    remove_alignments()
    remove_empty_folders()