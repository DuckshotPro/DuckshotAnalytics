
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel('gemini-pro')

def generate_ai_insight(snapchat_data: dict) -> str:
    prompt = f"Analyze the following Snapchat data and generate a short, actionable insight:\n\n{snapchat_data}"

    response = model.generate_content(prompt)

    return response.text
