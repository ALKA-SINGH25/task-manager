from pymongo import MongoClient
import os
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()
db = MongoClient(os.getenv('MONGODB_URL'))[os.getenv('DATABASE_NAME')]

def fix_database():
    tasks = list(db.tasks.find())
    
    # We will build connected components of tasks.
    # Two tasks are connected if they share the same task_group_id OR the same (user_id, base_title)
    # We'll strip " updated" or similar suffixes to group titles better if needed, 
    # but exact title match is safer for now. We know "hey updated" shares task_group_id with "hey" so they will connect!
    
    adj = defaultdict(list)
    
    # Create nodes
    for i, t in enumerate(tasks):
        # connect to all other tasks that share task_group_id or (user_id, title)
        for j, other in enumerate(tasks):
            if i == j: continue
            
            same_group = t.get('task_group_id') == other.get('task_group_id')
            same_title_user = (t.get('user_id') == other.get('user_id') and t.get('title') == other.get('title'))
            
            if same_group or same_title_user:
                adj[i].append(j)
                adj[j].append(i)
                
    visited = set()
    components = []
    for i in range(len(tasks)):
        if i not in visited:
            comp = []
            q = [i]
            visited.add(i)
            while q:
                curr = q.pop(0)
                comp.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        q.append(neighbor)
            components.append(comp)
            
    print(f"Found {len(components)} unique task groups.")
    
    for comp in components:
        comp_tasks = [tasks[i] for i in comp]
        
        # Sort by updated_at or created_at
        comp_tasks.sort(key=lambda x: x.get('updated_at') or x.get('created_at'))
        
        master_tg_id = comp_tasks[0].get('task_group_id') or str(comp_tasks[0]['_id'])
        
        for i, t in enumerate(comp_tasks):
            version = i + 1
            is_latest = (i == len(comp_tasks) - 1)
            
            db.tasks.update_one(
                {"_id": t["_id"]},
                {
                    "$set": {
                        "task_group_id": master_tg_id,
                        "version": version,
                        "is_latest": is_latest
                    }
                }
            )
            
    print("Database grouped, versions reset, and latest flags updated.")

if __name__ == "__main__":
    fix_database()
