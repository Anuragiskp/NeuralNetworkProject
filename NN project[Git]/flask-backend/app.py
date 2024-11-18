from flask import Flask, request, jsonify
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Load the specific checkpoint of the model
checkpoint_dir = "./Trained_model"  # Replace with your checkpoint path
model = GPT2LMHeadModel.from_pretrained(checkpoint_dir)

# Reinitialize the tokenizer
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")  # Use base GPT-2 tokenizer
tokenizer.pad_token = tokenizer.eos_token

# Move the model to the appropriate device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Function to generate text
def generate_text(prompt, max_length=50):
    inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)
    outputs = model.generate(
        inputs,
        max_length=max_length,
        num_return_sequences=1,
        no_repeat_ngram_size=2,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=0.7
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Define an endpoint to handle requests
@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Parse input JSON from React frontend
        data = request.json
        prompt = data.get('prompt', '')  # Get the prompt from the request
        max_length = data.get('max_length', 200)  # Default max_length is 50

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # Generate text
        generated_text = generate_text(prompt, max_length=max_length)

        # Return the generated text as a JSON response
        return jsonify({"generated_text": generated_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
