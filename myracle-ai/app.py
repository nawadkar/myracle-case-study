import streamlit as st
from PIL import Image
import io
import base64
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from langchain.output_parsers import PydanticOutputParser
import json
import re
import csv
import pandas as pd

class TestStep(BaseModel):
    step_count: int = Field(..., description="The step number of the test case.")
    step_description: str = Field(..., description="The description of the test step.")

class Feature(BaseModel):
    description: str = Field(description="What the test case is about.")
    pre_conditions: str = Field(description="What needs to be set up or ensured before testing.")
    testing_steps: List[TestStep] = Field(description="Clear, step-by-step instructions on how to perform the test.")
    expected_result: str = Field(description="The expected result of the feature")

    def show(self):
        st.markdown(f"**Description:** {self.description}")
        st.markdown(f"**Pre-conditions:** {self.pre_conditions}")
        st.markdown("**Testing Steps:**")
        for step in self.testing_steps:
            st.markdown(f"    Step {step.step_count}: {step.step_description}")
        st.markdown(f"**Expected Result:** {self.expected_result}")
        st.markdown("---")  # Add a separator between features

class FeatureList(BaseModel):
    features: List[Feature]
     
    def show(self):
        for i, feature in enumerate(self.features, 1):
            st.subheader(f"Feature {i}:")
            feature.show()

    def to_dict(self):
        return {"features": [feature.dict() for feature in self.features]}

    def to_csv(self):
        rows = []
        for i, feature in enumerate(self.features, 1):
            base_row = {
                "Feature Number": i,
                "Description": feature.description,
                "Pre-conditions": feature.pre_conditions,
                "Expected Result": feature.expected_result
            }
            for step in feature.testing_steps:
                row = base_row.copy()
                row.update({
                    "Step Number": step.step_count,
                    "Step Description": step.step_description
                })
                rows.append(row)
        return pd.DataFrame(rows)

# Initialize Gemini API
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

def encode_image(image_file):
    return base64.b64encode(image_file.getvalue()).decode('utf-8')

def clean_response(response):
    # Find the first occurrence of a valid JSON object
    match = re.search(r'\{.*\}', response, re.DOTALL)
    if match:
        return match.group(0)
    return response

def generate_test_instructions(images, context=None):
    # Add error handling for empty images
    if not images:
        raise ValueError("No images provided")
        
    image_parts = [
        {
            "mime_type": "image/jpeg",
            "data": encode_image(img)
        } for img in images
    ]
    
    parser = PydanticOutputParser(pydantic_object=FeatureList)
    format_instructions = parser.get_format_instructions()

    prompt = f"""You are an AI assistant that generates detailed and professional testing instructions for digital products.
    You will be given {len(images)} screenshots showing different features of a digital product.
    Please analyze each image carefully and generate comprehensive testing instructions.
    Focus on user interactions, edge cases, and validation checks.

    The response should be in JSON format. \n {format_instructions}
    """

    if context:
        prompt += f"\nContext: {context}"
    
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = model.generate_content([prompt] + image_parts)
    results = clean_response(response.text)
    return results

st.title("Digital Product Testing Instructions Generator")

uploaded_files = st.file_uploader("Upload screenshots of the features", 
                                  type=["png", "jpg", "jpeg"], 
                                  accept_multiple_files=True)
context = st.text_area("Provide any additional context about the features (optional)")

if uploaded_files:
    for file in uploaded_files:
        image = Image.open(file)
        st.image(image, caption=f"Uploaded Screenshot: {file.name}", use_column_width=True)
    
    if st.button("Generate Testing Instructions"):
        if len(uploaded_files) < 5 or len(uploaded_files) > 10:
            st.warning("Please upload between 5 and 10 screenshots.")
        else:
            with st.spinner("Generating testing instructions..."):
                response = generate_test_instructions(uploaded_files, context)
                try:
                    feature_list = FeatureList.parse_raw(response)
                    feature_list.show()

                    # Add download buttons
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        json_str = json.dumps(feature_list.to_dict(), indent=2)
                        st.download_button(
                            label="Download JSON",
                            data=json_str,
                            file_name="test_instructions.json",
                            mime="application/json"
                        )
                    
                    with col2:
                        csv = feature_list.to_csv().to_csv(index=False)
                        st.download_button(
                            label="Download CSV",
                            data=csv,
                            file_name="test_instructions.csv",
                            mime="text/csv"
                        )

                except json.JSONDecodeError as e:
                    st.error(f"Error: Unable to parse the generated instructions. Details: {str(e)}")
                    st.text("Raw response:")
                    st.text(response)
                except Exception as e:
                    st.error(f"An error occurred: {str(e)}")
                    st.text("Raw response:")
                    st.text(response)


# # Feature 1:
# #     Description: 
# #     Preconditions:
# #     Testing Steps: 
# #         Step 1: 
# #         Step 2: 
# #     Expected Result: 

# # Feature 2:
# #     Description: 
# #     Preconditions:
# #     Testing Steps: 
# #         Step 1: 
# #         Step 2: 
# #         Step 3: 
# #     Expected Result: 
