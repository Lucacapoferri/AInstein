from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse
from google.adk.tools.base_tool import BaseTool
from google.adk.tools.tool_context import ToolContext
from typing import Optional, Dict, Any
from google.adk.tools import google_search
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json


import imaplib
import email
from email.header import decode_header
from dotenv import load_dotenv
import os


def get_latest_emails(n: int = 5) -> str:
    """Returns the last n received emails starting with 'Re:' or 'R:' in the subject."""

    load_dotenv()

    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(os.getenv("EMAIL"), os.getenv("PASSWORD"))
    mail.select("inbox")

    _, data = mail.search(None, 'OR SUBJECT "Re:" SUBJECT "R:"')
    ids = data[0].split()[-n:]

    def clean_subject(subject_raw):
        subject, encoding = decode_header(subject_raw)[0]
        if isinstance(subject, bytes):
            return subject.decode(encoding or "utf-8")
        return subject

    result = []
    for eid in ids:
        res, msg_data = mail.fetch(eid, "(RFC822)")
        msg = email.message_from_bytes(msg_data[0][1])
        subject = clean_subject(msg["Subject"])
        sender = msg["From"]
        result.append(f"From: {sender}\nSubject: {subject}")

    return "\n\n".join(result)



database_vectors_path = os.path.join(os.path.dirname(__file__), "../server/tfidf_vectors.json")
json_file = os.path.join(os.path.dirname(__file__),"../server/documents.json")


def DocumentSearchTool(query: list[str]):
    """
    Compare query to precomputed TF-IDF vectors of database entries.

    Args:
        vectorizer: A fitted TfidfVectorizer.
        database_vectors: TF-IDF matrix of the database (already transformed).
        query: The input query string.
        database: List of original database entries.

    Returns:
        List of tuples (entry, similarity_score), sorted by similarity.
    """ 

    # Load the database entries
    try:
        with open(json_file, 'r') as f:
            documents = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {json_file}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {json_file}")
        return 
    
    try:
        with open(database_vectors_path, 'r') as f:
            database_vectors = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {database_vectors_path}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {database_vectors_path}")
        return 

    # Vectorize the query using the same fitted vectorizer
    vectorizer = TfidfVectorizer(max_df=0.8, min_df=5, stop_words='english')
    vectorizer.fit(documents)
    query_vector = vectorizer.transform([query])
    print("----vectorized query----")

    # Compute cosine similarity between the query and database vectors
    similarities = cosine_similarity(query_vector, database_vectors).flatten()

    # Sort by similarity score (highest first)
    similar_indices = similarities.argsort()[::-1][:6]

    # Return entries with their corresponding similarity score
    return [(documents[i], similarities[i]) for i in similar_indices]




# Root agent for orchestration
root_agent = Agent(
    name="email_root_agent_v2",
    model="gemini-2.0-flash-001",
    description="Main email assistant agent: interacts politely and clearly with the user, manages email classification, response, and retrieval of relevant documents.",
    #instruction=("use the 'DocumentSearchTool' to find pertinent documents. Provide the found documents to the user"),
    instruction=("Always be polite and clear in your responses to the user. When you receive a new email from the user: 1. **Classify the email** using zero, one, or more of the following labels relevant to its content: (important), (work), (family), (deadline), (meeting). Clearly return the classification to the user. 2. **Respond to the email** as comprehensively and helpfully as possible, based on the email content. 3. **Search for relevant documents:** If you believe the email content could be enriched by information in documents, use the 'DocumentSearchTool' to find pertinent documents. Provide the found documents to the user along with your response, briefly explaining their relevance. If the user's request is not a new email but a specific question or instruction, respond politely and clearly, using 'DocumentSearchTool' if necessary to provide additional information."),
    tools=[DocumentSearchTool],
    #sub_agents=[],
    output_key="email_assistant_output",
)

"""
"Always be polite and clear in your responses to the user."
        "When you receive a new email from the user:"
        "1. **Classify the email** using zero, one, or more of the following labels relevant to its content: (important), (work), (family), (deadline), (meeting). Clearly return the classification to the user."
        "2. **Respond to the email** as comprehensively and helpfully as possible, based on the email content."
        "3. **Search for relevant documents:** If you believe the email content could be enriched by information in documents, use the 'DocumentSearchTool' to find pertinent documents. Provide the found documents to the user along with your response, briefly explaining their relevance."
        "If the user's request is not a new email but a specific question or instruction, respond politely and clearly, using 'DocumentSearchTool' if necessary to provide additional information."
   """