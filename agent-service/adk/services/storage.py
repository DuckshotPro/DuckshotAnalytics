
import psycopg2
import os

class Storage:
    def __init__(self):
        self.conn = psycopg2.connect(os.environ["DATABASE_URL"])

    def get_user(self, user_id: int):
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return cur.fetchone()

    def save_snapchat_data(self, user_id: int, data: dict):
        with self.conn.cursor() as cur:
            cur.execute("INSERT INTO snapchat_data (user_id, data) VALUES (%s, %s)", (user_id, data))
            self.conn.commit()

    def save_ai_insight(self, user_id: int, insight: str):
        with self.conn.cursor() as cur:
            cur.execute("INSERT INTO ai_insights (user_id, insight) VALUES (%s, %s)", (user_id, insight))
            self.conn.commit()

storage = Storage()
