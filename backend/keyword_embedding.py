from sentence_transformers import SentenceTransformer
import sys
import json


# Load model once (MiniLM, 384-dim)
model = SentenceTransformer("all-MiniLM-L6-v2")

if len(sys.argv) < 2:
    print(json.dumps({"error": "Please provide a keyword string"}))
    sys.exit(1)

# Keyword string from command line
keywords = sys.argv[1]

# Generate embedding
embedding = model.encode(keywords).tolist()

# Print as JSON so Node.js can parse
print(json.dumps(embedding))
