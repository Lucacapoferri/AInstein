import json
import os
from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer

def compute_tfidf_from_json(json_file: str, output_file: str):
    """
    Reads documents from a JSON file, computes TF-IDF vectors,
    and saves them to another JSON file.

    Args:
        json_file: Path to the JSON file containing the documents.
        output_file: Path to the file where the TF-IDF vectors will be saved.
    """
    try:
        with open(json_file, 'r') as f:
            documents = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {json_file}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {json_file}")
        return

    contents = [doc.get("content") for doc in documents if isinstance(doc, dict) and "content" in doc]
    doc_ids = [doc.get("name") for doc in documents if isinstance(doc, dict) and "name" in doc]

    if not contents:
        print("No document content found.")
        return

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(contents)
    tfidf_vectors: Dict[str, List[float]] = {}

    for i, doc_id in enumerate(doc_ids):
        vector = tfidf_matrix.getrow(i).toarray().flatten().tolist()
        tfidf_vectors[doc_id] = vector

    output_path = os.path.join(os.path.dirname(__file__), output_file)
    with open(output_path, 'w') as f:
        json.dump(tfidf_vectors, f, indent=2)

    print(f"Saved TF-IDF vectors for {len(tfidf_vectors)} documents to {output_path}")

if __name__ == "__main__":
    compute_tfidf_from_json("documents.json", "tfidf_vectors.json")