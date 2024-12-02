from flask import Flask, request, jsonify
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)

# 确保results目录存在
RESULTS_DIR = 'results'
if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/css/<path:path>')
def send_css(path):
    return app.send_static_file(f'css/{path}')

@app.route('/js/<path:path>')
def send_js(path):
    return app.send_static_file(f'js/{path}')

@app.route('/save-results', methods=['POST'])
def save_results():
    try:
        data = request.json
        
        # 准备保存的数据
        result_row = {
            'timestamp': data['timestamp'],
            'experimenter_id': data['experimenterId'],
            # Big5 结果
            'extraversion': data['big5Results']['extraversion'],
            'agreeableness': data['big5Results']['agreeableness'],
            'conscientiousness': data['big5Results']['conscientiousness'],
            'neuroticism': data['big5Results']['neuroticism'],
            'openness': data['big5Results']['openness'],
            # VARK 结果
            'visual': data['varkResults']['visual'],
            'audio': data['varkResults']['audio'],
            'reading': data['varkResults']['reading'],
            'kinaesthetic': data['varkResults']['kinaesthetic']
        }

        # 创建或追加到CSV文件
        csv_file = os.path.join(RESULTS_DIR, 'survey_results.csv')
        
        if os.path.exists(csv_file):
            # 读取现有数据
            df = pd.read_csv(csv_file)
            # 使用concat替代append
            df = pd.concat([df, pd.DataFrame([result_row])], ignore_index=True)
        else:
            # 创建新的DataFrame
            df = pd.DataFrame([result_row])
        
        # 保存到CSV
        df.to_csv(csv_file, index=False)

        return jsonify({'status': 'success', 'message': 'Results saved successfully'})

    except Exception as e:
        # 添加错误日志
        print(f"Error saving results: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 