import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Configure logging to display debug messages
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Load threshold from environment variable or default to -0.5
THRESHOLD = float(os.getenv("STRESS_THRESHOLD", -0.5))

# Initialize the VADER sentiment analyzer once at startup
analyzer = SentimentIntensityAnalyzer()
logging.info("VADER sentiment analyzer initialized.")

def analyze_sentiment(text):
    # Get sentiment scores from VADER
    scores = analyzer.polarity_scores(text)
    compound = scores.get('compound', 0)
    
    # Log the input and the computed scores
    logging.debug("Input: %s | Scores: %s | Compound: %.2f", text, scores, compound)
    
    # Determine stress level: "High" if compound score is below threshold, otherwise "Low"
    stress_level = "High" if compound < THRESHOLD else "Low"
    return compound, stress_level

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    user_text = data.get('text', '').strip()
    if not user_text:
        return jsonify({'error': 'No text provided'}), 400

    compound, stress_level = analyze_sentiment(user_text)
    
    # Build remedy suggestions based on stress level
    remedies = []
    if stress_level == "High":
        remedies.extend([
            "Take a short break and try a guided meditation.",
            "Practice some Vedic exercises or deep breathing techniques.",
            "Break your workload into smaller, prioritized tasks.",
            "Consider a mindfulness session to regain focus."
        ])
    else:
        remedies.extend([
            "Keep up the good work with periodic mindfulness checks.",
            "Maintain a balanced schedule with regular short breaks.",
            "Continue monitoring your workload to stay organized."
        ])

    response = {
        'input_text': user_text,
        'compound_score': compound,  # renamed for clarity
        'stress_level': stress_level,
        'remedies': remedies
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
