# AI Autocorrect Tool

This is a Flask-based web application that provides smart spelling, grammar, and fluency correction using AI models.

## Features

- Spelling correction using a Hugging Face sequence-to-sequence model.
- Grammar correction using a T5 model downloaded via KaggleHub.
- Web interface for inputting text and viewing corrected output.
- Correction history saved in the browser's local storage.
- Clear and user-friendly UI with input, output, and history sections.

## Installation

1. Clone the repository.
2. Create and activate a Python virtual environment.
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the Flask app:
   ```
   python autocorrect_app/app.py
   ```

## Usage

- Open your browser and navigate to `http://localhost:5000`.
- Enter or paste text in the input box.
- Click the "Correct" button to get spelling, grammar, and fluency corrections.
- View the corrected text and correction history on the page.
- Use the "Clear" button to clear the input and output fields.

## File Structure

- `app.py`: Main Flask application with routes and AI model integration.
- `templates/index.html`: HTML template for the web interface.
- `static/script.js`: JavaScript for frontend interaction and API calls.
- `static/style.css`: CSS styles for the UI.

## Dependencies

- Flask
- Transformers (Hugging Face)
- Torch
- KaggleHub

## Notes

- The app loads AI models on startup; this may take some time.
- Correction history is stored locally in the browser and limited to 20 entries.
- The app runs on port 5000 by default.

## License

MIT License

## Author

AI Autocorrect Tool © 2025
