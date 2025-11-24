import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os

def upload_data():
    # .env 파일 로드 (상위 폴더의 server/.env 경로 지정)
    load_dotenv(dotenv_path='../server/.env')
    
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        print("오류: MONGODB_URI를 찾을 수 없습니다. .env 파일을 확인하세요.")
        return

    try:
        client = MongoClient(MONGODB_URI)
        db = client.get_database('WebFrameworkProject') # DB 이름 확인
        collection = db.customers

        # CSV 파일 읽기 (경로 주의)
        csv_path = '../Web Framework Project/public/data.csv'
        df = pd.read_csv(csv_path)

        # 숫자 데이터 변환 (문자열 -> 숫자)
        df['visit_days'] = pd.to_numeric(df['visit_days'], errors='coerce').fillna(0)
        df['total_payment_may'] = pd.to_numeric(df['total_payment_may'], errors='coerce').fillna(0)
        
        # 데이터프레임을 딕셔너리 리스트로 변환
        data_json = df.to_dict('records')

        # 기존 데이터 삭제 후 새 데이터 삽입 (중복 방지)
        collection.delete_many({})
        result = collection.insert_many(data_json)
        
        print(f"성공: {len(result.inserted_ids)}개의 데이터를 MongoDB에 업로드했습니다.")

    except FileNotFoundError:
        print(f"오류: '{csv_path}' 파일을 찾을 수 없습니다. 경로를 확인하세요.")
    except Exception as e:
        print(f"MongoDB 업로드 중 오류 발생: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    upload_data()
