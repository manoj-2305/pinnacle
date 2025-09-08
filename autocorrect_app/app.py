from flask import Flask, render_template, request, jsonify
import os, time, logging
import kagglehub
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Globals
spell_tokenizer = None
spell_model = None
grammar_tokenizer = None
grammar_model = None

def init_models():
    global spell_tokenizer, spell_model, grammar_tokenizer, grammar_model
    try:
        # ---------------- SPELLING MODEL (HF small seq2seq) ---------------- #
        spell_model_id = "oliverguhr/spelling-correction-english-base"
        logger.info(f"Loading spelling model: {spell_model_id}")
        spell_tokenizer = AutoTokenizer.from_pretrained(spell_model_id)
        spell_model = AutoModelForSeq2SeqLM.from_pretrained(spell_model_id)

        # ---------------- GRAMMAR MODEL (T5 via KaggleHub) ---------------- #
        logger.info("Downloading grammar model from KaggleHub...")
        path = kagglehub.model_download(
            "nezahatkk/english-grammar-correction-t5-model/transformers/default"
        )
        logger.info(f"Grammar model downloaded to: {path}")

        grammar_tokenizer = AutoTokenizer.from_pretrained(path)
        grammar_model = AutoModelForSeq2SeqLM.from_pretrained(path)

        logger.info("All models loaded successfully.")

    except Exception as e:
        logger.error(f"Error loading models: {e}")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/correct', methods=['POST'])
def correct_text():
    try:
        data = request.get_json() or {}
        text = data.get("text", "").strip()
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Step 1: Spelling correction
        spelling = correct_spelling(text)

        # Step 2: Grammar correction
        grammar = correct_grammar(spelling)

        # Step 3: Fluency = grammar output
        fluency = grammar

        result = {
            "original": text,
            "spelling_corrected": spelling,
            "grammar_corrected": grammar,
            "fluency_improved": fluency,
            "timestamp": time.time()
        }
        return jsonify(result)

    except Exception as e:
        logger.exception("Error in /correct route")
        return jsonify({'error': str(e)}), 500

def correct_spelling(text: str) -> str:
    """Spell correction using HF seq2seq model"""
    try:
        if not spell_model or not spell_tokenizer:
            return text
        inputs = spell_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outs = spell_model.generate(
                **inputs, max_length=128, num_beams=4, early_stopping=True
            )
        corrected = spell_tokenizer.decode(outs[0], skip_special_tokens=True)
        return corrected
    except Exception as e:
        logger.error(f"Spelling correction failed: {e}")
        return text

def correct_grammar(text: str) -> str:
    """Grammar correction using T5 model"""
    try:
        if not grammar_model or not grammar_tokenizer:
            return text
        inputs = grammar_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outs = grammar_model.generate(
                **inputs, max_length=128, num_beams=4, early_stopping=True
            )
        corrected = grammar_tokenizer.decode(outs[0], skip_special_tokens=True)
        return corrected
    except Exception as e:
        logger.error(f"Grammar correction failed: {e}")
        return text

if __name__ == "__main__":
    init_models()
    app.run(debug=True, host="0.0.0.0", port=5000)
