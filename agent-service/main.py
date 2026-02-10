
from flask import Flask, request, jsonify
from agents import OrchestratorAgent

app = Flask(__name__)

@app.route("/run-agent-workflow", methods=["POST"])
def run_agent_workflow():
    data = request.get_json()
    user_id = data.get("userId")

    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    try:
        orchestrator = OrchestratorAgent()
        result = orchestrator.run(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
