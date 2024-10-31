module.exports = {
  apps: [
    {
      name: "frontend-deve",
      cwd: "./frontend",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
    },
    {
      name: "frontend-prod",
      cwd: "./frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "backend-deve",
      cwd: "./backend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "development",
        PORT: 1339,
      },
    },
    {
      name: "backend-prod",
      cwd: "./backend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 1338,
      },
    },
    {
      name: "ai-agent-deve",
      cwd: "./ai_agent/rag_chatbot",
      script:
        "/root/lets/WingHeights/wingheights/ai_agent/rag_chatbot/venv/bin/python",
      args: "model_1.py",
      env: {
        FLASK_ENV: "development",
        FLASK_APP: "model_1.py",
        PORT: 5002,
      },
    },
    {
      name: "ai-agent-prod",
      cwd: "/root/test/WingHeights/wingheights/ai_agent/rag_chatbot",
      script: "/bin/bash",
      args: [
        "-c",
        "source venv/bin/activate && exec gunicorn model_1:app --bind 0.0.0.0:5001 --workers 3 --timeout 120",
      ],
      env: {
        FLASK_ENV: "production",
        FLASK_APP: "model_1.py",
        PORT: 5001,
        PYTHONPATH: "/root/test/WingHeights/wingheights/ai_agent/rag_chatbot",
      },
      error_log:
        "/root/test/WingHeights/wingheights/ai_agent/rag_chatbot/error.log",
      out_log:
        "/root/test/WingHeights/wingheights/ai_agent/rag_chatbot/out.log",
    },
  ],
};
