"""
Example API client for DocNova PDF Tools Backend
Shows how to use the backend from the React frontend or any client
"""

import requests
import json

BASE_URL = "http://localhost:5000"

class PDFToolsClient:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
    
    def health_check(self):
        """Check if backend is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def merge_pdfs(self, pdf_files):
        """
        Merge multiple PDFs
        Args: pdf_files - list of file paths
        """
        try:
            files = [('files', open(f, 'rb')) for f in pdf_files]
            response = requests.post(f"{self.base_url}/api/merge-pdf", files=files)
            
            for _, f in files:
                f.close()
            
            if response.status_code == 200:
                with open("merged.pdf", "wb") as output:
                    output.write(response.content)
                return {"success": True, "file": "merged.pdf"}
            else:
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def compress_pdf(self, pdf_file):
        """Compress PDF file"""
        try:
            with open(pdf_file, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{self.base_url}/api/compress-pdf", files=files)
            
            if response.status_code == 200:
                with open("compressed.pdf", "wb") as output:
                    output.write(response.content)
                return {"success": True, "file": "compressed.pdf"}
            else:
                return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def split_pdf(self, pdf_file):
        """Split PDF into individual pages"""
        try:
            with open(pdf_file, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{self.base_url}/api/split-pdf", files=files)
            
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def pdf_to_jpg(self, pdf_file):
        """Convert PDF to JPG images"""
        try:
            with open(pdf_file, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{self.base_url}/api/pdf-to-jpg", files=files)
            
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def jpg_to_pdf(self, image_files):
        """Convert JPG images to PDF"""
        try:
            files = [('files', open(f, 'rb')) for f in image_files]
            response = requests.post(f"{self.base_url}/api/jpg-to-pdf", files=files)
            
            for _, f in files:
                f.close()
            
            if response.status_code == 200:
                with open("images.pdf", "wb") as output:
                    output.write(response.content)
                return {"success": True, "file": "images.pdf"}
            else:
                return response.json()
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    client = PDFToolsClient()
    
    # Test health check
    print("Health Check:", client.health_check())
    
    # Example usage:
    # result = client.merge_pdfs(["file1.pdf", "file2.pdf"])
    # print(result)
