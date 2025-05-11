import os
import json
from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import re

#from your_module_path import MemStorage  # Adjust this import path

#storage = MemStorage()



def compute_tfidf_vectors_for_documents(user_id: int, output_file: str):
    """
    Computes TF-IDF vectors for documents of a given user and saves them to a JSON file.

    Args:
        user_id: The ID of the user whose documents to process.
        output_file: The path to the file where the TF-IDF vectors will be saved.
    """
    
    database_path = os.path.join(os.path.dirname(__file__), "storage.ts")
    #with open(database_path, 'rb') as f:
    #    database = json.load(f)
    '''
    with open("storage.ts", "r", encoding="utf-8") as f:
        database = f.read()

    documents = database.get_documents(user_id)  # Assuming returns a list of Document objects
    contents = [doc.content for doc in documents]
    doc_ids = [doc.id for doc in documents]
    '''


    with open("storage.ts", "r", encoding="utf-8") as f:
        storage = f.read()
    #print(storage)
    # Extract the contents of the documents array
    match = re.search(r"export const documents\s*=\s*(\[[\s\S]*?\]);", storage)

    if match:
        documents_str = match.group(1)

    # Make TypeScript into valid JSON (quotes around keys, etc.)
    json_compatible = re.sub(r"(\w+):", r'"\1":', documents_str)  # quote keys
    json_compatible = json_compatible.replace("'", '"')            # single to double quotes

    try:
        documents = json.loads(json_compatible)
        print("Extracted documents:", documents)
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
    else:
        print("No documents array found.")
    tfidf_vectors: Dict[int, List[float]] = {}

    if not contents:
        print(f"No documents found for user ID: {user_id}")
        return

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(contents)

    # Convert the TF-IDF matrix (sparse) to a dictionary of lists
    for i, doc_id in enumerate(doc_ids):
        vector = tfidf_matrix.getrow(i).toarray().flatten().tolist()
        tfidf_vectors[doc_id] = vector

    with open(output_file, "w") as f:
        json.dump(tfidf_vectors, f, indent=2)

    print(f"Saved TF-IDF vectors for {len(tfidf_vectors)} documents to {output_file}")


compute_tfidf_vectors_for_documents(user_id=1, output_file="tfidf_vectors.json")